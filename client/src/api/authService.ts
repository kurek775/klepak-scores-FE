export async function getMe() {
  const res = await fetch(`${import.meta.env.VITE_BE_ENDPOINT}/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = await res.json();

  return {
    sub: data.sub,
    email: data.email,
    name: data.name,
    picture: data.picture,
    isAdmin: data.is_admin ?? data.isAdmin ?? false,
    crewId: data.crew_id ?? data.crew_id ?? null,
    tourId: data.tour_id ?? data.tourId ?? null,
  };
}

export async function logout() {
  await fetch(`${import.meta.env.VITE_AUTH_ENDPOINT}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
