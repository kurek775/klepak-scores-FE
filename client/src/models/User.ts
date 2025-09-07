export type UserBase = {
  tour_id?: number;
  id: number;
  sub?: string;
  email: string;
  name?: string;
  picture_url?: string;
  is_admin: boolean;
  created_at?: string;
  last_login_at?: string;
  crew_id?: number;
};
