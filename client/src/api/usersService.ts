import type { AssignedUser, UserBase } from "../models/User";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

async function handle(res: Response) {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export async function listUsers(tourId: string): Promise<AssignedUser[]> {
  const res = await fetch(`${baseURL}/admin/users/tours/${tourId}`, {
    credentials: "include",
  });
  return (await handle(res)) as AssignedUser[];
}
export async function listPendingUsers(): Promise<UserBase[]> {
  const res = await fetch(`${baseURL}/admin/users/pending`, {
    credentials: "include",
  });
  return (await handle(res)) as UserBase[];
}
