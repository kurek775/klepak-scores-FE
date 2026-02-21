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
  templates           = signal<DiplomaTemplate[]>([]);
  selectedTemplateId  = signal<number | null>(null);

  items        = signal<DiplomaItem[]>([]);
  bgImageUrl   = signal('');
  orientation  = signal<'LANDSCAPE' | 'PORTRAIT'>('PORTRAIT');
  fonts        = signal<DiplomaFont[]>([]);
  defaultFont  = signal<string>('');
  templateName = signal<string>('');

  loading = signal(false);
  saving  = signal(false);

  mockName        = signal('Jan Novák');
  mockPlace       = signal(1);
  mockActivity    = signal('Skok do dálky');
  mockGender      = signal<'M' | 'F'>('M');
  mockAgeCategory = signal('U18');

  // Selection & collapse state
  selectedItemIndex = signal<number | null>(null);
  collapsedItems    = signal<Set<number>>(new Set());

  // Drag state (not signals — mutated imperatively during pointer events)
  private dragging = false;
  private dragItemIndex = -1;
  private dragStartPointer = { x: 0, y: 0 };
  private dragStartItemPos = { x: 0, y: 0 };
  private dragPreviewEl: HTMLElement | null = null;
  private boundPointerMove: ((e: PointerEvent) => void) | null = null;
  private boundPointerUp: ((e: PointerEvent) => void) | null = null;

  readonly dynamicKeys: DynamicKey[] = ['participant_name', 'place', 'activity', 'category'];
  readonly fontWeights: FontWeight[]  = ['normal', 'bold', 'italic'];

  eventId = 0;

  constructor(
    private route:    ActivatedRoute,
    private diplomaService: DiplomaService,
    private transloco: TranslocoService,
  ) {
    // Inject custom font @font-face rules
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

    // Scroll sidebar to selected card when selection changes
    effect(() => {
      const idx = this.selectedItemIndex();
      if (idx === null) return;
      // Use setTimeout to allow DOM to render first
      setTimeout(() => {
        const el = document.getElementById(`item-card-${idx}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
  }

  ngOnInit(): void {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.diplomaService.getTemplates(this.eventId).subscribe({
      next: (templates) => {
        this.templates.set(templates);
        if (templates.length > 0) {
          this._loadTemplate(templates[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    document.getElementById('diploma-font-styles')?.remove();
  }

  private _loadTemplate(t: DiplomaTemplate): void {
    this.selectedTemplateId.set(t.id);
    this.templateName.set(t.name);
    this.bgImageUrl.set(t.bg_image_url ?? '');
    this.orientation.set(t.orientation);
    this.items.set(t.items.map(i => ({ ...i })));
    this.fonts.set(t.fonts ? t.fonts.map(f => ({ ...f })) : []);
    this.defaultFont.set(t.default_font ?? '');
    this.selectedItemIndex.set(null);
    this.collapsedItems.set(new Set());
  }

  selectTemplate(t: DiplomaTemplate): void {
    this._loadTemplate(t);
  }

  addTemplate(): void {
    const n = this.templates().length + 1;
    const body = {
      name: `Template ${n}`,
      orientation: 'LANDSCAPE' as const,
      items: [],
      fonts: [],
      default_font: null,
      bg_image_url: null,
    };
    this.diplomaService.createTemplate(this.eventId, body).subscribe({
      next: (t) => {
        this.templates.update(arr => [...arr, t]);
        this._loadTemplate(t);
      },
    });
  }

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

  onFontUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^/.]+$/, '');
    const reader = new FileReader();
    reader.onload = () => {
      this.fonts.update(arr => [
        ...arr.filter(f => f.name !== name),
        { name, data: reader.result as string },
      ]);
    };
    reader.readAsDataURL(file);
    (event.target as HTMLInputElement).value = '';
  }

  removeFont(name: string): void {
    this.fonts.update(arr => arr.filter(f => f.name !== name));
    this.items.update(arr =>
      arr.map(item => item.fontFamily === name ? { ...item, fontFamily: 'default' } : item)
    );
  }

  // ── Item CRUD ──────────────────────────────────────────

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
    const newIdx = this.items().length - 1;
    this.selectedItemIndex.set(newIdx);
    // Ensure the new item is expanded
    this.collapsedItems.update(set => {
      const next = new Set(set);
      next.delete(newIdx);
      return next;
    });
  }

  removeItem(index: number): void {
    this.items.update(arr => arr.filter((_, i) => i !== index));

    // Adjust selectedItemIndex
    const sel = this.selectedItemIndex();
    if (sel !== null) {
      if (sel === index) {
        this.selectedItemIndex.set(null);
      } else if (sel > index) {
        this.selectedItemIndex.set(sel - 1);
      }
    }

    // Rebuild collapsedItems with shifted indices
    this.collapsedItems.update(set => {
      const next = new Set<number>();
      for (const i of set) {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
        // i === index is removed
      }
      return next;
    });
  }

  updateItem(index: number, patch: Partial<DiplomaItem>): void {
    this.items.update(arr =>
      arr.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  // ── Selection ──────────────────────────────────────────

  selectItem(index: number): void {
    this.selectedItemIndex.set(index);
  }

  deselectItem(): void {
    this.selectedItemIndex.set(null);
  }

  onPreviewBackgroundClick(): void {
    this.deselectItem();
  }

  // ── Collapse ───────────────────────────────────────────

  toggleItemCollapse(index: number): void {
    this.collapsedItems.update(set => {
      const next = new Set(set);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  isItemCollapsed(index: number): boolean {
    return this.collapsedItems().has(index);
  }

  // ── Duplicate ──────────────────────────────────────────

  duplicateItem(index: number): void {
    const source = this.items()[index];
    if (!source) return;
    const copy: DiplomaItem = {
      ...source,
      x: Math.min(100, source.x + 3),
      y: Math.min(100, source.y + 3),
    };
    this.items.update(arr => {
      const next = [...arr];
      next.splice(index + 1, 0, copy);
      return next;
    });

    // Shift collapsed indices after insertion point
    this.collapsedItems.update(set => {
      const next = new Set<number>();
      for (const i of set) {
        next.add(i > index ? i + 1 : i);
      }
      return next;
    });

    this.selectedItemIndex.set(index + 1);
  }

  // ── Reorder ────────────────────────────────────────────

  moveItem(index: number, direction: -1 | 1): void {
    const target = index + direction;
    const arr = this.items();
    if (target < 0 || target >= arr.length) return;

    // Swap items
    this.items.update(items => {
      const next = [...items];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

    // Swap collapsed state
    this.collapsedItems.update(set => {
      const next = new Set<number>();
      for (const i of set) {
        if (i === index) next.add(target);
        else if (i === target) next.add(index);
        else next.add(i);
      }
      return next;
    });

    // Follow the moved item with selection
    const sel = this.selectedItemIndex();
    if (sel === index) {
      this.selectedItemIndex.set(target);
    } else if (sel === target) {
      this.selectedItemIndex.set(index);
    }
  }

  // ── Drag on preview ────────────────────────────────────

  onItemPointerDown(event: PointerEvent, index: number, previewEl: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    this.selectItem(index);

    const item = this.items()[index];
    if (!item) return;

    this.dragging = true;
    this.dragItemIndex = index;
    this.dragStartPointer = { x: event.clientX, y: event.clientY };
    this.dragStartItemPos = { x: item.x, y: item.y };
    this.dragPreviewEl = previewEl;

    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);

    this.boundPointerMove = (e: PointerEvent) => this.onDragPointerMove(e);
    this.boundPointerUp = (e: PointerEvent) => this.onDragPointerUp(e);

    target.addEventListener('pointermove', this.boundPointerMove);
    target.addEventListener('pointerup', this.boundPointerUp);
    target.addEventListener('pointercancel', this.boundPointerUp);
  }

  private onDragPointerMove(event: PointerEvent): void {
    if (!this.dragging || !this.dragPreviewEl) return;

    const rect = this.dragPreviewEl.getBoundingClientRect();
    const dx = event.clientX - this.dragStartPointer.x;
    const dy = event.clientY - this.dragStartPointer.y;

    const percentDx = (dx / rect.width) * 100;
    const percentDy = (dy / rect.height) * 100;

    const newX = Math.round(Math.min(100, Math.max(0, this.dragStartItemPos.x + percentDx)) * 10) / 10;
    const newY = Math.round(Math.min(100, Math.max(0, this.dragStartItemPos.y + percentDy)) * 10) / 10;

    this.updateItem(this.dragItemIndex, { x: newX, y: newY });
  }

  private onDragPointerUp(event: PointerEvent): void {
    this.dragging = false;

    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);

    if (this.boundPointerMove) {
      target.removeEventListener('pointermove', this.boundPointerMove);
    }
    if (this.boundPointerUp) {
      target.removeEventListener('pointerup', this.boundPointerUp);
      target.removeEventListener('pointercancel', this.boundPointerUp);
    }
    this.boundPointerMove = null;
    this.boundPointerUp = null;
    this.dragPreviewEl = null;
  }

  // ── Helpers ────────────────────────────────────────────

  formatCoord(n: number): string {
    return n.toFixed(1);
  }

  itemLabel(item: DiplomaItem): string {
    if (item.type === 'DYNAMIC') return item.key ?? 'dynamic';
    const text = item.text ?? '';
    return text.length > 20 ? text.substring(0, 20) + '…' : text || 'static';
  }

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

  saveTemplate(): void {
    const templateId = this.selectedTemplateId();
    if (templateId === null) return;
    this.saving.set(true);
    const body = {
      name: this.templateName(),
      bg_image_url: this.bgImageUrl() || null,
      orientation: this.orientation(),
      items: this.items(),
      fonts: this.fonts(),
      default_font: this.defaultFont() || null,
    };
    this.diplomaService.updateTemplate(this.eventId, templateId, body).subscribe({
      next: (t) => {
        this.templates.update(arr => arr.map(x => x.id === t.id ? t : x));
        this.templateName.set(t.name);
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }

  deleteTemplate(): void {
    const templateId = this.selectedTemplateId();
    if (templateId === null) return;
    this.diplomaService.deleteTemplate(this.eventId, templateId).subscribe({
      next: () => {
        const remaining = this.templates().filter(t => t.id !== templateId);
        this.templates.set(remaining);
        if (remaining.length > 0) {
          this._loadTemplate(remaining[0]);
        } else {
          this.selectedTemplateId.set(null);
          this.templateName.set('');
          this.items.set([]);
          this.fonts.set([]);
          this.defaultFont.set('');
          this.bgImageUrl.set('');
          this.orientation.set('LANDSCAPE');
        }
      },
    });
  }
}
