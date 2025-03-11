import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { secondsToMinutes } from "../js/functions"; 


export default function ActivityArea() {
  const navigate = useNavigate();
  const [currentClassroom, setCurrentClassroom] = useState(JSON.parse(localStorage.getItem('currentClassroom')));
  const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')));

  const activityAreaRef = useRef(null);
  const [timer, setTimer] = useState(3); // hardcoded, babaguhin
  const [currentQuestion, setCurrentQuestion] = useState(activity.quiz.questions[0]);

  const [activityStarted, setActivityStarted] = useState(false);
  const [activityOver, setActivityOver] = useState(false);
  const [timerRanOut, setTimerRanOut] = useState(false);

  console.log(currentQuestion);
  console.log(activity);



  // WILL IMPLEMENT AFTER QUIZ BEFORE TH END OF THIS WEEK
  // WILL IMPLEMENT AFTER QUIZ BEFORE TH END OF THIS WEEK
  // WILL IMPLEMENT AFTER QUIZ BEFORE TH END OF THIS WEEK



  function backToClassroom() {
    navigate(`/classroom/${currentClassroom.id}`)
  } 

  function enterFullscreen() {
    if (activityAreaRef.current) {
      if (activityAreaRef.current.requestFullscreen) {
        activityAreaRef.current.requestFullscreen();
      } else if (activityAreaRef.current.webkitRequestFullscreen) {
        activityAreaRef.current.webkitRequestFullscreen();
      } else if (activityAreaRef.current.mozRequestFullScreen) {
        activityAreaRef.current.mozRequestFullScreen();
      } else if (activityAreaRef.current.msRequestFullscreen) {
        activityAreaRef.current.msRequestFullscreen();
      }
    }
  }

  const handleFullscreenChange = useCallback(() => {
    if (timerRanOut) return;

    Swal.fire({
      'icon': 'question',
      'title': 'Leave Activity?',
      'text': 'Leaving activity will automatically give you a score of 0.',
      'showDenyButton': true,
      'denyButtonText': 'Cancel',
      'showConfirmButton': true,
      'confirmButtonText': 'Leave',
      allowOutsideClick: false,
      'preConfirm': () => {
        backToClassroom()
      },
      'preDeny': () => {
        enterFullscreen();
      }
    })
  }, [timerRanOut]);


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
      preConfirm: () => {
        setActivityStarted(true)
      },
      preDeny: () => {
        backToClassroom();
      }
    })
  }, [])

  // if activity started, will go full screen and attach an event listener on document
  useEffect(() => {
    if (activityStarted) {
      enterFullscreen()
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [activityStarted]);

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

  function showQuestion(id) {
    setCurrentQuestion(activity.quiz.questions.find((q) => q.id == id));
  }
 

  return ( 
    <>
      <div className="h-screen w-full bg-white flex" ref={activityAreaRef}> 
        {activityStarted && <div className="w-full h-full flex">
          <div className="px-6 py-4 w-80 h-screen max-h-screen bg-black/10 overflow-auto pb-12">
            <h1 className="font-semibold text-2xl mb-5">{timer}</h1>
            <div className="space-y-4">
              {
                activity.quiz.questions.map(((question, index) => (
                  <div
                    className="w-full bg-white shadow rounded p-4 max-h-20 hover:shadow-lg transition-all duration-300"
                    onClick={() => showQuestion(question.id)}
                  >
                    <p className="text-gray-400 text-sm">{question.type == 'multiple_choice' ? 'Multiple Choice' : 'Identification'}</p>
                    <p className="text-lg">{`${index + 1}. ${question.question}`}</p>
                  </div>
                )))
              }
            </div>
          </div>
          <div className="flex-1 flex justify-center items-center bg-black/15">
              {currentQuestion.question}
          </div>
        </div>}
      </div>
    </>
  );

}