import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../interfaces/login-request';
import { AuthResponse } from '../interfaces/auth-response';
import { Role } from '../interfaces/role';
import { jwtDecode } from 'jwt-decode';
import { UserDetail } from '../interfaces/user-detail';
import { RoleRequest } from '../interfaces/role-request';
import { RoleAssignment } from '../interfaces/role-assignment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';

  constructor() {
    // AuthService initialized
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}account/login`, data)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          return response;
        })
      );
  }

  register(data: any): Observable<AuthResponse> {
    console.log(`${this.apiUrl}account/register`, data);
    return this.http.post<AuthResponse>(`${this.apiUrl}account/register`, data);
  }

  getUserDetail(): any {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const userDetail = {
        id: decodedToken.nameid,
        fullName: decodedToken.name,
        email: decodedToken.email,
        roles: Array.isArray(decodedToken.role) ? decodedToken.role : [decodedToken.role],
        phone: decodedToken.phone || '',
        accessFailedCount: decodedToken.accessFailedCount || 0,
      };
      return userDetail;
    } catch {
      return null;
    }
  }

  // Nuevo método para obtener detalles completos del usuario desde el API
  getUserDetailFromAPI(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.apiUrl}account/detail`, { headers });
  }

  // Método para obtener roles disponibles desde el API
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}roles`);
  }

  // Método para crear un nuevo rol
  createRole(roleRequest: RoleRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}roles`, roleRequest, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        // Si la respuesta es "Role created successfully", la tratamos como éxito
        if (response === 'Role created successfully') {
          return { success: true, message: response };
        }
        return response;
      })
    );
  }

  // Método para asignar un rol a un usuario
  assignRole(roleAssignment: RoleAssignment): Observable<any> {
    return this.http.post(`${this.apiUrl}roles/assign`, roleAssignment, { 
      responseType: 'text' 
    }).pipe(
      map(response => {
        // Si la respuesta es "Role assigned successfully", la tratamos como éxito
        if (response === 'Role assigned successfully') {
          return { success: true, message: response };
        }
        return response;
      })
    );
  }

  // Método para eliminar un rol
  deleteRole(roleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}roles/${roleId}`);
  }

  // Método para obtener lista de usuarios (solo para administradores)
  getUsers(): Observable<UserDetail[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserDetail[]>(`${this.apiUrl}account/users`, { headers });
  }

  // Método para actualizar usuario (solo para administradores)
  updateUser(userData: {
    id: string;
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    roles?: string[];
  }): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.apiUrl}account/users`, userData, { headers });
  }

  // Método para verificar si el usuario tiene rol de administrador
  isAdmin(): boolean {
    const userDetail = this.getUserDetail();
    if (!userDetail || !userDetail.roles) return false;
    
    return userDetail.roles.includes('Admin');
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
} 