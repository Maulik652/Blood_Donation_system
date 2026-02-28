import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-hospital-create-request',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './hospital-create-request.component.html',
  styleUrls: ['./hospital-create-request.component.css']
})
export class HospitalCreateRequestComponent {
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  urgencies = ['Low', 'Medium', 'High', 'Critical'];

  successMessage = '';
  errorMessage = '';
  isSubmitting = false;

  form = this.formBuilder.group({
    bloodGroup: ['', [Validators.required]],
    urgency: ['Medium', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
  });

  constructor(
    private formBuilder: FormBuilder,
    private requestService: RequestService
  ) {}

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.requestService.createRequest({
      bloodGroup: this.f.bloodGroup.value || '',
      urgency: this.f.urgency.value || 'Medium',
      message: this.f.message.value?.trim() || '',
    }).subscribe({
      next: () => {
        this.form.reset({ bloodGroup: '', urgency: 'Medium', message: '' });
        this.successMessage = 'Request created successfully.';
        this.isSubmitting = false;
        setTimeout(() => (this.successMessage = ''), 2800);
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to create request.';
        this.isSubmitting = false;
      }
    });
  }
}
