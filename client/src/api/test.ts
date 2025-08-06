// src/api/getPersonsByTourId.ts
export type Person = {
  id: number;
  name: string;
  cre_id: number;
  category: string;
};

export async function getPersonsByTourId(tourId: number): Promise<Person[]> {
  const res = await fetch(`http://127.0.0.1:8000/api/tours/${tourId}/persons/`);

  if (!res.ok) {
    throw new Error(`Failed to fetch persons for tour ${tourId}`);
  }

  const data = await res.json();
  return data.list;
}
