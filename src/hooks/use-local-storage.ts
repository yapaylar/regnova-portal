"use client";

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHydrated(true);
      return;
    }
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        setStoredValue(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse localStorage value", error);
      }
    }
    setHydrated(true);
  }, [key]);

  const setValue = (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(nextValue));
      }
      return nextValue;
    });
  };

  const resetValue = () => {
    setStoredValue(initialValue);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
  };

  return { value: storedValue, setValue, resetValue, hydrated };
}


