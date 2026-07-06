import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appPasswordValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: PasswordValidator,
      multi: true
    }
  ]
})
export class PasswordValidator implements Validator{

  validate(control: AbstractControl): ValidationErrors | null {
    
    const value = control.value;
    if (!value && !control.touched) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[@$!%*?&]/.test(value);
    const minLength = value.length >= 8;

    const valid = hasUpper && hasLower && hasNumber && hasSpecial && minLength
     return valid ? null : {
      passwordStrength: {
        hasUpper,
        hasLower,
        hasNumber,
        hasSpecial,
        minLength
      }
    };
  }
}
