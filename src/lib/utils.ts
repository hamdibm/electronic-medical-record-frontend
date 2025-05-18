import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function groupBySpecialty<T extends { specialty: string }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const { specialty } = item;
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}