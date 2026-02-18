import { Component, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AIResult {
  participant_id: number;
  value: string | number;
  name: string;
}

@Component({
  selector: 'app-ai-review-modal',
  templateUrl: './ai-review-modal.html',
  imports: [FormsModule],
})
export class AiReviewModal {
  imageUrl = input.required<string>();
  results = input.required<AIResult[]>();

  confirm = output<AIResult[]>();
  discard = output<void>();

  editableResults = signal<AIResult[]>([]);

  constructor() {
    effect(() => {
      this.editableResults.set(this.results().map((r) => ({ ...r })));
    });
  }

  updateValue(index: number, value: string): void {
    this.editableResults.update((results) =>
      results.map((r, i) => (i === index ? { ...r, value } : r)),
    );
  }

  onConfirm(): void {
    this.confirm.emit(this.editableResults());
  }

  onDiscard(): void {
    this.discard.emit();
  }
}
