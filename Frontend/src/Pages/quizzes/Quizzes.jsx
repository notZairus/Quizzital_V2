import Heading1 from "../../Components/Heading1";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { QuizContext } from "../../contexts/QuizContext";
import ButtonLarge from '../../Components/ButtonLarge';
import { FaClipboardList, FaQuestionCircle } from 'react-icons/fa';



export default function Quizzes() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { quizzes, setQuizzes } = useContext(QuizContext);

  console.log('quizzes: ', quizzes);


  function quizJsx(quiz) {
    // Create a Set to ensure unique types only
    const types = new Set();
    const questions = quiz.questions;

    questions.forEach(question => {
      const questionType = question.type === "identification" ? "IDQ" : "MCQ";
      types.add(questionType);
    });

    return (
      <div 
        key={quiz.id}
        className="w-full bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest rounded-xl p-6 cursor-pointer transition-all transform hover:scale-105 hover:shadow-xl flex flex-col justify-between gap-6"
        onClick={() => navigate(`/questionnaire/${quiz.id}`)}
      >
        <div className="text-white flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{quiz.name}</h2>
          <div className="bg-white text-gray-700 py-1 px-4 rounded-full text-sm font-semibold">
            ID: {quiz.id}
          </div>
        </div>

        <div className="flex items-center gap-3 text-white">
          <div className="flex items-center gap-2">
            {Array.from(types).map((type, index) => (
              <div key={type} className="flex items-center gap-1">
                {type === "IDQ" ? (
                  <FaQuestionCircle className="text-2xl" />
                ) : (
                  <FaClipboardList className="text-2xl" />
                )}
                <span className="font-semibold">{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-white">
          <span className="text-lg font-semibold">No. of items:</span>
          <span className="text-xl">{quiz.number_of_questions}</span>
        </div>
      </div>   
    );
  }

  

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Heading1 className="text-2xl md:text-3xl font-semibold">Questionnaire</Heading1>
        {currentUser.role === 'professor' && (
          <ButtonLarge 
            onClick={() => navigate('/questionnaire/create')}
            className="px-6 py-3 text-sm md:text-base"
          >
            Create
          </ButtonLarge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => quizJsx(quiz))}
      </div>
    </>
  );
}