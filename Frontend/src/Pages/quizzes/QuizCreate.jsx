import Heading1 from "../../Components/Heading1";
import Swal from 'sweetalert2';
import { useContext, useRef, useState } from "react";
import { backendUrl, mainColor } from '../../js/functions';
import ButtonLarge from '../../Components/ButtonLarge';
import { AuthContext } from '../../contexts/AuthContext';
import { QuizContext } from '../../contexts/QuizContext';
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function QuizCreate() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { quizzes, insertQuiz } = useContext(QuizContext);
  const [ multipleChoiceQuestions, setMultipleChoiceQuestions ] = useState([]);
  const [ idenficationQuestions, setIdenficationQuestions ] = useState([]);
  const quiz_name_ref = useRef(null);

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
      await fetch(backendUrl('/question'), {
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
        console.log(newQuizzes);
        insertQuiz(newQuizzes);

        navigate('/questionnaire');
      }
    })
  }

  function showAi() {
    Swal.fire({
      title: 'Ai',
      html: `
            <div class="flex flex-col gap-4 text-left">
              <label class="flex flex-col gap-2">
                <span class="text-lg font-semibold">Paste Lesson:</span>
                <textarea 
                  id="text_area" 
                  class="w-full h-80 border border-gray-300 rounded-md resize-none p-4 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  placeholder="Paste your lesson here..."
                ></textarea>
              </label>

              <label class="flex flex-col gap-2">
                <span class="text-lg font-semibold">Number of Questions:</span>
                <input 
                  id="q_count" 
                  type="number" 
                  max="50" 
                  min="5" 
                  step="5" 
                  class="w-24 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  placeholder="e.g. 10"
                  required
                />
              </label>
            </div>
          `,
      confirmButtonText: 'Extract Questions',
      confirmButtonColor: mainColor,
      showCancelButton: true,
      allowOutsideClick: false,
      preConfirm: async () => {
        let lesson = document.getElementById('text_area').value;
        let question_count = document.getElementById('q_count').value;

        if (lesson.length < 20) {
          Swal.fire({
            icon: "error",
            title: "Invalid Lesson",
            text: "Please provide a lesson with atleast 1 paragpraph."
          });
          return;
        }
        
        if (!question_count) {
          Swal.fire({
            icon: "error",
            title: "Missing Question Count",
            text: "Please enter a valid number of questions."
          });
          return;
        }

        try {
          let result = await generateQuestionnaire(lesson, question_count);
          let questionString = result.slice(result.indexOf('['), result.lastIndexOf(']') + 1)
          let questions = JSON.parse(questionString);

          setMultipleChoiceQuestions([...questions.filter(q => q.type === "multiple_choice")])
          setIdenficationQuestions([...questions.filter(q => q.type === "identification")])
          
        } catch(error) {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Input.'
          })
        }
      }
    })

    async function generateQuestionnaire(lesson, question_count) {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash" ,
        systemInstruction: `
            You are an instructor, extract ${question_count} an equal number of multiple choice and identification questions with answer out of the text that will be provided by the user. 
            The answers of the identification questions should be no more than 2 words to ensure the checking accuracy.
            if the question type is multiplications, your response should be in a JSON with a structure of 
              [{question: "the question", choices: ["choice a", "choice b", "choice c"], answer: "the answer", type: "multiple_choice"}] //IMPORTANT NOTE: the answer should not be included in the choices should pnly be an array of wrong answers
            if the question type is identification, your response should be in a JSON with a structure of 
              [{question: "the question", answer: "the answer", type: "identification"}]
          .`
      });

      const response = await model.generateContent(lesson);
      return response.response.text();
    }
  }

  function addMultipleChoiceQuestion() {
    setMultipleChoiceQuestions([...multipleChoiceQuestions, {question: "", choices: [], answer: "", type: "multiple_choice"}]);
  }

  function addIdentificationQuestion() {
    setIdenficationQuestions([...idenficationQuestions, {question: "", answer: "", type: "identification"}]);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <Heading1>Create Questionnaire</Heading1>
        <ButtonLarge onClick={showAi}>Generate with AI</ButtonLarge>
      </div>

      <div className="mb-12">
        <label className="block text-xl font-medium mb-2">Questionnaire Name</label>
        <input 
          ref={quiz_name_ref} 
          type="text" 
          placeholder="Enter quiz title..." 
          className="w-full max-w-xl text-2xl px-4 py-3 rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" 
        />
      </div>

      <div className="space-y-12">

        {/* Multiple Choice Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Multiple Choice</h2>

          <div className="space-y-6">
            {multipleChoiceQuestions.map((question, index) => (
              <div key={index} className="rounded-lg border border-gray-300 p-6 bg-white shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Question {index + 1}</span>
                  <button
                    onClick={() => setMultipleChoiceQuestions(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="text-base font-medium">Question</label>
                  <textarea
                    className="w-full mt-1 border rounded px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={question.question}
                    onChange={e => {
                      const updated = [...multipleChoiceQuestions];
                      updated[index].question = e.target.value;
                      setMultipleChoiceQuestions(updated);
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2].map(choiceIndex => (
                    <input
                      key={choiceIndex}
                      type="text"
                      className="border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder={`Choice ${choiceIndex + 1}`}
                      value={question.choices[choiceIndex] || ""}
                      onChange={e => {
                        setMultipleChoiceQuestions(prev =>
                          prev.map((q, i) =>
                            i === index
                              ? {
                                  ...q,
                                  choices: Object.assign([], q.choices, {
                                    [choiceIndex]: e.target.value,
                                  }),
                                }
                              : q
                          )
                        );
                      }}
                    />
                  ))}
                </div>

                <div>
                  <label className="text-base font-medium">Correct Answer</label>
                  <input
                    type="text"
                    className="w-full mt-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={question.answer}
                    onChange={e =>
                      setMultipleChoiceQuestions(prev =>
                        prev.map((q, i) => (i === index ? { ...q, answer: e.target.value } : q))
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addMultipleChoiceQuestion}
              className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-4 rounded-lg border border-blue-200 transition"
            >
              + Add Multiple Choice Question
            </button>
          </div>
        </section>

        {/* Identification Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Identification</h2>

          <div className="space-y-6">
            {idenficationQuestions.map((question, index) => (
              <div key={index} className="rounded-lg border border-gray-300 p-6 bg-white shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Question {index + 11}</span>
                  <button
                    onClick={() => setIdenficationQuestions(prev => prev.filter((_, i) => i !== index))}
                    className="text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="text-base font-medium">Question</label>
                  <textarea
                    className="w-full mt-1 border rounded px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={question.question}
                    onChange={e => {
                      const updated = [...idenficationQuestions];
                      updated[index].question = e.target.value;
                      setIdenficationQuestions(updated);
                    }}
                  />
                </div>

                <div>
                  <label className="text-base font-medium">Answer</label>
                  <input
                    type="text"
                    className="w-full mt-1 border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={question.answer}
                    onChange={e =>
                      setIdenficationQuestions(prev =>
                        prev.map((q, i) => (i === index ? { ...q, answer: e.target.value } : q))
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addIdentificationQuestion}
              className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium py-4 rounded-lg border border-blue-200 transition"
            >
              + Add Identification Question
            </button>
          </div>
        </section>
      </div>

      <div className="mt-12 flex justify-end">
        <ButtonLarge onClick={createQuiz}>Create Questionnaire</ButtonLarge>
      </div>
    </>

  )
}