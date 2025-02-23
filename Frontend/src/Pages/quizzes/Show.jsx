import { useNavigate, useParams } from "react-router-dom";
import Heading1 from "../../Components/Heading1";
import { useState, useContext } from "react";
import { QuizContext } from "../../contexts/QuizContext";




export default function QuizShow() {
  const navigate = useNavigate()
  const { id } = useParams();
  const { quizzes } = useContext(QuizContext);
  const [currentQuiz, setCurrentQuiz] = useState(quizzes.find(quiz => quiz.id == id));

  console.log(id);
  console.log(currentQuiz);

  return (
    <>
      <Heading1>{currentQuiz.name}</Heading1>
      <div className="flex flex-col justify-end items-start">
        <button onClick={() => navigate(`/quiz/${id}/edit`)}>
          Edit Quiz
        </button>
        <button onClick={() => navigate(`/quiz/${id}/assign`)}>
          Assign Quiz
        </button>
      </div>
    </>

  )
}