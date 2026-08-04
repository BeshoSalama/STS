export function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  return base ? `${base}${path}` : `/api${path}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const externalUrl = apiUrl(path);
  const internalUrl = `/api${path}`;

  try {
    return await fetch(externalUrl, init);
  } catch (error) {
    if (externalUrl !== internalUrl) {
      return fetch(internalUrl, init);
    }
    throw error;
  }
}
