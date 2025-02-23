import Heading1 from "../../Components/Heading1";
import { useContext, useRef, useState } from "react";
import ButtonLarge from '../../Components/ButtonLarge';
import { QuizContext } from '../../contexts/QuizContext';
import { useNavigate, useParams } from "react-router-dom";
import { backendUrl } from '../../js/functions.js';
import Swal from 'sweetalert2';
import { getQuizzes } from "../../js/functions.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";


export default function QuizCreate() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { insertQuiz } = useContext(QuizContext);
  const { id } = useParams(); 
  const { quizzes } = useContext(QuizContext);
  const quiz_name_ref = useRef(null);
  const [currentQuiz, setCurrentQuiz] = useState(quizzes.find(quiz => quiz.id == id));


  async function deleteQuiz() {
    Swal.fire({
      title: "Confirm Deletion? ",
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      preConfirm: () => {
        console.log('deleted');
      }
    })
  }

  async function updateQuiz() {
    
    // Edit the Quiz name
    let res1 = await fetch(backendUrl('/quiz'), {
      method: 'PATCH',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        quiz_id: currentQuiz.id,
        quiz_name: currentQuiz.name
      })
    })

    // Edit the Quiz questions
    currentQuiz.questions.forEach(async (q) => {
      let res2 = await fetch(backendUrl('/question'), {
        method: 'PATCH',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          question_id: q.id,
          quiz_id: currentQuiz.id,
          question: q.question,
          choices: q.choices,
          answer: q.answer
        })
      })
    });

    Swal.fire({
      'title': 'Success',
      'icon': 'success',
      'text': 'Quiz updated successfully!',
      preConfirm: async () => {
        await getQuizzes(currentUser, insertQuiz);
        navigate(`/quiz/${currentQuiz.id}`)
      }
    })
  }


  return (
    <>
      <div className="flex justify-between items-start">
        <Heading1>Edit Quiz</Heading1>
        <button 
          className="bg-red-500 text-white px-4 py-2 rounded font-semibold shadow"
          onClick={deleteQuiz}
        >
          Delete Quiz
        </button>
      </div>

      <div className="mb-12 mt-4">
        <p className="text-xl mb-2">Quiz Name: </p>
        <input 
          ref={quiz_name_ref} 
          type="text" 
          className="w-1/2 text-2xl px-4 py-3 rounded border"
          value={currentQuiz.name}
          onChange={(e) => setCurrentQuiz(prev => ({...prev, 'name': e.target.value}))}
        />
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-xl mb-4">Multiple Choice</h1>
          <div className="space-y-2">
            {
              currentQuiz.questions.filter(question => question.type === "multiple_choice").map(question => (
                <div key={question.id} className="w-full max-h-80 bg-white border-black borde rounded px-4 pt-2 pb-4">
                  <div className="flex justify-end">
                    <button>
                      X
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xl mb-2">Question: </p>
                      <div className="h-full">
                        <textarea 
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.question}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions;
                            for (let i = 0; i < qtns.length; i++) {
                              if (qtns[i].id == question.id) {
                                qtns[i].question = e.target.value;
                              }
                            }
                            return {...prev, questions: qtns}
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Choices: </p>
                      <div className="space-y-2">
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[0]}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions;
                            for (let i = 0; i < qtns.length; i++) {
                              if (qtns[i].id == question.id) {
                                qtns[i].choices[0] = e.target.value;
                              }
                            }
                            return {...prev, questions: qtns}
                          })}
                        />
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[1]}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions;
                            for (let i = 0; i < qtns.length; i++) {
                              if (qtns[i].id == question.id) {
                                qtns[i].choices[1] = e.target.value;
                              }
                            }
                            return {...prev, questions: qtns}
                          })}
                        />
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[2]}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions;
                            for (let i = 0; i < qtns.length; i++) {
                              if (qtns[i].id == question.id) {
                                qtns[i].choices[2] = e.target.value;
                              }
                            }
                            return {...prev, questions: qtns}
                          })}
                        />
                        <div>
                          <p className="text-xl mb-2">Answer: </p>
                          <input 
                            type="text" 
                            className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                            value={question.answer}
                            onChange={(e) => setCurrentQuiz(prev => {
                              let qtns = prev.questions;
                              for (let i = 0; i < qtns.length; i++) {
                                if (qtns[i].id == question.id) {
                                  qtns[i].answer = e.target.value;
                                }
                              }
                              return {...prev, questions: qtns}
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
            <div className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
              Add Multiple Choice Question
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-xl mb-4">Identifications</h1>
          <div className="space-y-2">
            {
              currentQuiz.questions.filter(question => question.type === "identification").map(question => (
                <div key={question.id} className="w-full max-h-80 bg-white border-black borde rounded px-4 pt-2 pb-4">
                  <div className="flex justify-end">
                    <button>
                      X
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col">
                      <p className="text-xl mb-2">Question: </p>
                      <div className="h-full">
                        <textarea 
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.question}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions;
                            for (let i = 0; i < qtns.length; i++) {
                              if (qtns[i].id == question.id) {
                                qtns[i].question = e.target.value;
                              }
                            }
                            return {...prev, questions:qtns}
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Answer: </p>
                      <input 
                        type="text" 
                        className="w-full font-lg py-2 px-4 resize-none border rounded"
                        value={question.answer}
                        onChange={(e) => setCurrentQuiz(prev => {
                          let qtns = prev.questions;
                          for (let i = 0; i < qtns.length; i++) {
                            if (qtns[i].id == question.id) {
                              qtns[i].answer = e.target.value;
                            }
                          }
                          return {...prev, questions:qtns}
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))
            }
            <div className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
              Add Identification Question
            </div>
          </div>    
          
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <ButtonLarge onClick={updateQuiz}>Update Quiz</ButtonLarge>
      </div>
    </>
  )
}