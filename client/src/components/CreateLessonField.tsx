import React from "react";

type CreateLessonFieldType = "text" | "number" | "date" | "select";

interface LessonFieldOption {
  value: string | number;
  label: string;
}

interface CreateLessonFieldProps {
  label: string;
  name: string;
  type?: CreateLessonFieldType;
  value: string | number | null;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  options?: LessonFieldOption[];
  min?: number;
  required?: boolean;
}

export default function CreateLessonField({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  min,
  required = false,
}: CreateLessonFieldProps) {
  const normalizedValue = value ?? "";

  // Ensure select always has a valid value
  const selectValue = type === "select" ? normalizedValue || options[0]?.value || "" : normalizedValue;

  return (
    <div className="create-lesson__field">
      <label>
        {label}
        {type === "select" ? (
          <select name={name} value={selectValue} onChange={onChange} required={required}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={normalizedValue}
            onChange={onChange}
            min={min}
            required={required}
          />
        )}
      </label>
    </div>
  );
}
