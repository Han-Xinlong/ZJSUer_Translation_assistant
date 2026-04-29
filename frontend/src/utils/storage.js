export const HISTORY_KEY = "zjsuer.translation.history";
export const EXPRESSIONS_KEY = "zjsuer.translation.expressions";
export const ERRORS_KEY = "zjsuer.translation.errors";
export const GOALS_KEY = "zjsuer.translation.goals";

export function loadCollection(key, fallback = []) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function saveCollection(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadObject(key, fallback = {}) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const value = JSON.parse(raw);
    return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function saveObject(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveUniqueItem(items, text, source) {
  const normalized = text.trim();
  if (!normalized) {
    return items;
  }

  const exists = items.some((item) => item.text === normalized && item.source === source);
  if (exists) {
    return items;
  }

  return [
    {
      id: crypto.randomUUID(),
      text: normalized,
      source,
      createdAt: new Date().toISOString()
    },
    ...items
  ];
}
