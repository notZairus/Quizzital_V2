import Heading1 from "../../Components/Heading1";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";



export default function Quizzes() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading1>Quizzes</Heading1>
        { currentUser.role == 'professor' && 
          <button 
            className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => navigate('/quiz/create')}
          >
            Create Quiz
          </button> 
        }
      </div>
    </>
  )
}