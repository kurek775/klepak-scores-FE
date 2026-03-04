import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DiplomaService } from './diploma.service';
import { environment } from '../../environments/environment';
import { SKIP_ERROR_TOAST } from '../core/http-context';
import { DiplomaTemplate } from '../core/models/diploma.model';

describe('DiplomaService', () => {
  let service: DiplomaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DiplomaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTemplates() calls GET /events/{id}/diplomas with SKIP_ERROR_TOAST context', () => {
    const mockTemplates = [{ id: 1, event_id: 5, name: 'Default', items: [], fonts: [] }];
    service.getTemplates(5).subscribe((templates) => {
      expect(templates.length).toBe(1);
      expect(templates[0].name).toBe('Default');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/events/5/diplomas`);
    expect(req.request.method).toBe('GET');
    expect(req.request.context.get(SKIP_ERROR_TOAST)).toBe(true);
    req.flush(mockTemplates);
  });

  it('createTemplate() calls POST /events/{id}/diplomas', () => {
    const body: Partial<DiplomaTemplate> = { name: 'Award', orientation: 'LANDSCAPE' };
    service.createTemplate(5, body).subscribe((tpl) => {
      expect(tpl.name).toBe('Award');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/events/5/diplomas`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 2, event_id: 5, ...body, items: [], fonts: [] });
  });

  it('updateTemplate() calls PUT /events/{id}/diplomas/{templateId}', () => {
    const body = { name: 'Updated' };
    service.updateTemplate(5, 2, body).subscribe((tpl) => {
      expect(tpl.name).toBe('Updated');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/events/5/diplomas/2`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 2, event_id: 5, name: 'Updated', items: [], fonts: [] });
  });

  it('deleteTemplate() calls DELETE /events/{id}/diplomas/{templateId}', () => {
    service.deleteTemplate(5, 2).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/events/5/diplomas/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
