import { parseFloatingDateInput } from "@/lib/floating-date";

export function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getPositiveIntegerValue(formData: FormData, key: string) {
  const value = Number(getStringValue(formData, key));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function getRequiredDateValue(formData: FormData, key: string) {
  const value = getStringValue(formData, key);
  return parseFloatingDateInput(value);
}
