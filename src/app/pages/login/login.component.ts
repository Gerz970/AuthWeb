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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  hide = true;
  form!: FormGroup;
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (!this.form) {
      return;
    }
    
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe({
        next: (response) => {
          this.matSnackBar.open(response.message, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.matSnackBar.open(error.error?.message || 'Login failed', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        },
      });
    }
  }
} 