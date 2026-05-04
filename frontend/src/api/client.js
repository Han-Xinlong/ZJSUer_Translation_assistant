const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

export function buildApiUrl(path, apiBase = API_BASE) {
  return `${apiBase.replace(/\/+$/, "")}${path}`;
}

export async function getStatus() {
  const response = await fetch(buildApiUrl("/api/status"));

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch service status"));
  }

  return response.json();
}

export async function register(payload) {
  return authRequest("/api/auth/register", payload);
}

export async function login(payload) {
  return authRequest("/api/auth/login", payload);
}

export async function getCurrentUser(token) {
  const response = await fetch(buildApiUrl("/api/auth/me"), {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch current user"));
  }

  return response.json();
}

export async function logout(token) {
  const response = await fetch(buildApiUrl("/api/auth/logout"), {
    method: "POST",
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to logout"));
  }

  return response.json();
}

export async function getLearningState(token) {
  const response = await fetch(buildApiUrl("/api/learning-state"), {
    headers: authHeaders(token)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to fetch learning state"));
  }

  return response.json();
}

export async function saveLearningState(token, payload) {
  const response = await fetch(buildApiUrl("/api/learning-state"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token)
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Failed to save learning state"));
  }

  return response.json();
}

export async function translate(payload) {
  const response = await fetch(buildApiUrl("/api/translate"), {
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
  const response = await fetch(buildApiUrl("/api/polish"), {
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
    if (typeof payload.detail === "string") {
      return payload.detail;
    }
    if (Array.isArray(payload.detail)) {
      const firstMessage = payload.detail
        .map((item) => item?.msg)
        .find((message) => typeof message === "string");
      return firstMessage ? `请检查输入内容：${firstMessage}` : "请补充必填信息后再试。";
    }
    return fallback;
  } catch {
    return fallback;
  }
}

async function authRequest(path, payload) {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await readError(response, "Authentication request failed"));
  }

  return response.json();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
