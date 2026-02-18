import { Component, OnDestroy, OnInit, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { DiplomaFont, DiplomaItem, DiplomaTemplate, DynamicKey, FontWeight } from '../../core/models/diploma.model';
import { DiplomaService } from '../../events/diploma.service';

@Component({
  selector: 'app-diploma-editor',
  templateUrl: './diploma-editor.html',
  imports: [FormsModule, RouterLink, TranslocoPipe],
})
export class DiplomaEditor implements OnInit, OnDestroy {
  // ── Template state ──────────────────────────────────────────
  template     = signal<DiplomaTemplate | null>(null);
  items        = signal<DiplomaItem[]>([]);
  bgImageUrl   = signal('');
  orientation  = signal<'LANDSCAPE' | 'PORTRAIT'>('LANDSCAPE');
  fonts        = signal<DiplomaFont[]>([]);
  defaultFont  = signal<string>('');  // '' means use Helvetica (no Czech support)

  // ── UI state ─────────────────────────────────────────────────
  loading = signal(false);
  saving  = signal(false);

  // ── Mock values (preview only, never sent to backend) ────────
  mockName        = signal('Jan Novák');
  mockPlace       = signal(1);
  mockActivity    = signal('Skok do dálky');
  mockGender      = signal<'M' | 'F'>('M');
  mockAgeCategory = signal('U18');

  readonly dynamicKeys: DynamicKey[] = ['participant_name', 'place', 'activity', 'category'];
  readonly fontWeights: FontWeight[]  = ['normal', 'bold', 'italic'];

  eventId = 0;

  constructor(
    private route:    ActivatedRoute,
    private diplomaService: DiplomaService,
    private transloco: TranslocoService,
  ) {
    // Inject @font-face rules into <head> whenever the fonts list changes
    effect(() => {
      const fonts = this.fonts();
      const old = document.getElementById('diploma-font-styles');
      if (old) old.remove();
      if (fonts.length === 0) return;
      const style = document.createElement('style');
      style.id = 'diploma-font-styles';
      style.textContent = fonts
        .map(f => `@font-face { font-family: '${f.name}'; src: url('${f.data}'); }`)
        .join('\n');
      document.head.appendChild(style);
    });
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.diplomaService.getTemplate(this.eventId).subscribe({
      next: (t) => {
        this.template.set(t);
        this.bgImageUrl.set(t.bg_image_url ?? '');
        this.orientation.set(t.orientation);
        this.items.set(t.items.map(i => ({ ...i })));
        this.fonts.set(t.fonts ? t.fonts.map(f => ({ ...f })) : []);
        this.defaultFont.set(t.default_font ?? '');
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    document.getElementById('diploma-font-styles')?.remove();
  }

  // ── Background image ─────────────────────────────────────────
  onBgFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.bgImageUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  clearBg(): void {
    this.bgImageUrl.set('');
  }

  // ── Font management ──────────────────────────────────────────
  onFontUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^/.]+$/, ''); // strip extension
    const reader = new FileReader();
    reader.onload = () => {
      this.fonts.update(arr => [
        ...arr.filter(f => f.name !== name),
        { name, data: reader.result as string },
      ]);
    };
    reader.readAsDataURL(file);
    // Reset the input so same file can be re-uploaded
    (event.target as HTMLInputElement).value = '';
  }

  removeFont(name: string): void {
    this.fonts.update(arr => arr.filter(f => f.name !== name));
    // Reset items that used this font back to default
    this.items.update(arr =>
      arr.map(item => item.fontFamily === name ? { ...item, fontFamily: 'default' } : item)
    );
  }

  // ── Items ─────────────────────────────────────────────────────
  addItem(): void {
    this.items.update(arr => [
      ...arr,
      {
        type: 'DYNAMIC',
        key: 'participant_name',
        x: 50,
        y: 50,
        fontSize: 24,
        fontWeight: 'normal',
        color: '#000000',
        fontFamily: 'default',
      } as DiplomaItem,
    ]);
  }

  removeItem(index: number): void {
    this.items.update(arr => arr.filter((_, i) => i !== index));
  }

  updateItem(index: number, patch: Partial<DiplomaItem>): void {
    this.items.update(arr =>
      arr.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  // ── Preview text (uses mock values) ──────────────────────────
  previewText(item: DiplomaItem): string {
    if (item.type === 'STATIC') return item.text ?? '';
    switch (item.key) {
      case 'participant_name':
        return this.mockName();
      case 'place':
        return `${this.mockPlace()}.`;
      case 'activity':
        return this.mockActivity();
      case 'category': {
        const g = this.mockGender() === 'M'
          ? this.transloco.translate('LEADERBOARD.MEN')
          : this.transloco.translate('LEADERBOARD.WOMEN');
        return `${g} · ${this.mockAgeCategory()}`;
      }
      default:
        return `[${item.key}]`;
    }
  }

  previewFontFamily(item: DiplomaItem): string {
    return item.fontFamily && item.fontFamily !== 'default' ? item.fontFamily : 'inherit';
  }

  previewTransform(item: DiplomaItem): string {
    const parts: string[] = [];
    if (item.centerH) parts.push('translateX(-50%)');
    if (item.centerV) parts.push('translateY(-50%)');
    return parts.join(' ');
  }

  // ── Save / Delete ─────────────────────────────────────────────
  saveTemplate(): void {
    this.saving.set(true);
    const isNew = this.template() === null;
    const body = {
      bg_image_url: this.bgImageUrl() || null,
      orientation: this.orientation(),
      items: this.items(),
      fonts: this.fonts(),
      default_font: this.defaultFont() || null,
    };
    this.diplomaService.saveTemplate(this.eventId, body, isNew).subscribe({
      next: (t) => { this.template.set(t); this.saving.set(false); },
      error: ()  => this.saving.set(false),
    });
  }

  deleteTemplate(): void {
    if (!this.template()) return;
    this.diplomaService.deleteTemplate(this.eventId).subscribe({
      next: () => {
        this.template.set(null);
        this.items.set([]);
        this.fonts.set([]);
        this.defaultFont.set('');
        this.bgImageUrl.set('');
        this.orientation.set('LANDSCAPE');
      },
    });
  }
}
