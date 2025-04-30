import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { backendUrl, formatSeconds, processWord, randomizeOrder } from "../js/functions"; 
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../contexts/AuthContext';
import { ClassroomContext } from '../contexts/ClassroomContext';
import Toast from "./Toast";

import check from '../assets/icons/check-svgrepo-com.svg'


export default function ActivityArea() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext)
  const { refreshClassroom } = useContext(ClassroomContext);
  const activityAreaRef = useRef(null);


  /////////////////////////////////// STATES ///////////////////////////////////////////////////////////

  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [activity, setActivity] = useState(null);
  const [timer, setTimer] = useState(0);
  const [activityStarted, setActivityStarted] = useState(false);
  const [activityOver, setActivityOver] = useState(false);
  const [reviewActivity, setReviewActivity] = useState(false);
  const [tabChangeCount, setTabChangeCount] = useState(1);

  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const firstRenderRef = useRef(true);

  /////////////////////////////////// FUNCTIONS ///////////////////////////////////////////////////////////

  const backToClassroom = useCallback(() => {
    navigate(`/classroom/${currentClassroom.id}`)
  }, [currentClassroom]);

  const answerMultipleChoice = useCallback((choice) => {
    if (firstRenderRef.current) return;
    if (reviewActivity) return;

    setQuestions(prev => prev.map((q) => {
      let correct = q.answer === choice;
      if (q.id == currentQuestion.id) {
        if (q._answer == choice) {
          setCurrentQuestion({...currentQuestion, _answer:"", correct: correct})
          return {...q, _answer: "", correct: correct}
        } 
        setCurrentQuestion({...currentQuestion, _answer:choice, correct: correct})
        return {...q, _answer:choice, correct: correct}
      }
      return q;
    }))
  }, [currentQuestion, reviewActivity]);

  const answerIdentification = useCallback((answer) => {
    if (firstRenderRef.current) return;
    if (reviewActivity) return;

    setQuestions(prev => prev.map((q) => {
        if (q.id == currentQuestion.id) {
          return {...q, _answer:answer, correct: processWord(answer) === processWord(q.answer)}
        }
        return q;
      })
    )
    setCurrentQuestion({...currentQuestion, _answer:answer})
  }, [currentQuestion, reviewActivity]);

  const goPreviousQuestion = useCallback(() => {
    if (firstRenderRef.current) return;
    for (let i = 0; i < questions.length; i++) {
      if (currentQuestion.id === questions[i].id) {
        if (questions[i-1]) {
          setCurrentQuestion(questions[i-1]);
        }
      }
    }
  }, [currentQuestion])

  const goNextQuestion = useCallback(() => {
    if (firstRenderRef.current) return;
    for (let i = 0; i < questions.length; i++) {
      if (currentQuestion.id === questions[i].id) {
        if (questions[i+1]) {
          setCurrentQuestion(questions[i+1]);
        }
      }
    }
  }, [currentQuestion])

  const reviewActivityFn = () => {
    setReviewActivity(true);
  }

  const backToClass = useCallback(() => {
    refreshClassroom();
    backToClassroom();
  }, [activityOver]);



  /////////////////////////////////// EFFECTS ///////////////////////////////////////////////////////////


  // fetch activity and currentClassroom details from localstorage
  useEffect(() => {
    setCurrentClassroom(JSON.parse(localStorage.getItem('currentClassroom')));
    setActivity(JSON.parse(localStorage.getItem('activity')));
  }, [])
  
  // prompt the user to start the activity
  useEffect(() => {
    if (!activity) return;
    if (!currentClassroom) return;

    ChartJS.register(ArcElement, Tooltip, Legend);
    Swal.fire({
      title: 'Start Quiz? ',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: 'Start',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      allowOutsideClick: false,
      backdrop: 'white',
      preConfirm: () => {
        setActivityStarted(true)

        let randomizedQuestions = randomizeOrder(activity.quiz.questions).map((q) => ({
          ...q,
          _answer: "",
          correct: false
        }));

        setTimer(activity.timer === 0 ? 100000 : activity.timer);
        setQuestions(randomizedQuestions);
        setCurrentQuestion(randomizedQuestions[0]);
      },
      preDeny: () => {
        backToClassroom();
      }
    })

    firstRenderRef.current = false;
  }, [activity, currentClassroom])


  useEffect(() => {
    let activityAreaElement = activityAreaRef.current;
    if (!activityAreaElement) return;

    const handleMouseLeave = async (e) => {
      document.body.style.filter = "blur(20px)";
      setTimeout(() => {
        alert('Leaving the quiz area for some reasons?');
        document.body.style.filter = "none";
      }, [100])
    }
    activityAreaElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      activityAreaElement.removeEventListener('mouseleave', handleMouseLeave);
    }
  }, [activityAreaRef.current])



  // if activity started, timer runs
  // if timer hits 0, activityOver will be true
  useEffect(() => {
    if (!activityStarted) return;

    if (timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000)
    }

    if (timer === 0) {
      setActivityOver(true);
    }
  }, [activityStarted, timer])

  // manages the tab change count logic
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        setTabChangeCount(tabChangeCount + 1);
        Swal.fire({
          title: `You changed tab ${tabChangeCount} ${tabChangeCount > 1 ? "times." : "time"}`,
          backdrop: 'white',
          
        })

        if (tabChangeCount >= 5) {
          const insertInDB = async () => {
            let data = {
              'user_id': currentUser.id,
              'activity_id': activity.id,
              'remarks': Math.round(questions.length * 0.7 / questions.length * activity.perfect_score) <= Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score) 
                        ? "Passed!"
                        : "Failed!",
              'user_score': Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score),
              'perfect_score': activity.perfect_score
            }
      
            await fetch(backendUrl('/activity-record'), {
              method: 'POST',
              headers: {
                'Content-type': 'application/json'
              },
              body: JSON.stringify(data)
            })
      
            questions.forEach(async (q) => {
              await fetch(backendUrl('/answer'), {
                method: 'POST',
                headers: {
                  'Content-type': 'application/json'
                },
                body: JSON.stringify({
                  'user_id': currentUser.id,
                  'activity_id': activity.id,
                  'question_id': q.id,
                  'correct': q.correct,
                  'student_answer': q._answer
                })
              })
            }) 
      
            Toast('success', 'Activity Recorded Successfully!')
            refreshClassroom();
            navigate(`/classroom/${currentClassroom.id}`)
          }
      
          insertInDB();
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    } 
  }, [tabChangeCount])

  // once activityIsOver, the activity will be recorded in the db
  useEffect(() => {
    if (!activityOver) return;

    const insertInDB = async () => {
      let data = {
        'user_id': currentUser.id,
        'activity_id': activity.id,
        'remarks': Math.round(questions.length * 0.7 / questions.length * activity.perfect_score) <= Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score) 
                  ? "Passed!"
                  : "Failed!",
        'user_score': Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score),
        'perfect_score': activity.perfect_score
      }

      await fetch(backendUrl('/activity-record'), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      questions.forEach(async (q) => {
        await fetch(backendUrl('/answer'), {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            'user_id': currentUser.id,
            'activity_id': activity.id,
            'question_id': q.id,
            'correct': q.correct,
            'student_answer': q._answer
          })
        })
      }) 

      Toast('success', 'Activity Recorded Successfully!')
    }

    insertInDB();
  }, [activityOver])

  // pretty self explanatory shit
  useEffect(() => {
    if(!reviewActivity) return;
    setCurrentQuestion(questions[0]);
    activityAreaRef.current.scrollIntoView({ behavior: 'smooth'});
  }, [reviewActivity])


  /////////////////////////////////// JSX ///////////////////////////////////////////////////////////


  function Choice({ choice, student_answer, correct_answer, index }) {
    return (
      <div 
        className={`
          p-1 rounded border-2 flex items-start transition-all duration-200
          ${!reviewActivity && choice === student_answer && "border-BackgroundColor_Darker"}
          ${reviewActivity && choice === student_answer && choice !== correct_answer && "border-red-500"}
          ${reviewActivity && choice === correct_answer && "border-BackgroundColor_Darker"}
        `}
        onClick={() => answerMultipleChoice(choice)}
      >
        <div 
          className={`
            transition-all duration-200 w-16 aspect-square flex items-center justify-center text-xl
            ${!reviewActivity && choice === student_answer && "bg-BackgroundColor_Darker text-white"}
            ${reviewActivity && choice === student_answer && choice !== correct_answer && "bg-red-500 text-white "}
            ${reviewActivity && choice === correct_answer && "bg-BackgroundColor_Darker text-white "}
          `}
        >
          {index == 0 ? "A" : index == 1 ? "B" : index == 2 ? "C" : "D"} 
        </div>
        <div className="flex-1">
          <p className="text-xl ml-4 my-2">{choice}</p>
        </div>
        <div className={`
          p-1 mt-2 transition-all duration-200 w-10 aspect-square mr-4 rounded-full
          ${reviewActivity && choice === correct_answer && "bg-BackgroundColor_Darker"}
        `}>
          <img src={check} alt="" />
        </div>
      </div>
    )
  }

  console.log(activity);
  
  return ( 
    <>
      {activityOver && 
        <div className="w-full h-screen bg-backgroundColor flex flex-col items-center justify-center">
          <div className=" bg-white rounded shadow-md py-8 px-10 flex gap-12 w-1/3">
            <div>
              <p className="text-2xl">{`Passing Grade: ${Math.round(0.7 * activity.perfect_score)}`}</p>
              <p className="text-2xl">{`Your Grade: ${Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score)}`}</p>

              <p className="text-6xl font-thin mt-12">
                {
                  Math.round(0.7 * activity.perfect_score) <= Math.round(questions.filter(q => q.correct).length / questions.length * activity.perfect_score) 
                  ? "Passed!"
                  : "Failed!"
                }
              </p>
            </div>
            <div className="aspect-square p-4 w-[250px]">
              <Doughnut className="w-" data={{
                labels: [
                  'Number of Items',
                  'Correct Items'
                ],
                datasets: [{
                  data: [questions.length - questions.filter((q) => q.correct).length, questions.filter((q) => q.correct).length],
                  backgroundColor: [
                    '#F0F5F9',
                    '#12B9D8',
                  ],
                  hoverOffset: 4
                }]
              }}/>
            </div>
          </div>

          <div className="h-20 mt-8 w-1/3 flex items-center justify-between">
            <button onClick={backToClass} className="text-2xl w-full border px-5 py-4 border-BackgroundColor_Darker bg-white text-BackgroundColor_Darker rounded hover:bg-BackgroundColor_Darker hover:text-white transition-all duration-300">
              Back to Classroom
            </button>
            {/* <button onClick={reviewActivityFn} className="text-2xl border px-5 py-4 border-BackgroundColor_Darker bg-white text-BackgroundColor_Darker rounded hover:bg-BackgroundColor_Darker hover:text-white transition-all duration-300">
              Review Quiz
            </button> */}
          </div>
          
        </div>
      }

      {((activityStarted && !activityOver) || reviewActivity) && 
        <div ref={activityAreaRef} className="w-full min-h-screen flex px-60 py-20 bg-BackgroundColor gap-12"> 
          <div className="flex-1 text-black/80 bg-white rounded p-8 shadow h-fit">
            {currentQuestion.type === "multiple_choice"
            ? 
              <>
                <h1 className="text-4xl font-semibold">{currentQuestion.question}</h1>
                
                <div className="space-y-4 mt-12">
                  {
                    [...currentQuestion.choices, currentQuestion.answer].sort().map((choice, index) => (
                      // <div 
                      //   className={`${currentQuestion._answer === choice ? "border-BackgroundColor_Darker" : "border-BackgroundColor_Darker/50"} ${currentQuestion.answer === choice && reviewActivity && "bg-BackgroundColor"} p-1 rounded border-2 flex items-start transition-all duration-200`}
                      //   onClick={() => answerMultipleChoice(choice)}
                      // >
                      //   <div className={`${currentQuestion._answer === choice ? "bg-BackgroundColor_Darker text-white" : "bg-BackgroundColor_Darker/10"} transition-all duration-200 w-16 aspect-square flex items-center justify-center text-xl`}>{index == 0 ? "A" : index == 1 ? "B" : index == 2 ? "C" : "D"} </div>
                      //   <div className="flex-1">
                      //     <p className="text-xl ml-4 my-2">{choice}</p>
                      //   </div>
                      //   <div className={`${currentQuestion.answer === choice && reviewActivity ? "bg-BackgroundColor_Darker" : "bg-transparent"} p-1 mt-2 transition-all duration-200 w-10 aspect-square mr-4 rounded-full`}>
                      //     <img src={check} alt="" />
                      //   </div>
                      // </div>
                      <Choice 
                        choice={choice} 
                        student_answer={currentQuestion._answer} 
                        correct_answer={currentQuestion.answer} 
                        index={index} 
                      />
                    ))
                  }
                </div>
              </>
            :
              <>
                <h1 className="text-4xl font-semibold">{currentQuestion.question}</h1>

                <div className="mt-12">
                  <p className="text-black/40">Answer: </p>
                  <input 
                    type="text" 
                    value={currentQuestion._answer}
                    className={`
                      mt-2 w-full rounded p-4 px-5 text-2xl border-2 border-BackgroundColor_Darker outline-0 transition-all duration-300
                      ${reviewActivity && processWord(currentQuestion.answer) !== processWord(currentQuestion._answer) && "border-red-500"}
                    `}
                    onChange={(e) => answerIdentification(e.target.value)}
                  />
                </div>

                {reviewActivity && processWord(currentQuestion.answer) !== processWord(currentQuestion._answer) && (
                    <div className="mt-8 w-full">
                      <p className="text-black/40">Correct Answer: </p>
                      <div className="w-full rounded border-BackgroundColor_Darker p-4 border-2 mt-2">
                        {currentQuestion.answer}
                      </div>
                    </div>
                  )
                }
              </>
            }

            <div className="mt-12 flex justify-between items-center">
              <div className="space-x-2">
                <button onClick={goPreviousQuestion} className="bg-BackgroundColor text-black/50 text-lg px-4 py-2 rounded-full hover:bg-black/10 hover:text-black transition-all duration-300">
                  Previous
                </button>
                <button onClick={goNextQuestion} className="bg-BackgroundColor text-black/50 text-lg px-4 py-2 rounded-full hover:bg-black/10 hover:text-black transition-all duration-300">
                  Next
                </button>
              </div>

              {!reviewActivity && <button onClick={() => setActivityOver(true)} className="bg-BackgroundColor_Darker text-white/70 hover:text-white text-xl px-6 py-3 rounded-full  transition-all duration-300">
                Submit Quiz
              </button>}
            </div>
          </div>
          
          <div className="w-72 rounded-lg ">
            {
            !reviewActivity && activity.timer !== 0 &&
              (<div className="mb-8 w-full py-8 bg-white rounded shadow text-4xl items-center justify-center flex">
                  {formatSeconds(timer)}
              </div>)
            }
            <div className="max-h-[500px] overflow-auto rounded bg-white px-2 py-4 shadow">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isCurrent = question.question === currentQuestion.question;
                  const isAnswered = !!question._answer;

                  return (
                    <div
                      key={question.id}
                      onClick={() => setCurrentQuestion(question)}
                      className={`
                        w-full border rounded aspect-square flex items-center justify-center
                        ${!reviewActivity && isCurrent && "bg-BackgroundColor_Darker/40"}
                        ${!reviewActivity && !isCurrent && question._answer && "bg-BackgroundColor_Darker/20"}
                        ${reviewActivity && question._answer === question.answer && "bg-BackgroundColor_Darker text-white"}
                        ${reviewActivity && question._answer !== question.answer && "bg-red-500 text-white"}
                      `}
                    >
                      <p>{index + 1}</p>
                      {/* <div
                        className={`
                          w-4 aspect-square rounded-full
                          ${!reviewActivity && isAnswered ? "bg-BackgroundColor_Darker" : ""}
                        `}
                      ></div> */}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      }
    </>
  );
}