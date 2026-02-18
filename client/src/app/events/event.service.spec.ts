import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { EventService } from './event.service';
import { ToastService } from '../shared/toast.service';
import { environment } from '../../environments/environment';
import { EventStatus, EventSummary, ImportSummary } from '../core/models/event.model';

const mockEvents: EventSummary[] = [
  {
    id: 1,
    name: 'Test Event',
    status: EventStatus.ACTIVE,
    created_by_id: 1,
    created_at: '2024-01-01T00:00:00Z',
    group_count: 2,
    participant_count: 10,
  },
];

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;
  let toastService: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listEvents() calls GET /events', () => {
    service.listEvents().subscribe((events) => {
      expect(events.length).toBe(1);
      expect(events[0].name).toBe('Test Event');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/events`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
  });

  it('getEvent(id) calls GET /events/{id}', () => {
    service.getEvent(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1, name: 'Test', groups: [], activities: [] });
  });

  it('deleteEvent(id) calls DELETE /events/{id} and shows success toast', () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    service.deleteEvent(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
    expect(toastSpy).toHaveBeenCalledWith('Event deleted');
  });

  it('importEvent() calls POST /events/import and shows success toast', () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    const mockFile = new File(['display_name,group_name\nA,G1'], 'p.csv');
    const summary: ImportSummary = {
      event_id: 2,
      event_name: 'Imported',
      groups_created: 1,
      participants_created: 1,
    };

    service.importEvent(mockFile, 'Imported').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/import`);
    expect(req.request.method).toBe('POST');
    req.flush(summary);
    expect(toastSpy).toHaveBeenCalledWith('Event imported: 1 groups, 1 participants');
  });

  it('getLeaderboard(id) calls GET /events/{id}/leaderboard', () => {
    service.getLeaderboard(5).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/5/leaderboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ event_id: 5, event_name: 'Test', has_age_categories: false, activities: [] });
  });

  it('createAgeCategory() calls POST and shows success toast', () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    service.createAgeCategory(1, { name: 'Junior', min_age: 0, max_age: 17 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/1/age-categories`);
    req.flush({ id: 10, name: 'Junior', min_age: 0, max_age: 17 });
    expect(toastSpy).toHaveBeenCalledWith('Age category added');
  });

  it('deleteAgeCategory() calls DELETE and shows success toast', () => {
    const toastSpy = vi.spyOn(toastService, 'success');
    service.deleteAgeCategory(1, 10).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/1/age-categories/10`);
    req.flush(null);
    expect(toastSpy).toHaveBeenCalledWith('Age category removed');
  });
});
