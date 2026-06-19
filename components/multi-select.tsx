import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";

interface MultiSelectProps<T> {
  options: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  selectedValues: Array<T[keyof T]>;
  onChange: (selected: Array<T[keyof T]>) => void;
}

function MultiSelect<T>({
  options,
  labelKey,
  valueKey,
  selectedValues,
  onChange,
}: MultiSelectProps<T>) {
  const labelMap = new Map(
    options.map((option) => [option[valueKey], option[labelKey]]),
  );

  const handleToggle = (option: T) => {
    const value = option[valueKey];
    const isSelected = selectedValues.includes(value);
    const newSelectedValues = isSelected
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const selectedLabels = selectedValues
    .map((value) => labelMap.get(value))
    .filter((label): label is T[keyof T] => label !== undefined);

  return (
    <Select>
      <SelectTrigger>
        <div className="truncate">
          {selectedLabels.length > 0
            ? selectedLabels.slice(0, 2).join(", ")
            : "Select items"}
          {selectedLabels.length > 2 && " + "}
          {selectedLabels.length > 2 && `${selectedLabels.length - 2} more`}
        </div>
      </SelectTrigger>
      <SelectContent>
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <Button
              key={String(option[valueKey])}
              variant={
                selectedValues.includes(option[valueKey])
                  ? "secondary"
                  : "ghost"
              }
              onClick={() => handleToggle(option)}
              className="transition-colors hover:bg-muted w-full text-left justify-start"
            >
              {String(option[labelKey])}
            </Button>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}

export default MultiSelect;
