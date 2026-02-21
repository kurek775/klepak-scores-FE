import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';

import { AuthService } from '../../auth/auth.service';
import { ToastService } from '../../shared/toast.service';
import { SKIP_ERROR_TOAST } from '../http-context';

const ERROR_MAP: Record<string, string> = {
  'Email already registered':                         'ERRORS.EMAIL_EXISTS',
  'Invalid email or password':                        'ERRORS.INVALID_CREDENTIALS',
  'File must be a .csv file':                         'ERRORS.CSV_INVALID',
  'CSV file exceeds the 5 MB limit':                  'ERRORS.CSV_TOO_LARGE',
  'File must be UTF-8 encoded':                       'ERRORS.CSV_ENCODING',
  'CSV file is empty or has no headers':              'ERRORS.CSV_EMPTY',
  'CSV file contains no data rows':                   'ERRORS.CSV_NO_DATA',
  'Image file exceeds the 5 MB limit':                'ERRORS.IMAGE_TOO_LARGE',
  'Event not found':                                  'ERRORS.EVENT_NOT_FOUND',
  'Activity not found':                               'ERRORS.ACTIVITY_NOT_FOUND',
  'Group not found':                                  'ERRORS.GROUP_NOT_FOUND',
  'User not found':                                   'ERRORS.USER_NOT_FOUND',
  'Age category not found':                           'ERRORS.AGE_CATEGORY_NOT_FOUND',
  'Assignment not found':                             'ERRORS.ASSIGNMENT_NOT_FOUND',
  'You are not assigned to this group':               'ERRORS.NOT_ASSIGNED_GROUP',
  "You are not assigned to this participant's group": 'ERRORS.NOT_ASSIGNED_PARTICIPANT',
  'Admin access required':                            'ERRORS.ADMIN_REQUIRED',
  'Evaluator already assigned to this group':         'ERRORS.EVALUATOR_ALREADY_ASSIGNED',
  'Cannot modify admin accounts':                     'ERRORS.CANNOT_MODIFY_ADMIN',
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const transloco = inject(TranslocoService);
  const token = authService.token;

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req).pipe(
    catchError((err) => {
      if (req.context.get(SKIP_ERROR_TOAST)) {
        return throwError(() => err);
      }

      if (err.status === 401) {
        toastService.error(transloco.translate('ERRORS.SESSION_EXPIRED'));
        authService.logout();
      } else if (err.status >= 400) {
        const detail: string = err.error?.detail ?? '';
        const i18nKey = ERROR_MAP[detail];
        const message = i18nKey
          ? transloco.translate(i18nKey)
          : detail || transloco.translate('ERRORS.REQUEST_FAILED');
        toastService.error(message);
      }
      return throwError(() => err);
    }),
  );
};
