export default function Field({ type, value, onchange }) {
  return (
    <div className="field">
      <label htmlFor={type} className="field__label">
        {type}
      </label>
      <input
        type={type === "password" ? "password" : type}
        id={type}
        className="field__input"
        required = {type !=="checkbox" && "true"}
        value={value}
        onChange={onchange}
      />
    </div>
  );
}
