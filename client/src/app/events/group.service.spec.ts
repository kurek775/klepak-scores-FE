import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { GroupService } from './group.service';
import { environment } from '../../environments/environment';

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getMyGroups() calls GET /groups/my-groups', () => {
    const mockGroups = [{ id: 1, name: 'Group1', event_id: 1, event_name: 'Test', participant_count: 5 }];
    service.getMyGroups().subscribe((groups) => {
      expect(groups.length).toBe(1);
      expect(groups[0].name).toBe('Group1');
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/my-groups`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroups);
  });

  it('assignEvaluator() calls POST /groups/{id}/evaluators', () => {
    service.assignEvaluator(5, 10).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/5/evaluators`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ user_id: 10 });
    req.flush(null);
  });

  it('removeEvaluator() calls DELETE /groups/{groupId}/evaluators/{userId}', () => {
    service.removeEvaluator(5, 10).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/5/evaluators/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getGroupEvaluators() calls GET /groups/{id}/evaluators', () => {
    const mockEvaluators = [{ id: 10, email: 'eval@test.com', full_name: 'Eval' }];
    service.getGroupEvaluators(5).subscribe((evals) => {
      expect(evals.length).toBe(1);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/groups/5/evaluators`);
    expect(req.request.method).toBe('GET');
    req.flush(mockEvaluators);
  });
});
