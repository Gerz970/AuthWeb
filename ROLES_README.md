# Módulo de Administración de Roles

## Descripción

Este módulo permite a los administradores gestionar roles de usuario en la aplicación. Incluye funcionalidades para crear nuevos roles, asignar roles a usuarios y visualizar estadísticas de uso.

## Características

### 🔐 Seguridad
- **Acceso restringido**: Solo los usuarios con rol "Admin" pueden acceder al módulo
- **Guard de protección**: Implementa un guard que redirige a usuarios no autorizados
- **Validación de permisos**: Verifica el rol de administrador en tiempo real

### 🎯 Funcionalidades

#### 1. Crear Nuevo Rol
- Campo de entrada para el nombre del rol
- Validación de nombres únicos
- Feedback visual durante la creación
- Manejo de errores (rol duplicado, errores de red)

#### 2. Asignar Rol a Usuario
- Selector de usuarios disponibles
- Selector de roles disponibles
- Validación de selecciones
- Confirmación de asignación exitosa

#### 3. Visualizar Roles Existentes
- Tabla con información de roles
- Contador de usuarios por rol
- Acciones de eliminación
- Estado de carga y mensajes informativos

### 🎨 Interfaz de Usuario

#### Diseño Responsivo
- Layout de dos paneles (izquierda: formularios, derecha: tabla)
- Adaptación automática para dispositivos móviles
- Animaciones suaves y feedback visual

#### Componentes Material Design
- Cards con gradientes modernos
- Botones con estados de carga
- Tablas interactivas
- Diálogos de confirmación

## Estructura del Proyecto

```
src/app/
├── pages/roles/
│   ├── roles.component.ts      # Lógica principal
│   ├── roles.component.html    # Template
│   └── roles.component.css     # Estilos
├── interfaces/
│   ├── role-request.ts         # Interfaz para crear roles
│   └── role-assignment.ts      # Interfaz para asignar roles
├── guards/
│   └── admin.guard.ts          # Guard de protección
└── services/
    └── auth.service.ts         # Métodos de API para roles
```

## Endpoints Utilizados

### Crear Rol
```http
POST /api/roles
Content-Type: application/json

{
  "roleName": "Supervisor"
}
```

### Obtener Roles
```http
GET /api/roles
```

### Asignar Rol
```http
POST /api/roles/assign
Content-Type: application/json

{
  "userId": "user-id-123",
  "roleId": "role-id-3"
}
```

### Eliminar Rol
```http
DELETE /api/roles/{roleId}
```

## Flujo de Uso

### 1. Acceso al Módulo
1. Iniciar sesión como administrador
2. Hacer clic en el menú de usuario
3. Seleccionar "Administración de Roles"

### 2. Crear un Rol
1. En el panel izquierdo, sección "Crear Nuevo Rol"
2. Ingresar el nombre del rol
3. Hacer clic en "Crear"
4. Verificar que aparece en la tabla

### 3. Asignar Rol a Usuario
1. En el panel izquierdo, sección "Asignar Rol a Usuario"
2. Seleccionar un usuario del dropdown
3. Seleccionar un rol del dropdown
4. Hacer clic en "Asignar"
5. Verificar el contador de usuarios en la tabla

### 4. Eliminar Rol
1. En la tabla de roles, hacer clic en el ícono de eliminar
2. Confirmar la eliminación en el diálogo
3. Verificar que el rol desaparece de la tabla

## Validaciones

### Frontend
- ✅ Campo de nombre requerido
- ✅ Selección de usuario y rol requerida
- ✅ Estados de carga durante operaciones
- ✅ Manejo de errores de red

### Backend
- ✅ Nombres de roles únicos
- ✅ Existencia de usuario y rol
- ✅ IDs válidos para asignaciones

## Mensajes de Error

| Error | Mensaje | Acción |
|-------|---------|--------|
| Rol duplicado | "El rol ya existe" | Usar un nombre diferente |
| Usuario no encontrado | "Usuario no encontrado" | Verificar ID del usuario |
| Error de red | "Error al [operación]" | Reintentar la operación |

## Consideraciones de Seguridad

⚠️ **Importante**: Los endpoints de roles no requieren autenticación en el backend, por lo que es crítico que:

1. Solo los administradores puedan acceder al módulo
2. Se implemente autenticación en el backend
3. Se valide la autorización en cada endpoint

## Mejoras Futuras

- [ ] Implementar autenticación en endpoints de roles
- [ ] Agregar paginación para tablas grandes
- [ ] Implementar búsqueda y filtros
- [ ] Agregar historial de cambios de roles
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar exportación de datos de roles

## Tecnologías Utilizadas

- **Angular 17** - Framework principal
- **Angular Material** - Componentes UI
- **RxJS** - Manejo de observables
- **TypeScript** - Tipado estático
- **SCSS** - Estilos avanzados

## Instalación y Uso

1. Asegurarse de tener todas las dependencias instaladas:
```bash
npm install
```

2. Compilar el proyecto:
```bash
npm run build
```

3. Ejecutar en modo desarrollo:
```bash
npm start
```

4. Acceder como administrador y navegar a `/roles`

## Soporte

Para reportar problemas o solicitar mejoras, contactar al equipo de desarrollo. 