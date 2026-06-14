export default function Field({ type, value, onChange }) {
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
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
