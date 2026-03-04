import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ScoringService } from './scoring.service';
import { environment } from '../../environments/environment';

describe('ScoringService', () => {
  let service: ScoringService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ScoringService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createActivity() calls POST /activities', () => {
    const body = { name: 'Jump', evaluation_type: 'NUMERIC_HIGH', event_id: 1 };
    service.createActivity(body).subscribe((activity) => {
      expect(activity.name).toBe('Jump');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/activities`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, ...body });
  });

  it('getEventActivities() calls GET /events/{id}/activities', () => {
    service.getEventActivities(3).subscribe((activities) => {
      expect(activities.length).toBe(2);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/events/3/activities`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'A' }, { id: 2, name: 'B' }]);
  });

  it('deleteActivity() calls DELETE /activities/{id}', () => {
    service.deleteActivity(7).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/activities/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('submitRecord() calls POST /records', () => {
    const body = { value_raw: '42', participant_id: 1, activity_id: 2 };
    service.submitRecord(body).subscribe((record) => {
      expect(record.value_raw).toBe('42');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/records`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ id: 1, ...body });
  });

  it('submitBulkRecords() calls POST /records/bulk', () => {
    const body = {
      activity_id: 2,
      records: [{ participant_id: 1, value_raw: '10' }],
    };
    service.submitBulkRecords(body).subscribe((records) => {
      expect(records.length).toBe(1);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/records/bulk`);
    expect(req.request.method).toBe('POST');
    req.flush([{ id: 1, value_raw: '10', participant_id: 1, activity_id: 2 }]);
  });

  it('deleteRecord() calls DELETE /records/{id}', () => {
    service.deleteRecord(5).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/records/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getActivityRecords() calls GET /activities/{id}/records', () => {
    service.getActivityRecords(4).subscribe((records) => {
      expect(records.length).toBe(1);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/activities/4/records`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, value_raw: '99', participant_id: 1, activity_id: 4 }]);
  });

  it('processImage() calls POST /records/process-image with FormData', () => {
    const formData = new FormData();
    formData.append('file', new Blob(['test']), 'photo.jpg');
    formData.append('activity_id', '1');
    formData.append('group_id', '2');

    service.processImage(formData).subscribe((results) => {
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Alice');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/records/process-image`);
    expect(req.request.method).toBe('POST');
    req.flush([{ participant_id: 1, value: '42', name: 'Alice' }]);
  });
});
