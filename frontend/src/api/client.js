const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getStatus() {
  const response = await fetch(`${API_BASE}/api/status`);

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch service status"));
  }

  return response.json();
}

export async function translate(payload) {
  const response = await fetch(`${API_BASE}/api/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to translate text"));
  }

  return response.json();
}

export async function polish(payload) {
  const response = await fetch(`${API_BASE}/api/polish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to polish text"));
  }

  return response.json();
}

async function readError(response, fallback) {
  try {
    const payload = await response.json();
    return payload.detail || fallback;
  } catch {
    return fallback;
  }
}
