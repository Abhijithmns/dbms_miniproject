/** Prefix a file in public/ with the base path (set when the site lives in a sub-folder). */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
