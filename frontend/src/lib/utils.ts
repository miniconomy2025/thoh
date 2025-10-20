import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { BaseApiError } from "./types/shared.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isApiError(error: unknown): error is BaseApiError {
  return typeof error === "object" && error !== null && "error" in error
}

export async function manageLoading<T extends Record<string, boolean>>(
  keys: keyof T | (keyof T)[],
  setState: React.Dispatch<React.SetStateAction<T>>,
  callback: () => void | Promise<any>
): Promise<any> {
  const keyArray = Array.isArray(keys) ? keys : [keys];

  setState(previousState => {
    const updatedState = { ...previousState };
    keyArray.forEach(key => {
      updatedState[key] = true as T[typeof key];
    });
    return updatedState;
  });

  try {
    return await callback();
  } finally {
    setState(previousState => {
      const updatedState = { ...previousState };
      keyArray.forEach(key => {
        updatedState[key] = false as T[typeof key];
      });
      return updatedState;
    });
  }
}
