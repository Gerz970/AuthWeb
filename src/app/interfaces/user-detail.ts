export interface UserDetail {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  accessFailedCount: number;
} 