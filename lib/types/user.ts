export type UserWithPermissions = {
  userId: number;
  userName: string;
  email: string;
  subId: string;
  clientId: number | null;
  permissions: string[];
  nombreTal?: string | null;
  perfil?: string | null;
};
