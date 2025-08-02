import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserDetail } from '../../interfaces/user-detail';
import { Role } from '../../interfaces/role';

export interface EditUserDialogData {
  user: UserDetail;
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.css',
})
export class EditUserDialogComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  fb = inject(FormBuilder);
  
  form!: FormGroup;
  availableRoles: Role[] = [];
  isLoadingRoles = true;
  isSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserDialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadRoles();
  }

  initializeForm() {
    this.form = this.fb.group({
      id: [this.data.user.id, Validators.required],
      fullName: [this.data.user.fullName, Validators.required],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      phoneNumber: [this.data.user.phoneNumber || ''],
      roles: [this.data.user.roles, Validators.required],
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
        this.isLoadingRoles = false;
        // Fallback a roles básicos si el API falla
        this.availableRoles = [
          { id: '1', name: 'User', totalUsers: 0 },
          { id: '2', name: 'Admin', totalUsers: 0 },
          { id: '3', name: 'Manager', totalUsers: 0 }
        ];
      }
    });
  }

  onSubmit() {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const updateData = {
        id: this.form.value.id,
        email: this.form.value.email,
        fullName: this.form.value.fullName,
        phoneNumber: this.form.value.phoneNumber || undefined,
        roles: this.form.value.roles,
      };

      this.authService.updateUser(updateData).subscribe({
        next: (response) => {
          this.matSnackBar.open('Usuario actualizado exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
          });
          this.dialogRef.close(true); // true indica que se actualizó exitosamente
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.matSnackBar.open(
            error.error?.message || 'Error al actualizar el usuario', 
            'Cerrar', 
            {
              duration: 5000,
              horizontalPosition: 'center',
            }
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
} 