export default function Field({ type, value, onchange }) {
  return (
    <div className="login__field">
      <label htmlFor={type} className="login__label">
        {type}
      </label>
      <input
        type={type === "password" ? "password" : type}
        id={type}
        className="login__input"
        required
        value={value}
        onChange={onchange}
      />
    </div>
  );
}
