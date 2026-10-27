/** Join class names, skipping empty ones: cx("chip", active && "is-active"). */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
