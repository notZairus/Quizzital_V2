

export default function ButtonLarge({ children, onClick }) {
  return (
    <>
      <button 
        className="bg-BackgroundColor_Darker text-lg px-6 py-3 text-white rounded hover:bg-BackgroundColor_Darkest transition-all duration-300 hover:shadow-lg"
        onClick={onClick}
      >
        {children}
      </button> 
    </>
  )
}