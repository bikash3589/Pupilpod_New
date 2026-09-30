/**
 * Extracts `key:value` tokens and standalone "quoted phrases" out of a search
 * string before it's used for a LIKE-style match. A bare quoted phrase (no
 * `key:` prefix) is stripped out but contributes nothing to filterBy — that's
 * a deliberate legacy quirk, not a bug, so it's replicated as-is.
 */
export function parseAdvancedSearchFilters(text: string): {
  filterBy: Record<string, string>;
  text: string;
} {
  const filterBy: Record<string, string> = {};

  const remainder = text.replace(/(\w*:\w*|(?:"[^"]*"))+/g, (match) => {
    if (match.includes(":")) {
      const [name, ...rest] = match.split(":");
      const value = rest.join(":").replace(/"/g, "");
      if (name && value) filterBy[name] = value;
    }
    return "";
  });

  return { filterBy, text: remainder.trim() };
}

export function sanitizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9._]/g, "");
}
