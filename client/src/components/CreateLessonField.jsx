import React from "react";

export default function CreateLessonField({
  label,
  name,
  type = "text",
  value,
  onChange,
  options = [],
  min,
  required = false,
}) {
  // Ensure select always has a valid value
  const selectValue = type === "select" ? value || options[0]?.value || "" : value;

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
            value={value}
            onChange={onChange}
            min={min}
            required={required}
          />
        )}
      </label>
    </div>
  );
}
