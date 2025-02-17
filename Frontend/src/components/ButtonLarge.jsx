


export default function ButtonLarge({ children, onClick }) {
  return (
    <>
      <button 
        className="bg-BackgroundColor_Darker text-white px-6 py-3 text-lg rounded font-semibold shadow"
        onClick={onClick}
      >
        {children}
      </button> 
    </>
  )
}