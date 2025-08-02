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
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { TokenUtils } from '../../utils/token-utils';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  route = inject(ActivatedRoute);
  form!: FormGroup;
  fb = inject(FormBuilder);
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  email = '';
  token = '';

  ngOnInit(): void {
    // Obtener email y token de los parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      // Limpiar el token de espacios y caracteres especiales
      this.token = TokenUtils.cleanToken(params['token'] || '');
      
      const debugInfo = TokenUtils.getTokenDebugInfo(params['token'] || '');
      console.log('Parámetros recibidos:', {
        email: this.email,
        token: this.token,
        tokenLength: this.token.length,
        debugInfo: debugInfo
      });
      
      // Verificar si tenemos los datos necesarios
      if (!this.email || !this.token) {
        this.matSnackBar.open(
          'Enlace inválido. Faltan parámetros requeridos.',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
        this.router.navigate(['/forgot-password']);
        return;
      }
      
      // Verificar si el token es válido
      if (!TokenUtils.isValidToken(this.token)) {
        this.matSnackBar.open(
          'Token inválido. Solicita un nuevo enlace de recuperación.',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
        this.router.navigate(['/forgot-password']);
        return;
      }
      
      // Inicializar el formulario después de obtener los parámetros
      this.initializeForm();
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      email: [this.email, [Validators.required, Validators.email]],
      token: [this.token, Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
    
    console.log('Formulario inicializado:', {
      email: this.email,
      token: this.token,
      formValid: this.form.valid,
      formErrors: this.form.errors
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      console.log('Validación de contraseñas falló:', {
        password: password.value,
        confirmPassword: confirmPassword.value
      });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  submitResetPassword() {
    if (!this.form || !this.form.valid) {
      console.log('Formulario inválido:', this.form?.errors);
      console.log('Estado del formulario:', this.form?.value);
      this.matSnackBar.open(
        'Por favor, completa todos los campos correctamente',
        'Cerrar',
        {
          duration: 3000,
          horizontalPosition: 'center',
        }
      );
      return;
    }

    // Limpiar el token antes de enviar
    const formData = {
      ...this.form.value,
      token: TokenUtils.cleanToken(this.form.value.token)
    };

    // Validar que el token no esté vacío después de la limpieza
    if (!formData.token) {
      this.matSnackBar.open(
        'Token inválido. Solicita un nuevo enlace de recuperación.',
        'Cerrar',
        {
          duration: 5000,
          horizontalPosition: 'center',
        }
      );
      return;
    }

    console.log('Enviando datos:', formData);
    console.log('Token final:', TokenUtils.getTokenDebugInfo(formData.token));
    
    this.isLoading = true;
    
    this.authService.resetPassword(formData).subscribe({
      next: (response) => {
        console.log('Respuesta exitosa:', response);
        this.matSnackBar.open(
          'Contraseña actualizada exitosamente. Por favor inicia sesión con tu nueva contraseña.',
          'Cerrar',
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al resetear contraseña:', error);
        let errorMessage = 'Error al actualizar la contraseña';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos. Verifica que el token sea válido y las contraseñas coincidan.';
        } else if (error.status === 404) {
          errorMessage = 'Token inválido o expirado. Solicita un nuevo enlace de recuperación.';
        }
        
        this.matSnackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
} 