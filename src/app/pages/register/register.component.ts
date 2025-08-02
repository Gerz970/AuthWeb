import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Role } from '../../interfaces/role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  hide = true;
  form!: FormGroup;
  fb = inject(FormBuilder);
  availableRoles: Role[] = [];
  isLoadingRoles = true;

  // Validadores personalizados para contraseña
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: ValidationErrors = {};

    // Validar longitud mínima de 6 caracteres
    if (password.length < 6) {
      errors['minLength'] = true;
    }

    // Validar que tenga al menos una mayúscula
    if (!/[A-Z]/.test(password)) {
      errors['uppercase'] = true;
    }

    // Validar que tenga al menos un carácter alfanumérico
    if (!/[a-zA-Z0-9]/.test(password)) {
      errors['alphanumeric'] = true;
    }

    // Validar que tenga al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors['specialChar'] = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadRoles();
  }

  initializeForm() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordValidator.bind(this)]],
      confirmPassword: ['', Validators.required],
      roles: [[], Validators.required], // Cambiado a array para múltiples roles
    });
  }

  loadRoles() {
    this.isLoadingRoles = true;
    this.authService.getRoles().subscribe({
      next: (roles: Role[]) => {
        this.availableRoles = roles;
        this.isLoadingRoles = false;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.matSnackBar.open('Error al cargar los roles disponibles', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
        });
        this.isLoadingRoles = false;
        // Fallback a roles básicos si el API falla
        this.availableRoles = [
          { id: '1', name: 'User', totalUsers: 0 },
          { id: '2', name: 'Admin', totalUsers: 0 }
        ];
      }
    });
  }

  // Métodos para obtener mensajes de error específicos
  getPasswordErrors(): string[] {
    const passwordControl = this.form.get('password');
    if (!passwordControl || !passwordControl.errors) return [];

    const errors: string[] = [];
    const password = passwordControl.value;

    if (passwordControl.errors['minLength']) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (passwordControl.errors['uppercase']) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }
    if (passwordControl.errors['alphanumeric']) {
      errors.push('La contraseña debe contener al menos un carácter alfanumérico');
    }
    if (passwordControl.errors['specialChar']) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return errors;
  }

  getConfirmPasswordError(): string {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    
    if (confirmPassword && password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  register() {
    if (!this.form.valid) {
      return;
    }
    if (this.form.valid) {
      if (this.form.value.password !== this.form.value.confirmPassword) {
        this.matSnackBar.open('Las contraseñas no coinciden', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
        });
        return;
      }

      const registerData = {
        fullName: this.form.value.fullName,
        email: this.form.value.email,
        password: this.form.value.password,
        roles: this.form.value.roles, // Ya es un array
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.matSnackBar.open(response.message, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
          });
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.matSnackBar.open(error.error?.message || 'Error en el registro', 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
          });
        },
      });
    }
  }
} 