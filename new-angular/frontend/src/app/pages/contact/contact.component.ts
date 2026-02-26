import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
  });

  successMessage = '';
  errorMessage = '';

  constructor(private formBuilder: FormBuilder) {}

  get f() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      this.errorMessage = 'Please complete all required fields correctly.';
      return;
    }

    this.successMessage = 'Thank you for contacting us! We will get back to you soon.';
    this.contactForm.reset({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }
}
