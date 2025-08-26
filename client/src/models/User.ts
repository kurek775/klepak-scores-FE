export interface UserBase {
  id: number;
  sub?: string;
  email: string;
  name?: string;
  picture_url?: string;
  is_admin: boolean;
  created_at?: string;
  last_login_at?: string;
}

export interface AssignedUser extends UserBase {
  crew_id: number;
}
