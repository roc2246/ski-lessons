import type { ReactNode } from "react";

interface SubmitBtnProps {
    type: string;
    children: ReactNode;
}

export default function SumbitBtn({type, children}: SubmitBtnProps){
    return(
      <button type="submit" className={`btn btn--primary ${type}__submit`}>
         {children}
        </button>
    )
}