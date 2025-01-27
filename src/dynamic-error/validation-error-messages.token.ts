import { InjectionToken } from '@angular/core';

export const ERROR_MESSAGES: { [key: string]: (args?: any) => string } = {
  required: () => `This field is required`,
  email: () => `It should be a valid email`,
  minlength: ({ requiredLength }) =>
    `The length should be at least ${requiredLength} characters`,
  min: ({min, actual}) => `You entered ${actual}, but min is ${min}` 
};

export const VALIDATION_ERROR_MESSAGES = new InjectionToken(
  `Validation Messages`,
  {
    providedIn: 'root',
    factory: () => ERROR_MESSAGES,
  }
);
