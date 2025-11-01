import type { TourCreate, TourDTO, TourUpdate } from "../models/Tour";

// src/api/toursService.ts
const baseURL = import.meta.env.VITE_BE_ENDPOINT;

async function handle(res: Response) {
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`${res.status} ${msg}`);
  }
  return res.json();
}

export async function listTours(init?: RequestInit): Promise<TourDTO[]> {
  const res = await fetch(`${baseURL}/tours`, {
    method: "GET",
    ...init,
  });
  return (await handle(res)) as TourDTO[];
}

export async function createTour(
  payload: TourCreate,
  init?: RequestInit
): Promise<TourDTO> {
  const res = await fetch(`${baseURL}/tours`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(payload),
    ...init,
  });
  return (await handle(res)) as TourDTO;
}

export async function updateTour(
  tourId: number | string,
  payload: TourUpdate,
  init?: RequestInit
): Promise<TourDTO> {
  const res = await fetch(`${baseURL}/tours/${tourId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(payload),
    ...init,
  });
  return (await handle(res)) as TourDTO;
}
