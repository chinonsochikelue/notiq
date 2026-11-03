import clsxModule, { type ClassValue, clsx as namedClsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const clsx = typeof namedClsx === 'function' ? namedClsx : (typeof clsxModule === 'function' ? clsxModule : (clsxModule as any)?.default)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
