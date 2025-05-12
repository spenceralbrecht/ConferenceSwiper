// localStorage wrapper with type safety

/**
 * Get data from localStorage
 * @param key The key to retrieve
 * @returns The parsed data or null if not found
 */
export function getStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Set data in localStorage
 * @param key The key to set
 * @param value The value to store
 * @returns Boolean indicating success
 */
export function setStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Remove data from localStorage
 * @param key The key to remove
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage (${key}):`, error);
  }
}

/**
 * Clear all data in localStorage
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
}
