import { data } from "react-router";
import type { UserBase } from "../models/User";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

async function handle(res: Response) {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export async function listUsers(tourId: string): Promise<UserBase[]> {
  const res = await fetch(`${baseURL}/admin/users/tours/${tourId}`, {
    credentials: "include",
  });
  return (await handle(res)) as UserBase[];
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
        return {
          ...x,
          tour_id: Number(x.tour_id) == 0 ? null : Number(x.tour_id),
        };
      })
    ),
  });
  return (await handle(res)) as UserBase[];
}
export async function updateUsers(
  tourId: string,
  payload: UserBase[]
): Promise<UserBase[]> {
  const res = await fetch(`${baseURL}/admin/users/tours/${tourId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify(
      payload.map((x) => {
        return {
          ...x,
          crew_id: Number(x.crew_id) == 0 ? null : Number(x.crew_id),
        };
      })
    ),
  });
  return (await handle(res)) as UserBase[];
}
