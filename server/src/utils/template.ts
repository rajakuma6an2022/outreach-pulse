// "Hi {{name}}" -> "Hi Ravi Kumar". Theriyaadha placeholder-ah apdiye vittudum (typo easy-ah theriyum)
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match
  );
}