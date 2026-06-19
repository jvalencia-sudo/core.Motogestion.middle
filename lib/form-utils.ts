export function handleNumericChange(
  onChange: (value: number | string) => void,
  value: string,
) {
  onChange(value.trim() ? Number(value) : "");
}

export const calculateNetWeight = (count: number, weight: number) =>
  count * weight;
