export function excludeFun(user: unknown, keys: string[]) {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key)),
  );
}
