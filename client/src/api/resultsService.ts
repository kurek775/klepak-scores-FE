import type { Result } from "../models/Result";

const baseURL = import.meta.env.VITE_BE_ENDPOINT;

export async function getCrewResultsInSport(
  tourId: string,
  crewId: string,
  sportId: string
): Promise<Result[]> {
  const res = await fetch(
    `${baseURL}/tours/${tourId}/crews/${crewId}/sport/${sportId}`
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch persons for tour ${tourId}`);
  }

  const data = await res.json();
  return data.list;
}

export async function saveCrewResultsInSport(
  tourId: string,
  crewId: string,
  sportId: string,
  results: Result[]
): Promise<{ status: string; updated: number }> {
  const isPost = results.find((item) => !item?.result_id);

  const res = await fetch(
    `${baseURL}/tours/${tourId}/crews/${crewId}/sport/${sportId}`,
    {
      method: isPost ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to save results: ${err.detail || res.statusText}`);
  }

  return await res.json();
}
