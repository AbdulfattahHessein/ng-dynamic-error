import { Component } from '@angular/core';
import {
  EmailValidator,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { DynamicValidatorMessage } from './dynamic-error/dynamic-validator-message.directive';
import { JsonPipe } from '@angular/common';
import { ValidatorMessageContainer } from './dynamic-error/validator-message-container.directive';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    DynamicValidatorMessage,
    JsonPipe,
    ValidatorMessageContainer,
  ],
  template: `
    <p> {{form.value | json}} </p>
    <br/>
    <form [formGroup] = "form" (ngSubmit) = "onSubmit()">
      Name: <input [formControl]="form.controls.name"/> 
      <br/>
      Age: <input [formControl]="form.controls.age" [container] = "containerDir.container" type = "number"/>
      <br/>
      Email: <input [formControl]="form.controls.email"/> 
      <br/>
      <button type = 'submit'>Submit</button>
    </form>
    <br/>
    Age error message will appear here :
    <ng-container validatorMessageContainer #containerDir = "validatorMessageContainer" />
  `,
  styles: [`input { display: block; }`],
})
export class App {
  name = 'Angular';
  form = new FormGroup({
    name: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(5),
    ]),
    age: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(18),
    ]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
  });

  onSubmit() {
    this.form.reset(this.form.value, { emitEvent: false });
  }
}

bootstrapApplication(App);
