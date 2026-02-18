import { TestBed } from '@angular/core/testing';
import { vi, afterEach, beforeEach } from 'vitest';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('success() adds a toast with type "success"', () => {
    service.success('It worked!');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('It worked!');
  });

  it('error() adds a toast with type "error"', () => {
    service.error('Something broke');
    expect(service.toasts()[0].type).toBe('error');
  });

  it('info() adds a toast with type "info"', () => {
    service.info('FYI');
    expect(service.toasts()[0].type).toBe('info');
  });

  it('remove(id) removes only the matching toast', () => {
    service.success('A');
    service.error('B');
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('B');
  });

  it('toast is auto-removed after 4 seconds', () => {
    service.success('Auto-remove me');
    expect(service.toasts().length).toBe(1);
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('multiple toasts are auto-removed independently', () => {
    service.success('First');
    vi.advanceTimersByTime(2000);
    service.error('Second');
    vi.advanceTimersByTime(2000); // First should be gone, second still here
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Second');
    vi.advanceTimersByTime(2000); // Now second is also gone
    expect(service.toasts().length).toBe(0);
  });
});
