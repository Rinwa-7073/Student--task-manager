/**
 * Central place to read Vite env vars. Importing from here (instead of
 * `import.meta.env` scattered across the codebase) means there is one
 * place to update if a variable is renamed, and one place to document
 * what each variable does.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
} as const;
