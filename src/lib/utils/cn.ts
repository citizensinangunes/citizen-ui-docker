import { type ClassValue, clsx } from 'clsx';

/**
 * Utility function to merge class names conditionally
 * Similar to clsx but with better TypeScript support
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Utility to conditionally apply styles
 */
export function conditionalStyle(
  condition: boolean,
  trueStyle: string,
  falseStyle?: string
): string {
  return condition ? trueStyle : falseStyle || '';
} 