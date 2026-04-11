
// ligh way clsx
// allows to filter out falsy values,
// returning a class string.
export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(' ');
}

