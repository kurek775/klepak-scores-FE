// src/api/getPersonsByTourId.ts
export type Person = {
  id: number;
  person_name: string;
  score: number;
  category: string;
};
const baseURL = "http://127.0.0.1:8000/api";

export async function getSports(tourId: number) {
  const res = await fetch(`${baseURL}/tours/${tourId}/sports`);

  if (!res.ok) {
    throw new Error(`Failed to fetch persons for tour ${tourId}`);
  }

  const data = await res.json();
  return data.list;
}

export async function getCrewResultsInSport(
  tourId: number,
  crewId: number,
  sportId: number
): Promise<Person[]> {
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
  tourId: number,
  crewId: number,
  sportId: number,
  results: any[]
): Promise<{ status: string; updated: number }> {
  const res = await fetch(
    `${baseURL}/tours/${tourId}/crews/${crewId}/sport/${sportId}`,
    {
      method: "PUT",
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
