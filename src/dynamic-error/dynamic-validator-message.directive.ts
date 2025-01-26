import {
  ComponentRef,
  Directive,
  ElementRef,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
  NgControl,
  NgForm,
  NgModel,
} from '@angular/forms';
import {
  EMPTY,
  fromEvent,
  iif,
  merge,
  skip,
  startWith,
  Subscription,
} from 'rxjs';
import { ErrorStateMatcher } from './error-state-matcher.service';
import { InputErrorComponent } from './input-error.component';

@Directive({
  selector: `
    [ngModel]:not([withoutValidationErrors]),
    [formControl]:not([withoutValidationErrors]),
    [formControlName]:not([withoutValidationErrors]),
    [formGroupName]:not([withoutValidationErrors]),
    [ngModelGroup]:not([withoutValidationErrors])
  `,
  standalone: true,
})
export class DynamicValidatorMessage implements OnInit, OnDestroy {
  ngControl =
    inject(NgControl, { self: true, optional: true }) ||
    inject(ControlContainer, { self: true });
  elementRef = inject(ElementRef);
  get form() {
    return this.parentContainer?.formDirective as
      | NgForm
      | FormGroupDirective
      | null;
  }
  @Input()
  errorStateMatcher = inject(ErrorStateMatcher);

  @Input()
  container = inject(ViewContainerRef);

  private componentRef: ComponentRef<InputErrorComponent> | null = null;
  private errorMessageTrigger!: Subscription;
  private parentContainer = inject(ControlContainer, { optional: true });

  get isErrorVisible() {
    return this.errorStateMatcher.isErrorVisible(
      this.ngControl.control,
      this.form
    );
  }

  get control() {
    if (!this.ngControl.control)
      throw Error(`No control model for ${this.ngControl.name} control...`);

    return this.ngControl.control;
  }

  ngOnInit() {
    queueMicrotask(() => {
      this.errorMessageTrigger = merge(
        this.control.statusChanges,
        fromEvent(this.elementRef.nativeElement, 'blur'),
        iif(() => !!this.form, this.form!.ngSubmit, EMPTY)
      )
        .pipe(
          startWith(this.control.status),
          skip(this.ngControl instanceof NgModel ? 1 : 0)
        )
        .subscribe(() => {
          if (this.isErrorVisible) {
            if (!this.componentRef) {
              this.componentRef =
                this.container.createComponent(InputErrorComponent);
              this.componentRef.changeDetectorRef.markForCheck();
            }
            this.componentRef.setInput('errors', this.ngControl.errors);
          } else {
            this.componentRef?.destroy();
            this.componentRef = null;
          }
        });
    });
  }
  ngOnDestroy() {
    this.errorMessageTrigger.unsubscribe();
  }
  @HostBinding('class.is-invalid')
  get isInvalid() {
    return (
      this.control.invalid &&
      (this.control.touched || this.control.dirty || this.form?.submitted)
    );
  }

  @HostBinding('class.is-valid')
  get isValid() {
    return this.control.valid && this.control.dirty;
  }
}
