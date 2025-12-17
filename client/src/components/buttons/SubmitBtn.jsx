export default function SumbitBtn({type, children}){
    return(
      <button type="submit" className={`btn btn--primary ${type}__submit`}>
         {children}
        </button>
    )
}