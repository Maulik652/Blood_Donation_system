import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(128)]],
  });

  errorMessage = '';
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get f() {
    return this.loginForm.controls;
  }

  private isSafeReturnUrl(returnUrl: string): boolean {
    return returnUrl.startsWith('/') && !returnUrl.startsWith('//');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage = 'Please correct the highlighted fields.';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const credentials = {
      email: this.f.email.value?.trim() || '',
      password: this.f.password.value || '',
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl && this.isSafeReturnUrl(returnUrl)) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        const userRole = this.authService.getRole();

        if (userRole === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (userRole === 'hospital') {
          this.router.navigate(['/hospital-dashboard']);
        } else if (userRole === 'donor') {
          this.router.navigate(['/donor-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
      }
    });
  }
}