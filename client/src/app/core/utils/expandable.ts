import { signal } from '@angular/core';

export function createExpandable<T = number>(initialExpanded?: T[]) {
  const expanded = signal<Set<T>>(new Set(initialExpanded ?? []));

  return {
    expanded: expanded.asReadonly(),
    toggle(id: T): void {
      expanded.update(set => {
        const next = new Set(set);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    },
    isExpanded(id: T): boolean {
      return expanded().has(id);
    },
    expandAll(ids: T[]): void {
      expanded.set(new Set(ids));
    },
  };
}
