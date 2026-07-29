import type { ReactNode } from "react";

interface GeneralBtnProps {
  type?: string;
  onClick?: () => void | Promise<void>;
  children: ReactNode;
}

export default function GeneralBtn({ type = "primary", onClick, children }: GeneralBtnProps) {
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
