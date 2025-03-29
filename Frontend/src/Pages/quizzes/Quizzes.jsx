import Heading1 from "../../Components/Heading1";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { QuizContext } from "../../contexts/QuizContext";
import ButtonLarge from '../../Components/ButtonLarge';



export default function Quizzes() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { quizzes, setQuizzes } = useContext(QuizContext);

  console.log('quizzes: ');
  console.log(quizzes);

  function quizJsx(quiz) {
    let types = [];
    let questions = quiz.questions;

    questions.forEach(question => {
      if (!types.includes(question.type)) {
        types.push(question.type);
      }
    });

    return (
      <div 
        key={quiz.id}
        className="w-full h-20 bg-white rounded border flex justify-between items-center px-8 cursor-pointer"
        onClick={() => navigate(`/questionnaire/${quiz.id}`)}
      >
        <p><span className="text-gray-400">ID:</span> <span className="font-semibold text-lg">{quiz.id}</span></p>
        <p><span className="text-gray-400">Name:</span> <span className="font-semibold text-lg">{quiz.name}</span></p>
        <p><span className="text-gray-400">Type/s: </span>
          {
            types.map(type => <span key={type} className="font-semibold text-lg">{type}, </span>)
          }
        </p>
        <p><span className="text-gray-400">No. of items:</span> <span className="font-semibold text-lg">{quiz.number_of_questions}</span></p>
      </div>   
    )
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Heading1>Questionnaire</Heading1>
        { currentUser.role == 'professor' && 
          <ButtonLarge 
            onClick={() => navigate('/questionnaire/create')}
          >
            Create
          </ButtonLarge> 
        }
      </div>
      <div className="space-y-4">
      {
        quizzes.map(quiz => quizJsx(quiz))
      }
      </div> 
    </>
  )
}