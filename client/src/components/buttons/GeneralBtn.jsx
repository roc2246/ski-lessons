export default function GeneralBtn({ type = "primary", onClick, children }) {
  return (
    <button
      type="button"
      className={`btn btn--${type} instructor__btn`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
