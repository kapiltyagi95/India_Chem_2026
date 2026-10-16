import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format } from 'date-fns';
// Function to format lastUpdated date
export const formatDate = (lastUpdated: string | number | Date) => {
  if (lastUpdated) {
    return format(new Date(lastUpdated), "d MMMM, yyyy h:mm a");
  } else {
    return "N/A";
  }
};
