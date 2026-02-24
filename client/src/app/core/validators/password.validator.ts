import { Validators } from '@angular/forms';

export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

export const passwordValidators = [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(PASSWORD_PATTERN),
];
