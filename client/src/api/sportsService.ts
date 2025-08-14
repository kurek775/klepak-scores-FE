import type { SportBase, SportDTO } from "../models/Sport";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

export async function getSports(tourId: string) {
  const res = await fetch(`${baseURL}/tours/${tourId}/sports`);

  if (!res.ok) {
    throw new Error(`Failed to fetch persons for tour ${tourId}`);
  }

  const data = await res.json();
  return data.list;
}

export async function saveSports(
  tourId: string,
  sports: SportBase[]
): Promise<SportDTO[]> {
  const res = await fetch(`${baseURL}/tours/${tourId}/sports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sports }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(
      `Failed to save sports for tour ${tourId}: ${res.status} ${msg}`
    );
  }

  const data = await res.json();
  return data.list as SportDTO[];
}
