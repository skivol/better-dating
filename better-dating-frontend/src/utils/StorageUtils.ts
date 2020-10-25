export const storageCreator = (key: string) => ({
  load: () => {
    const registrationData = localStorage.getItem(key) || "{}";
    return JSON.parse(registrationData);
  },
  save: (values: any) => {
    localStorage.setItem(key, JSON.stringify(values));
  },
  clear: () => {
    localStorage.removeItem(key);
  },
});
