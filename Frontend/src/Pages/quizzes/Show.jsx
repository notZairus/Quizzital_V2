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
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";


export default function Show() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { insertQuiz } = useContext(QuizContext);
  const { refreshClassroom } = useContext(ClassroomContext);
  const { id } = useParams(); 
  const { quizzes } = useContext(QuizContext);
  const quiz_name_ref = useRef(null);
  const [currentQuiz, setCurrentQuiz] = useState(quizzes.find(quiz => quiz.id == id));
  const [deleted, setDeleted] = useState([]);

  console.log(currentQuiz)


  function deleteQuiz() {
    Swal.fire({
      title: "Confirm Deletion? ",
      icon: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      preConfirm: async () => {
        let res = await fetch(backendUrl('/quiz'), {
          method: 'DELETE',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            'quiz_id': currentQuiz.id
          })
        })

        if (!res.ok) {
          Swal.fire({
            title: 'Unknown Error!'
          })
        }

        Swal.fire({
          'title': 'Success',
          'icon': 'success',
          'text': 'Quiz updated successfully!',
          preConfirm: async () => {
            refreshClassroom()
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

    if(multipleChoiceQuestions.length + idenficationQuestions.length === 0) {
      deleteQuiz()
      return;
    }

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
      <div className="flex justify-between items-center mb-6">

        <Heading1>
          <div className="text-2xl md:text-3xl font-semibold space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-blue-500 cursor-pointer hover:underline text-base md:text-lg"
                onClick={() => navigate('/questionnaire')}
              >
                Questionnaire &gt;
              </span>
              <span>{currentQuiz.name}</span>
            </div>
          </div>
        </Heading1>
        


        <button 
          className="bg-red-500 hover:bg-red-600 transition text-lg px-6 py-3 text-white rounded-2xl font-semibold shadow-md"
          onClick={deleteQuiz}
        >
          Delete
        </button>
      </div>

      <div className="mb-12 mt-6">
        <label className="text-xl font-medium block mb-2">Name:</label>
        <input 
          ref={quiz_name_ref} 
          type="text" 
          className="w-full max-w-xl text-2xl px-4 py-3 rounded-xl border shadow-sm"
          value={currentQuiz.name}
          onChange={(e) => setCurrentQuiz(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      
      <div className="space-y-12">
        {/* Multiple Choice Section */}
        <section>
          <h1 className="text-2xl font-semibold mb-6">Multiple Choice</h1>
          <div className="space-y-6">
            {currentQuiz.questions.filter(q => q.type === "multiple_choice").map(question => (
              <div key={question.id} className="bg-white border rounded-2xl shadow-sm transition hover:shadow-md px-6 pt-4 pb-6">
                <div className="flex justify-end">
                  <button 
                    onClick={() => removeQuestion(question.id)} 
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-6">
                  <div className="flex-1 flex flex-col">
                    <label className="text-lg font-medium mb-2">Question:</label>
                    <textarea 
                      className="w-full text-lg px-4 py-3 border rounded-lg resize-none shadow-sm"
                      value={question.question}
                      onChange={(e) => setCurrentQuiz(prev => {
                        let qtns = prev.questions.map(q => 
                          q.id === question.id ? { ...q, question: e.target.value } : q
                        );
                        return { ...prev, questions: qtns };
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-lg font-medium mb-2 block">Choices:</label>
                    <div className="space-y-3">
                      {question.choices.map((choice, idx) => (
                        <input 
                          key={idx}
                          type="text"
                          className="w-full text-lg px-4 py-2 border rounded-lg shadow-sm"
                          value={choice}
                          onChange={(e) => setCurrentQuiz(prev => {
                            let qtns = prev.questions.map(q => {
                              if (q.id === question.id) {
                                let updatedChoices = [...q.choices];
                                updatedChoices[idx] = e.target.value;
                                return { ...q, choices: updatedChoices };
                              }
                              return q;
                            });
                            return { ...prev, questions: qtns };
                          })}
                        />
                      ))}
                    </div>
                    <div className="mt-4">
                      <label className="text-lg font-medium mb-2 block">Answer:</label>
                      <input 
                        type="text" 
                        className="w-full text-lg px-4 py-2 border rounded-lg shadow-sm"
                        value={question.answer}
                        onChange={(e) => setCurrentQuiz(prev => {
                          let qtns = prev.questions.map(q => 
                            q.id === question.id ? { ...q, answer: e.target.value } : q
                          );
                          return { ...prev, questions: qtns };
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div 
              onClick={addMCQuestion} 
              className="w-full h-16 bg-white text-gray-500 border rounded-2xl flex items-center justify-center text-lg cursor-pointer hover:bg-gray-50"
            >
              + Add Multiple Choice Question
            </div>
          </div>
        </section>

        {/* Identification Section */}
        <section>
          <h1 className="text-2xl font-semibold mb-6">Identifications</h1>
          <div className="space-y-6">
            {currentQuiz.questions.filter(q => q.type === "identification").map(question => (
              <div key={question.id} className="bg-white border rounded-2xl shadow-sm transition hover:shadow-md px-6 pt-4 pb-6">
                <div className="flex justify-end">
                  <button 
                    onClick={() => removeQuestion(question.id)} 
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
                <div className="flex gap-6">
                  <div className="flex-1 flex flex-col">
                    <label className="text-lg font-medium mb-2">Question:</label>
                    <textarea 
                      className="w-full text-lg px-4 py-3 border rounded-lg resize-none shadow-sm"
                      value={question.question}
                      onChange={(e) => setCurrentQuiz(prev => {
                        let qtns = prev.questions.map(q => 
                          q.id === question.id ? { ...q, question: e.target.value } : q
                        );
                        return { ...prev, questions: qtns };
                      })}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-lg font-medium mb-2">Answer:</label>
                    <input 
                      type="text" 
                      className="w-full text-lg px-4 py-2 border rounded-lg shadow-sm"
                      value={question.answer}
                      onChange={(e) => setCurrentQuiz(prev => {
                        let qtns = prev.questions.map(q => 
                          q.id === question.id ? { ...q, answer: e.target.value } : q
                        );
                        return { ...prev, questions: qtns };
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
            <div 
              onClick={addIDQuestion} 
              className="w-full h-16 bg-white text-gray-500 border rounded-2xl flex items-center justify-center text-lg cursor-pointer hover:bg-gray-50"
            >
              + Add Identification Question
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 flex justify-end">
        <ButtonLarge onClick={updateQuiz}>Update Questionnaire</ButtonLarge>
      </div>
    </>

  )
}