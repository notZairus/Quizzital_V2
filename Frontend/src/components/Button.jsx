

export default function ButtonNormal({ children, onClick }) {
  return (
    <>
      <button 
        className="text-md px-4  py-2 bg-BackgroundColor_Darker text-white rounded hover:bg-BackgroundColor_Darkest transition-all duration-300 hover:shadow-lg flex gap-2 items-center"
        onClick={onClick}
      >
        {children}
      </button> 
    </>
  )
}