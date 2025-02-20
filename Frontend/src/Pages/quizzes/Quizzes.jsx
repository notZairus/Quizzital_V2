import Heading1 from "../../Components/Heading1";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { backendUrl} from '../../js/functions.js';



export default function Quizzes() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const getQuiz = async () => {
      let res = await fetch(backendUrl(`/quiz?user_id=${currentUser.id}`));
      let quizzes = await res.json();
      setQuizzes(quizzes);
    }

    getQuiz();
  }, [])
  
  return (
    <>
      <div className="flex items-start justify-between">
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
      <div className="space-y-4">
        {
          quizzes.map(quiz => (
            <div 
              className="w-full h-20 bg-white rounded border flex justify-between items-center px-8"
            >
              <p className=" "><span className="text-gray-400">ID:</span> <span className="font-semibold text-lg">{quiz.id}</span></p>
              <p className=" "><span className="text-gray-400">Name:</span> <span className="font-semibold text-lg">{quiz.name}</span></p>
              <p className=" "><span className="text-gray-400">No. of items:</span> <span className="font-semibold text-lg">{quiz.number_of_questions}</span></p>
            </div>
          ))
        }
        
      </div>
    </>
  )
}