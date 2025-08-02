import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  form!: FormGroup;
  fb = inject(FormBuilder);
  isLoading = false;

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submitForgotPassword() {
    if (!this.form || !this.form.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.form.value).subscribe({
      next: (response) => {
        this.matSnackBar.open(
          'Se ha enviado un enlace de recuperación a tu correo electrónico',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.matSnackBar.open(
          error.error?.message || 'Error al enviar el correo de recuperación',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
} 