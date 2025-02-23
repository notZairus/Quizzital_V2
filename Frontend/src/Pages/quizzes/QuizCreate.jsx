import Heading1 from "../../Components/Heading1";
import Swal from 'sweetalert2';
import { useContext, useRef, useState } from "react";
import { backendUrl } from '../../js/functions';
import ButtonLarge from '../../Components/ButtonLarge';
import { AuthContext } from '../../contexts/AuthContext';
import { QuizContext } from '../../contexts/QuizContext';
import { useNavigate } from "react-router-dom";


export default function QuizCreate() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { quizzes, insertQuiz } = useContext(QuizContext);
  const [ multipleChoiceQuestions, setMultipleChoiceQuestions ] = useState([]);
  const [ idenficationQuestions, setIdenficationQuestions ] = useState([]);
  const quiz_name_ref = useRef(null);
  console.log(currentUser)

  async function createQuiz() {

    // check if the quiz name is empty
    if (quiz_name_ref.current.value === "") {
      Swal.fire({
        icon: 'error',
        title: 'Empty Quiz Name.',
        text: 'Quiz name is required.'
      })
      return;
    }

    // check if there are any questions
    if (multipleChoiceQuestions.length + idenficationQuestions.length < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Quiz',
        text: 'A quiz should have 1 or more questions.'
      })
      return;
    }


    let invalid = false;
  
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


    // after validation, insert on db

    let res1 = await fetch(backendUrl('/quiz'), {
      method: 'POST',
      headers: {
        'Content-type' : 'application/json'
      },
      body: JSON.stringify({
        'user_id': currentUser.id,
        'name': quiz_name_ref.current.value,
        'number_of_questions': multipleChoiceQuestions.length + idenficationQuestions.length
      })
    });

    let quiz = await res1.json();

    const allQuestions = [...multipleChoiceQuestions, ...idenficationQuestions];
    allQuestions.forEach(async (question) => {
      let res2 = await fetch(backendUrl('/question'), {
        method: 'POST',
        headers: {
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({
          'quiz_id': quiz.id,
          'question': question.question,
          'type': question.type,
          'choices': 'choices' in question ? question.choices : null,
          'answer': question.answer
        })
      })
    })

    Swal.fire({
      icon: 'success',
      title: 'Quiz Created',
      text: 'Quiz successfully created.',
      preConfirm: async () => {
        let res3 = await fetch(backendUrl(`/quiz?user_id=${currentUser.id}`));
        let newQuizzes = await res3.json();
        insertQuiz(newQuizzes);

        navigate('/quiz');
      }
    })
  }


  function showAi() {
    Swal.fire({
      title: 'Ai',
      html: `
          <textarea class="w-full h-80 border-2 border-black/20 resize-none p-4"> </textarea>
      `,
      confirmButtonText: 'Extract Questions'
    })
  }

  function addMultipleChoiceQuestion() {
    setMultipleChoiceQuestions([...multipleChoiceQuestions, {question: "", choices: [], answer: "", type: "multiple_choice"}]);
  }

  function addIdentificationQuestion() {
    setIdenficationQuestions([...idenficationQuestions, {question: "", answer: "", type: "identification"}]);
  }

  return (
    <>
      <Heading1>Create Quiz</Heading1>

      <div className="my-12">
        <p className="text-xl mb-2">Quiz Name: </p>
        <input ref={quiz_name_ref} type="text" className="w-1/2 text-2xl px-4 py-3 rounded border"/>
      </div>
      
      <div className="space-y-8">
        <div>
          <h1 className="text-xl mb-4">Multiple Choice</h1>
          <div className="space-y-2">
            {
              multipleChoiceQuestions.map((question, index) => (
                <div key={index} className="w-full max-h-80 bg-white border-black borde rounded px-4 pt-2 pb-4">
                  <div className="flex justify-end">
                    <button onClick={() => setMultipleChoiceQuestions((prev) => prev.filter(((prevQuestion, i) => i !== index)) )}>
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
                          onChange={e => {
                            let allQuestions = [...multipleChoiceQuestions];
                            allQuestions[index].question = e.target.value;
                            setMultipleChoiceQuestions(allQuestions)
                          }}  
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Choices: </p>
                      <div className="space-y-2">
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[0] || ""}
                          onChange={(e) => {
                            setMultipleChoiceQuestions(prev => {
                              return prev.map((prevQuestion, i) => {
                                if (i === index) {
                                  let choicess = prevQuestion.choices;
                                  choicess[0] = e.target.value;
                                  return {
                                    ...prevQuestion,
                                    choices: choicess
                                  } 
                                }
                                return prevQuestion;
                              })
                            })
                          }}
                        />
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[1] || ""}
                          onChange={(e) => {
                            setMultipleChoiceQuestions(prev => {
                              return prev.map((prevQuestion, i) => {
                                if (i === index) {
                                  let choicess = prevQuestion.choices;
                                  choicess[1] = e.target.value;
                                  return {
                                    ...prevQuestion,
                                    choices: choicess
                                  } 
                                }
                                return prevQuestion;
                              })
                            })
                          }}
                        />
                        <input 
                          type="text"
                          className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                          value={question.choices[2] || ""}
                          onChange={(e) => {
                            setMultipleChoiceQuestions(prev => {
                              return prev.map((prevQuestion, i) => {
                                if (i === index) {
                                  let choicess = prevQuestion.choices;
                                  choicess[2] = e.target.value;
                                  return {
                                    ...prevQuestion,
                                    choices: choicess
                                  } 
                                }
                                return prevQuestion;
                              })
                            })
                          }}
                        />
                        <div>
                          <p className="text-xl mb-2">Answer: </p>
                          <input 
                            type="text" 
                            className="w-full font-lg py-2 px-4 h-full resize-none border rounded"
                            value={question.answer}
                            onChange={(e) => setMultipleChoiceQuestions(prev => (
                              prev.map((q, i) => {
                                return index === i ? { ...q, answer: e.target.value} : q; 
                              })
                            ))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
            <div onClick={addMultipleChoiceQuestion} className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
              Add Multiple Choice Question
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-xl mb-4">Identifications</h1>
          <div className="space-y-2">


            {
              idenficationQuestions.map((question, index) => (
                <div key={index} className="w-full max-h-80 bg-white border-black borde rounded px-4 pt-2 pb-4">
                  <div className="flex justify-end">
                    <button onClick={() => setIdenficationQuestions((prev) => prev.filter(((prevQuestion, i) => i !== index)) )}>
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
                          onChange={e => {
                            let allQuestions = [...idenficationQuestions];
                            allQuestions[index].question = e.target.value;
                            setIdenficationQuestions(allQuestions)
                          }}  
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Answer: </p>
                      <input 
                        type="text" 
                        className="w-full font-lg py-2 px-4 resize-none border rounded"
                        value={question.answer}
                        onChange={(e) => setIdenficationQuestions(prev => (
                          prev.map((q, i) => {
                            return index === i ? { ...q, answer: e.target.value} : q; 
                          })
                        ))}
                      />
                    </div>
                  </div>
                </div>
              ))
            }


            <div onClick={addIdentificationQuestion} className="w-full h-20 bg-white/70 text-black/50 flex items-center rounded text-lg px-8 cursor-pointer">
              Add Identification Question
            </div>
          </div>    
          
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <ButtonLarge onClick={createQuiz}>Create Quiz</ButtonLarge>
      </div>
    </>
  )
}