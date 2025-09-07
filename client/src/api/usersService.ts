import { data } from "react-router";
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
export async function updatePendingUsers(
  payload: UserBase[]
): Promise<UserBase[]> {
  const res = await fetch(`${baseURL}/admin/users/pending`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(
      payload.map((x) => {
        return { ...x, tour_id: isNaN(x.tour_id as number) ? null : x.tour_id };
      })
    ),
  });
  return (await handle(res)) as UserBase[];
}
