import { createContext, useEffect, useState } from "react";

export const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    let storedQuizzes = JSON.parse(localStorage.getItem('quizzes'));
    if (storedQuizzes) {
      setQuizzes(storedQuizzes);
    }
  }, []);

  function insertQuiz(_quizzes) {
    localStorage.setItem("quizzes", JSON.stringify(_quizzes));
    setQuizzes(_quizzes);
  }

  return (
    <QuizContext.Provider value={{quizzes, insertQuiz}}>
      { children }
    </QuizContext.Provider>
  )
}