import type { SportDTO } from "../models/Sport";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

async function getBaseSports(url: string) {
  const res = await fetch(`${baseURL}/${url}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sports`);
  }
  const data = await res.json();
  return data.list;
}

async function saveBaseSports(
  url: string,
  sports: SportDTO[]
): Promise<SportDTO[]> {
  const res = await fetch(`${baseURL}/${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sports),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to save sports: ${res.status} ${msg}`);
  }

  const data = await res.json();
  return data.list as SportDTO[];
}

export async function getTourSports(tourId: string) {
  return await getBaseSports(`sports/tour/${tourId}`);
}
export async function saveTourSports(
  tourId: string,
  sports: SportDTO[]
): Promise<SportDTO[]> {
  return await saveBaseSports(`sports/tour/${tourId}`, sports);
}
export async function getAllSports() {
  return await getBaseSports(`sports`);
}
export async function saveAllSports(sports: SportDTO[]): Promise<SportDTO[]> {
  return await saveBaseSports(`sports`, sports);
}
