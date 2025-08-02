import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../interfaces/role';
import { UserDetail } from '../../interfaces/user-detail';
import { RoleRequest } from '../../interfaces/role-request';
import { RoleAssignment } from '../../interfaces/role-assignment';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css',
})
export class RolesComponent implements OnInit {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  roles: Role[] = [];
  users: UserDetail[] = [];
  loading = false;
  creatingRole = false;
  assigningRole = false;

  // Formulario para crear rol
  newRoleName = '';

  // Formulario para asignar rol
  selectedUserId = '';
  selectedRoleId = '';

  displayedColumns: string[] = ['name', 'totalUsers', 'actions'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    // Cargar roles y usuarios en paralelo
    const rolesObservable = this.authService.getRoles();
    const usersObservable = this.authService.getUsers();
    
    // Combinar las observaciones para manejar errores individualmente
    rolesObservable.subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
        this.snackBar.open('Error al cargar roles', 'Cerrar', {
          duration: 3000,
        });
        this.loading = false;
      },
    });

    usersObservable.subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  // Método para recargar solo los roles (más eficiente)
  reloadRoles() {
    this.authService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error recargando roles:', error);
        this.snackBar.open('Error al recargar roles', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  createRole() {
    if (!this.newRoleName.trim()) {
      this.snackBar.open('Por favor ingrese un nombre de rol', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.creatingRole = true;
    const roleRequest: RoleRequest = {
      roleName: this.newRoleName.trim(),
    };

    this.authService.createRole(roleRequest).subscribe({
      next: (response) => {
        this.snackBar.open('Rol creado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.newRoleName = '';
        this.reloadRoles();
        this.creatingRole = false;
      },
      error: (error) => {
        console.error('Error creando rol:', error);
        let message = 'Error al crear el rol';
        
        // Manejar diferentes tipos de respuesta de error
        if (typeof error.error === 'string') {
          if (error.error === 'Role already exists') {
            message = 'El rol ya existe';
          }
        }
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });
        this.creatingRole = false;
      },
    });
  }

  assignRole() {
    if (!this.selectedUserId || !this.selectedRoleId) {
      this.snackBar.open('Por favor seleccione un usuario y un rol', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.assigningRole = true;
    const roleAssignment: RoleAssignment = {
      userId: this.selectedUserId,
      roleId: this.selectedRoleId,
    };

    this.authService.assignRole(roleAssignment).subscribe({
      next: (response) => {
        this.snackBar.open('Rol asignado exitosamente', 'Cerrar', {
          duration: 3000,
        });
        this.selectedUserId = '';
        this.selectedRoleId = '';
        this.reloadRoles();
        this.assigningRole = false;
      },
      error: (error) => {
        console.error('Error asignando rol:', error);
        let message = 'Error al asignar el rol';
        
        if (typeof error.error === 'string') {
          if (error.error === 'User not found') {
            message = 'Usuario no encontrado';
          } else if (error.error === 'Role assigned successfully') {
            // Si el backend devuelve éxito como string, tratarlo como éxito
            this.snackBar.open('Rol asignado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.selectedUserId = '';
            this.selectedRoleId = '';
            this.reloadRoles();
            this.assigningRole = false;
            return;
          }
        }
        
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
        });
        this.assigningRole = false;
      },
    });
  }

  deleteRole(role: Role) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '400px',
      data: { roleName: role.name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.authService.deleteRole(role.id).subscribe({
          next: (response) => {
            this.snackBar.open('Rol eliminado exitosamente', 'Cerrar', {
              duration: 3000,
            });
            this.reloadRoles();
          },
          error: (error) => {
            console.error('Error eliminando rol:', error);
            let message = 'Error al eliminar el rol';
            
            // Manejar diferentes tipos de respuesta de error
            if (typeof error.error === 'string') {
              if (error.error === 'Role deleted successfully') {
                // Si el backend devuelve éxito como string, tratarlo como éxito
                this.snackBar.open('Rol eliminado exitosamente', 'Cerrar', {
                  duration: 3000,
                });
                this.reloadRoles();
                return;
              } else if (error.error.includes('not found')) {
                message = 'Rol no encontrado';
              } else if (error.error.includes('in use')) {
                message = 'No se puede eliminar el rol porque está en uso';
              }
            }
            
            this.snackBar.open(message, 'Cerrar', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullName : 'Usuario no encontrado';
  }

  getRoleName(roleId: string): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Rol no encontrado';
  }
}

// Componente de diálogo para confirmar eliminación
@Component({
  selector: 'app-confirm-delete-dialog',
  template: `
    <h2 mat-dialog-title>Confirmar eliminación</h2>
    <mat-dialog-content>
      ¿Está seguro de que desea eliminar el rol "{{ data.roleName }}"?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-button [color]="'warn'" [mat-dialog-close]="true">Eliminar</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
})
export class ConfirmDeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { roleName: string }) {}
} 