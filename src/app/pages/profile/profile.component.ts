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
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { UserDetail } from '../../interfaces/user-detail';
import { Role } from '../../interfaces/role';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  fb = inject(FormBuilder);
  
  userDetail: UserDetail | null = null;
  isEditing = false;
  isLoading = true;
  availableRoles: Role[] = [];
  isLoadingRoles = true;
  form!: FormGroup;

  ngOnInit(): void {
    this.loadUserDetail();
    this.initializeForm();
    this.loadRoles();
  }

  loadUserDetail() {
    this.isLoading = true;
    this.authService.getUserDetailFromAPI().subscribe({
      next: (data: UserDetail) => {
        this.userDetail = data;
        this.updateFormWithUserData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles del usuario:', error);
        this.matSnackBar.open('Error al cargar los datos del usuario', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
        });
        this.isLoading = false;
        // Fallback a datos del token si el API falla
        this.userDetail = this.authService.getUserDetail();
        this.updateFormWithUserData();
      }
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
          { id: '2', name: 'Admin', totalUsers: 0 }
        ];
      }
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      roles: [[], Validators.required],
    });
  }

  updateFormWithUserData() {
    if (this.userDetail) {
      this.form.patchValue({
        fullName: this.userDetail.fullName,
        email: this.userDetail.email,
        phoneNumber: this.userDetail.phoneNumber || '',
        roles: this.userDetail.roles || ['User'],
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.updateFormWithUserData(); // Reset form when canceling edit
    }
  }

  saveProfile() {
    if (this.form.valid) {
      // Aquí normalmente harías una llamada al API para actualizar
      const updatedData = this.form.value;
      
      // Simular actualización exitosa
      if (this.userDetail) {
        this.userDetail = {
          ...this.userDetail,
          ...updatedData
        };
      }
      
      this.isEditing = false;
      this.matSnackBar.open('Perfil actualizado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
      });
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }
} 