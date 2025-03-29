import Heading1 from "../../Components/Heading1";
import { useContext, useRef, useState } from "react";
import ButtonLarge from '../../Components/ButtonLarge';
import { QuizContext } from '../../contexts/QuizContext';
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { backendUrl } from '../../js/functions.js';
import Swal from 'sweetalert2';
import { getQuizzes } from "../../js/functions.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { nanoid } from "nanoid";


export default function Show() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { insertQuiz } = useContext(QuizContext);
  const { id } = useParams(); 
  const { quizzes } = useContext(QuizContext);
  const quiz_name_ref = useRef(null);
  const [currentQuiz, setCurrentQuiz] = useState(quizzes.find(quiz => quiz.id == id));
  const [deleted, setDeleted] = useState([]);


  async function deleteQuiz() {
    Swal.fire({
      title: "Confirm Deletion? ",
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      preConfirm: async () => {
        await fetch(backendUrl('/quiz'), {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            'quiz_id': currentQuiz.id
          })
        })

        Swal.fire({
          'title': 'Success',
          'icon': 'success',
          'text': 'Quiz updated successfully!',
          preConfirm: async () => {
            await getQuizzes(currentUser, insertQuiz);
            navigate(`/questionnaire`)
          }
        })
      }
    })
  }

  async function updateQuiz() {

    let multipleChoiceQuestions = currentQuiz.questions.filter(q => q.type === "multiple_choice")
    let idenficationQuestions = currentQuiz.questions.filter(q => q.type === "identification")
    let invalid = false;

    // validate quiz name
    if (quiz_name_ref.current.value === "") {
      Swal.fire({
        icon: 'error',
        title: 'Empty Quiz Name.',
        text: 'Quiz name is required.'
      })
      return;
    }
      
    // validate multiple choice questions
    multipleChoiceQuestions.forEach(question => {
      if (question.question === "" || question.answer === "") {
        Swal.fire({
          icon: "error",
          title: "Invalid Question",
          text: "A multiple choice with a blank field is detected."
        })
        invalid = true;
      }

      if (question.choices.length < 3) {
        Swal.fire({
          icon: "error",
          title: "Invalid Question",
          text: "A multiple choice with a blank field is detected."
        })
        invalid = true;
      }

      question.choices.forEach(choice => {
        if (choice.trim().length < 1) {
          Swal.fire({
            icon: "error",
            title: "Invalid Question",
            text: "A multiple choice with a blank field is detected."
          })
          invalid = true;
          return;
        }
      })
    })

    if (invalid) return;

    idenficationQuestions.forEach(question => {
      if (question.question === "" || question.answer === "") {
        Swal.fire({
          icon: "error",
          title: "Invalid Question",
          text: "An identification with a blank field is detected."
        })
        invalid = true;
      }
    })

    if (invalid) return;


    
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
          question_id: q.id.length == 100 ? null : q.id,
          quiz_id: currentQuiz.id,
          question: q.question,
          choices: q.choices,
          answer: q.answer,
          type: q.type
        })
      })
    });

    deleted.forEach(async (q_id) => {
      let res3 = await fetch(backendUrl('/question'), {
        method: 'DELETE',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          'question_id': q_id
        })
      })
    })


    Swal.fire({
      'title': 'Success',
      'icon': 'success',
      'text': 'Quiz updated successfully!',
      preConfirm: async () => {
        await getQuizzes(currentUser, insertQuiz);
        navigate(`/questionnaire/${currentQuiz.id}`)
      }
    })
  }

  function addMCQuestion() {
    setCurrentQuiz(prev => ({...prev, questions: [...prev.questions, {id: nanoid(100), answer: "", choices: ["", "", ""], question: "", quiz_id: currentQuiz.id, type: "multiple_choice"}]}))
  }

  function addIDQuestion() {
    setCurrentQuiz(prev => ({...prev, questions: [...prev.questions, {id: nanoid(100), answer: "", choices: null, question: "", quiz_id: currentQuiz.id, type: "identification"}]}))
  }

  function removeQuestion(question_id) {
    setCurrentQuiz(prev => {
      let _questions = prev.questions.filter(qtn => qtn.id != question_id);
      return {...prev, questions: _questions}
    })

    if (question_id.length != 100) {
      setDeleted([...deleted, question_id]);
    }
  }

  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Heading1><div><span className="cursor-pointer" onClick={() => navigate('/questionnaire')}>Questionnaire &gt;</span> {currentQuiz.name}</div></Heading1>
        <button 
          className="bg-red-500 text-lg px-6 py-3 text-white rounded font-semibold shadow"
          onClick={deleteQuiz}
        >
          Delete
        </button>
      </div>

      <div className="mb-12 mt-4">
        <p className="text-xl mb-2">Name: </p>
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
                    <button onClick={() => removeQuestion(question.id)}>
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
            <div onClick={addMCQuestion} className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
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
                    <button onClick={() => removeQuestion(question.id)}>
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
            <div onClick={addIDQuestion} className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
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