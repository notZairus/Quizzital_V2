import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ClassroomContext } from '../contexts/ClassroomContext';


export default function ActivityArea() {
  const navigate = useNavigate();
  const [currentClassroom, setCurrentClassroom] = useState(JSON.parse(localStorage.getItem('currentClassroom')));
  const [activity, setActivity] = useState(JSON.parse(localStorage.getItem('activity')));
  const [quizStarted, setQuizStarted] = useState(false);
  const quizAreaRef = useRef(null);
  
  useEffect(() => {
    Swal.fire({
      icon: 'warning',
      title: 'Begin Quiz',
      text: 'Are you ready to start the quiz? Once started, you must complete it without interruptions.',
      confirmButtonText: 'Start Quiz',
      showDenyButton: true,
      denyButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      customClass: {
        popup: 'swal-wide',
      },
      'preConfirm': () => { 
        // to Develop........
        // Start Quiz
        setQuizStarted(true);
        quizAreaRef.current.requestFullscreen();

      },
      'preDeny': () => {
        const classroomId = JSON.parse(localStorage.getItem('currentClassroom')).id;
        localStorage.removeItem('currentClassroom');
        localStorage.removeItem('activity');
        navigate(`/classroom/${classroomId}`);
      }
    })
  }, [])


  return (
    <>
      <div className="h-screen w-full bg-white flex" ref={quizAreaRef}> 
        {quizStarted && <div className="w-full h-full">
          <div className="px-6 py-4 w-80 h-screen max-h-screen bg-black/10 overflow-auto pb-12">
            <h1 className="font-semibold text-2xl mb-5">Questions</h1>
            <div className="space-y-4">
              {
                activity.quiz.questions.map(((question, index) => (
                  <div className="w-full bg-white shadow rounded p-4 max-h-20 hover:shadow-lg transition-all duration-300">
                    <p className="text-gray-400 text-sm">{question.type == 'multiple_choice' ? 'Multiple Choice' : 'Identification'}</p>
                    <p className="text-lg">{`${index + 1}. ${question.question}`}</p>
                  </div>
                )))
              }
            </div>

            <div className="flex-1 shadow-md flex justify-center items-center">
              <div className="w-2/3 h-full max-h-[500px] bg-white rounded shadow-lg">

              </div>
            </div>
          </div>
        </div>}
      </div>
    </>
  );

}