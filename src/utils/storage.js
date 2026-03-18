export const storage = {
  get: (key) => {
    try {
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  },
  remove: (key) => {
    try { localStorage.removeItem(key); } catch {}
  }
};
