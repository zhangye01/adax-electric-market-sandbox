export function withFakeWindow(callback, overrides = {}) {
  const previousWindow = globalThis.window;
  const store = new Map();
  const fakeWindow = {
    localStorage: {
      getItem(key) {
        return store.has(key) ? store.get(key) : null;
      },
      setItem(key, value) {
        store.set(key, String(value));
      },
      removeItem(key) {
        store.delete(key);
      }
    },
    ...overrides
  };

  globalThis.window = fakeWindow;
  try {
    return callback({ store, window: fakeWindow });
  } finally {
    if (previousWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = previousWindow;
    }
  }
}
