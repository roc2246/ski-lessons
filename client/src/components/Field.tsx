import type { ChangeEvent } from "react";

type FieldType = "username" | "password" | "checkbox";

interface FieldProps {
  type: FieldType;
  value: string | boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function Field({ type, value, onChange }: FieldProps) {
  return (
    <div className="field">
      <label htmlFor={type} className="field__label">
        {type === "checkbox" ? "Admin" : type}
      </label>
      <input
        type={type === "password" ? "password" : type}
        id={type}
        className="field__input"
        required={type !== "checkbox"}
        value={type === "checkbox" ? undefined : String(value)}
        checked={type === "checkbox" ? Boolean(value) : undefined}
        onChange={onChange}
      />
    </div>
  );
}
