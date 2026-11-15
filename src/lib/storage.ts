const getData = (key: string): unknown | undefined => {
  try {
    const data = localStorage.getItem(key);

    if (data) {
      return JSON.parse(data);
    }
  } catch {
    return undefined;
  }

  return undefined;
};

const setData = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // No se realiza ninguna acción si localStorage no está disponible.
  }
};

export { getData, setData };