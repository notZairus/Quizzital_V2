import Heading1 from "./Heading1"
import { QuizContext } from '../contexts/QuizContext';
import { AuthContext } from '../contexts/AuthContext';
import { ClassroomContext } from '../contexts/ClassroomContext';
import { useContext, useState } from "react";
import { backendUrl, getClassroom } from '../js/functions'; 
import { useNavigate } from "react-router-dom";
import Toast from './Toast';
import Swal from 'sweetalert2';


export default function LearningMaterialPanel({ show, setShow, classroom_id }) {
  const navigate = useNavigate()
  const { currentUser } = useContext(AuthContext);
  const { insertClassroom } = useContext(ClassroomContext);

  const [learningMaterialPanel, setLearningMaterialPanel] = useState({
    'name': "",
    "perfect_score": 100,
    "classroom_id": classroom_id,
    "quiz_id": quizzes.length === 0 ? null : quizzes[0].id,
    "open_at": null,
    "close_at": null,
    "timer": null
  })

  
  // async function createActivity() {
  //   if (newActivity.name === "" || newActivity.name.length <= "2") {
  //     Swal.fire({
  //       'icon': 'error',
  //       'title': 'Invalid Activity Name',
  //       'text': 'Activity name must be longer than 2 characters.'
  //     })
  //     return;
  //   }

  //   if (!newActivity.open_at) {
  //     Swal.fire({
  //       'icon': 'error',
  //       'title': 'Invalid Open Time',
  //       'text': 'Open time should never be null'
  //     })
  //     return;
  //   }

  //   if (newActivity.close_at) {
  //     let open = new Date(newActivity.open_at).getTime();
  //     let close = new Date(newActivity.close_at).getTime();

  //     if (open >= close) {
  //       Swal.fire({
  //         'icon': 'error',
  //         'title': 'Invalid Close Time',
  //         'text': 'Opening time should never be later than closing time'
  //       })
  //       return;
  //     }
  //   }

  //   let res = await fetch(backendUrl('/activity'), {
  //     method: 'POST',
  //     headers: {
  //       'Content-type': 'application/json',
  //     },
  //     body: JSON.stringify({...newActivity, timer: newActivity.timer * 60})
  //   })



  //   Toast("success", "Activity created!", 1000);
  //   await getClassroom(currentUser, insertClassroom)
  //   setShow(false)

  
  //   setTimeout(async () => {
  //     navigate(0);
  //   }, 1000)
  // }


  return (
    <>
      <div 
        onClick={() => setShow(false)} 
        className={`flex justify-end h-full top-0 fixed right-0 ${show ? "w-full opacity-100" : "w-0 opacity-0"} transition-all duration-1000 overflow-hidden`}
      >
        <div onClick={(e) => e.stopPropagation()} className="w-2/5 h-full overflow-auto bg-white px-8 pt-24 shadow-xl">
          <Heading1>Upload Learning Material</Heading1>
          <div>

            <div className="space-y-4">

              <div className="mb-8">
                <p className="text-xl mb-2">Activity Name: </p>
                <input value={newActivity.name} onChange={(e) => setNewActivity(prev => ({...prev, name: e.target.value}))} type="text" className="w-full text-2xl px-4 py-3 rounded border"/>
              </div>

              <div>
                <p className="text-xl mb-2">Activity Grade: </p>
                <select value={newActivity.score} onChange={(e) => setNewActivity(prev => ({...prev, score: e.target.value}))} className="w-full text-lg px-4 py-3 rounded border" required>
                  <option value={100} required>100</option>
                  <option value={50} required>50</option>
                  <option value={20} required>20</option>
                  <option value={10} required>10</option>
                  <option value={5} required>5</option>
                </select>
              </div>

              <div>
                <p className="text-xl mb-2">Questionaire: </p>
                <select value={newActivity.quiz_id} onChange={(e) => setNewActivity(prev => ({...prev, quiz_id: e.target.value}))} className="w-full text-lg px-4 py-3 rounded border" required>
                  {
                    quizzes.map(quiz => <option key={quiz.id} value={quiz.id} required>{quiz.name}</option>)
                  }
                </select>
              </div>

              <div className="flex gap-5 w-full">
                <div className="flex-1">
                  <p className="text-xl mb-2">Open: </p>
                  <input value={newActivity.open_at} onChange={(e) => setNewActivity(prev => ({...prev, open_at: e.target.value}))} type="datetime-local" className="w-full text-md px-4 py-3 rounded border"/>
                </div>
                <div className="flex-1">
                  <p className="text-xl mb-2">Close: </p>
                  <input value={newActivity.close_at} onChange={(e) => setNewActivity(prev => ({...prev, close_at: e.target.value}))} type="datetime-local" className="w-full text-md px-4 py-3 rounded border"/>
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <p className="text-xl mb-2">has timer? </p>
                  <input
                    onChange={() => {
                      setHasTimer(!hasTimer)
                      setNewActivity(prev => ({...prev, timer: null}))
                    }}
                    type="checkbox"
                    className="appearance-none w-16 focus:outline-none checked:bg-blue-300 h-7 bg-gray-300 rounded-full before:inline-block before:rounded-full before:bg-blue-500 before:h-7 before:w-8 checked:before:translate-x-full shadow-inner transition-all duration-300 before:ml-0.5"
                  />
                </div>
  
                {hasTimer && <div className="mb-2">
                  <p className="text-xl mb-2">Timer (minutes): </p>
                  <input value={newActivity.timer} onChange={(e) => setNewActivity(prev => ({...prev, timer: e.target.value}))} type="number" className="w-1/3 text-2xl px-4 py-3 rounded border"/>
                </div>}
              </div>

            </div>

            <button onClick={createActivity} className="w-full my-8 px-4 py-4 bg-BackgroundColor_Darker text-white text-xl rounded">
              Create Activity
            </button>

          </div>
        </div>
      </div>
    </>
  )
}