import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * supabase.functions.invoke() turns every non-2xx response into a generic
 * "Edge Function returned a non-2xx status code"; the function's own reason
 * ({ error: "..." }) is in the response body. Pull it out so users see it.
 */
export async function functionErrorMessage(error: unknown, fallback = 'Something went wrong'): Promise<string> {
  const context = (error as { context?: unknown } | null)?.context;
  if (context instanceof Response) {
    try {
      const body = await context.clone().json();
      if (typeof body?.error === 'string' && body.error) return body.error;
      if (typeof body?.message === 'string' && body.message) return body.message;
    } catch {
      // Body wasn't JSON — fall through to the generic message.
    }
  }
  return (error as Error | null)?.message || fallback;
}
