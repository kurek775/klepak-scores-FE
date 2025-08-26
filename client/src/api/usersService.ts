import type { AssignedUser, UserBase } from "../models/User";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

async function handle(res: Response) {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export async function listUsers(tourId: number): Promise<AssignedUser[]> {
  const res = await fetch(`${baseURL}/admin/tour/${tourId}/users`, {
    method: "GET",
  });
  return (await handle(res)) as AssignedUser[];
}
export async function listPendingUsers(): Promise<UserBase[]> {
  const res = await fetch(`${baseURL}/admin/users/pending`, {
    method: "GET",
  });
  return (await handle(res)) as UserBase[];
}
