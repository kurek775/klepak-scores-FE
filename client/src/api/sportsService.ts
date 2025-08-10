const baseURL = import.meta.env.VITE_BE_ENDPOINT;

export async function getSports(tourId: string) {
  const res = await fetch(`${baseURL}/tours/${tourId}/sports`);

  if (!res.ok) {
    throw new Error(`Failed to fetch persons for tour ${tourId}`);
  }

  const data = await res.json();
  return data.list;
}
