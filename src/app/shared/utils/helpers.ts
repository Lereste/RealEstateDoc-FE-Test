export function generateRandomId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

export function compare<T>(a: T, b: T, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}