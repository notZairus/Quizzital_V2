import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { formatSeconds } from "../js/functions"; 


export default function ActivityArea() {
  const navigate = useNavigate();
  const [currentClassroom, setCurrentClassroom] = useState(JSON.parse(localStorage.getItem('currentClassroom')));
  const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')));
  
  const activityAreaRef = useRef(null);
  const [timer, setTimer] = useState(activity.timer);
  const [activityStarted, setActivityStarted] = useState(false);
  const [activityOver, setActivityOver] = useState(false);
  const [timerRanOut, setTimerRanOut] = useState(false);
  const [tabChangeCount, setTabChangeCount] = useState(1); // hardcoded, babaguhin

  const [questions, setQuestions] = useState(activity.quiz.questions.map((q) => ({
    ...q,
    _answer: ""
  })));
  const [currentQuestion, setCurrentQuestion] = useState(questions[0]);

  function backToClassroom() {
    navigate(`/classroom/${currentClassroom.id}`)
  }

  // prompt the user to start the activity
  useEffect(() => {
    Swal.fire({
      title: 'Start Activity? ',
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: 'Start',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      allowOutsideClick: false,
      backdrop: 'white',
      preConfirm: () => {
        setActivityStarted(true)
      },
      preDeny: () => {
        backToClassroom();
      }
    })
  }, [])

  // if activity started, timer runs
  // if timer hits 0, timerRanOut state will be true
  useEffect(() => {
    if (activityStarted && timer > 0) {
      setTimeout(() => {
        setTimer(timer - 1);
      }, 1000)
    }

    if (timer === 0) {
      setTimerRanOut(true);
    }
  }, [activityStarted, timer]);


  // once the timerRanOut state is true, it will go back to classroom
  // will implement: after quiz
  useEffect(() => {
    if (timerRanOut) {
      Swal.fire({
        title: 'Timer ran out',
        icon: 'info',
        allowOutsideClick: false,
        preConfirm: () => {
          backToClassroom()
        },
        target: activityAreaRef.current
      })
    }

  }, [timerRanOut])

  // manages the tab change count logic
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        setTabChangeCount(tabChangeCount + 1);
        console.log(tabChangeCount);
        Swal.fire({
          title: `You changed tab ${tabChangeCount} ${tabChangeCount > 1 ? "times." : "time"}`,
          backdrop: 'white',
          p
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    } 
  }, [tabChangeCount])


  function answerMultipleChoice(choice) {
    setQuestions(prev => prev.map((q) => {
        if (q.id == currentQuestion.id) {
          if (q._answer == choice) {
            setCurrentQuestion({...currentQuestion, _answer:""})
            return {...q, _answer: ""}
          } 
          setCurrentQuestion({...currentQuestion, _answer:choice})
          return {...q, _answer:choice}
        }
        return q;
      })
    )
  }

  function answerIdentification(answer) {
    setQuestions(prev => prev.map((q) => {
        if (q.id == currentQuestion.id) {
          return {...q, _answer:answer}
        }
        return q;
      })
    )
    setCurrentQuestion({...currentQuestion, _answer:answer})
  }

  function goPreviousQuestion() {
    for (let i = 0; i < questions.length; i++) {
      if (currentQuestion.id === questions[i].id) {
        if (questions[i-1]) {
          setCurrentQuestion(questions[i-1]);
        }
      }
    }
  }

  function goNextQuestion() {
    for (let i = 0; i < questions.length; i++) {
      if (currentQuestion.id === questions[i].id) {
        if (questions[i+1]) {
          setCurrentQuestion(questions[i+1]);
        }
      }
    }
  }

  console.log(questions);
  console.log(currentQuestion);

  return ( 
    <>
      <div className="w-full bg-white flex" ref={activityAreaRef}> 
        {activityStarted && <div className="w-full h-full flex">
          <div className="px-6 py-4 w-80 bg-black/10 overflow-auto pb-12 min-h-screen">
            <h1 className="font-semibold text-2xl mb-5">{formatSeconds(timer)}</h1>
            <div className="space-y-4">
              {
                questions.map(((question, index) => (
                  <div
                    className={`${question.id == currentQuestion.id ? "bg-BackgroundColor_Darker text-white" : "bg-white"} cursor-pointer w-full shadow rounded p-4 hover:shadow-lg transition-all duration-300`}
                    key={question.id}
                    onClick={() => {
                      console.log(question);
                      setCurrentQuestion(questions.find((q) => q.id == question.id))
                    }}
                  >
                    <p className="text-sm text-gray-300">{question.type == 'multiple_choice' ? 'Multiple Choice' : 'Identification'}</p>
                    <p className="text-lg">{`${question.question}`}</p>
                  </div>
                )))
              }
            </div>
          </div>
          <div className="flex-1 flex justify-center pt-12 pb-8 bg-black/15">
            <div className="flex-1 flex justify-center px-12 gap-4">
              <div className="w-full h-full flex flex-col justify-center">
                <p className="text-xl text-black/40">{currentQuestion.type == "multiple_choice" ? 'Multiple Choice' : "Identification"}</p>
                <div className="bg-white rounded shadow w-full h-fit p-8 overflow-hidden mt-4">
                  <p className="text-3xl break-words">{currentQuestion.question}</p>
                </div>
                {currentQuestion.type === 'multiple_choice' 
                  ?
                    <div className="mt-4">
                      <p className="text-black/40">Choices: </p>
                      <div className="space-y-2">
                        {[...currentQuestion.choices, currentQuestion.answer].sort().map((choice, index) => (
                          <div 
                            key={index} 
                            className={`${ currentQuestion._answer === choice ? "bg-BackgroundColor_Darker text-white" : "cursor-pointer bg-white"} w-full rounded py-4 px-8 text-2xl flex items-center shadow hover:shadow-BackgroundColor_Darker hover:shadow-md transition-all duration-300`}
                            onClick={() => answerMultipleChoice(choice)}
                          >
                            <p className="max-w-full break-words">{choice}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  :
                    <div className="mt-4">
                      <p className="text-black/40">Answer: </p>
                      <input 
                        type="text" 
                        value={currentQuestion._answer}
                        className="w-full rounded py-4 px-8 text-2xl flex items-center shadow hover:shadow-BackgroundColor_Darker hover:shadow-md transition-all duration-300"
                        onChange={(e) => answerIdentification(e.target.value)}
                      />
                    </div>
                }
              </div>
              
              <div className="w-40 flex flex-col items-center justify-center gap-4">
                <button onClick={goPreviousQuestion} className="aspect-square bg-white shadow w-20 rounded-full hover:shadow-md hover:bg-BackgroundColor_Darker hover:text-white transition-all duration-300">Previous</button>
                <button onClick={goNextQuestion} className="aspect-square bg-white shadow w-20 rounded-full hover:shadow-md hover:bg-BackgroundColor_Darker hover:text-white transition-all duration-300">Next</button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </>
  );

}

