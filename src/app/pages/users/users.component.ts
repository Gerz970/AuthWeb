import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDetail } from '../../interfaces/user-detail';
import { EditUserDialogComponent, EditUserDialogData } from './edit-user-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    RouterModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  authService = inject(AuthService);
  matSnackBar = inject(MatSnackBar);
  router = inject(Router);
  dialog = inject(MatDialog);
  
  users: UserDetail[] = [];
  isLoading = true;
  isAuthorized = false;

  ngOnInit(): void {
    this.checkAuthorization();
  }

  checkAuthorization() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.authService.isAdmin()) {
      this.matSnackBar.open('Acceso denegado. Se requiere rol de administrador.', 'Cerrar', {
        duration: 5000,
        horizontalPosition: 'center',
      });
      this.router.navigate(['/']);
      return;
    }

    this.isAuthorized = true;
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (users: UserDetail[]) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.matSnackBar.open(
          error.error?.message || 'Error al cargar la lista de usuarios', 
          'Cerrar', 
          {
            duration: 5000,
            horizontalPosition: 'center',
          }
        );
        this.isLoading = false;
        
        // Si el error es de autorización, redirigir
        if (error.status === 403) {
          this.router.navigate(['/']);
        }
      }
    });
  }

  openEditDialog(user: UserDetail) {
    const dialogRef = this.dialog.open(EditUserDialogComponent, {
      width: 'auto',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { user } as EditUserDialogData,
      disableClose: true,
      panelClass: 'edit-user-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Recargar la lista de usuarios después de una actualización exitosa
        this.loadUsers();
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getPhoneStatus(user: UserDetail): string {
    if (!user.phoneNumber) return 'No registrado';
    return user.phoneNumberConfirmed ? 'Verificado' : 'Pendiente';
  }

  getPhoneStatusColor(user: UserDetail): string {
    if (!user.phoneNumber) return 'text-gray-500';
    return user.phoneNumberConfirmed ? 'text-green-600' : 'text-yellow-600';
  }

  getAccessFailedStatus(user: UserDetail): string {
    if (user.accessFailedCount === 0) return 'Sin intentos fallidos';
    return `${user.accessFailedCount} intento(s) fallido(s)`;
  }

  getAccessFailedColor(user: UserDetail): string {
    if (user.accessFailedCount === 0) return 'text-green-600';
    if (user.accessFailedCount <= 2) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Métodos para calcular estadísticas
  getTotalUsers(): number {
    return this.users.length;
  }

  getVerifiedPhones(): number {
    return this.users.filter(user => user.phoneNumberConfirmed).length;
  }

  getAdminUsers(): number {
    return this.users.filter(user => user.roles.includes('Admin')).length;
  }

  getUsersWithFailedAccess(): number {
    return this.users.filter(user => user.accessFailedCount > 0).length;
  }
} 