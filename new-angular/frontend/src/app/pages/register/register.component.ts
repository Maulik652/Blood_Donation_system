import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = this.formBuilder.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128), Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^[+]?[-()\d\s]{8,20}$/)]],
    age: [18, [Validators.required, Validators.min(18), Validators.max(65)]],
    bloodGroup: ['', [Validators.required]],
    location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    role: ['user', [Validators.required]],
  });

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.errorMessage = 'Please fix validation errors before submitting.';
      return;
    }

    this.isLoading = true;

    const payload = {
      name: this.f.name.value?.trim() || '',
      email: this.f.email.value?.trim().toLowerCase() || '',
      password: this.f.password.value || '',
      age: Number(this.f.age.value),
      role: (this.f.role.value || 'user') as 'user' | 'hospital',
      phone: this.f.phone.value?.trim() || '',
      bloodGroup: this.f.bloodGroup.value || '',
      location: this.f.location.value?.trim() || '',
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Registration successful! Redirecting...';
        
        setTimeout(() => {
          const userRole = this.authService.getUserRole();
          if (userRole === 'hospital') {
            this.router.navigate(['/hospital-dashboard']);
          } else {
            this.router.navigate(['/donor-dashboard']);
          }
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
