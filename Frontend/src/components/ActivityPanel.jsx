import Heading1 from "./Heading1"
import { QuizContext } from '../contexts/QuizContext';
import { AuthContext } from '../contexts/AuthContext';
import { ClassroomContext } from '../contexts/ClassroomContext';
import { useContext, useState } from "react";
import { backendUrl, getClassroom } from '../js/functions'; 
import { useNavigate } from "react-router-dom";
import Toast from './Toast';
import Swal from 'sweetalert2';


export default function ActivityPanel({ show, setShow, classroom_id }) {
  const navigate = useNavigate()
  const { quizzes } = useContext(QuizContext);
  const { refreshClassroom } = useContext(ClassroomContext);
  const [hasTimer, setHasTimer] = useState(false);

  const [newActivity, setNewActivity] = useState({
    'name': "",
    "perfect_score": 100,
    "classroom_id": classroom_id,
    "quiz_id": quizzes.length === 0 ? null : quizzes[0].id,
    "open_at": null,
    "close_at": null,
    "timer": null
  })

  async function createActivity() {

    if (newActivity.name === "" || newActivity.name.length <= "2") {
      Swal.fire({
        'icon': 'error',
        'title': 'Invalid Activity Name',
        'text': 'Activity name must be longer than 2 characters.'
      })
      return;
    }

    if (!newActivity.open_at) {
      Swal.fire({
        'icon': 'error',
        'title': 'Invalid Open Time',
        'text': 'Open time should never be null'
      })
      return;
    }

    if (newActivity.open_at) {
      let open = new Date(newActivity.open_at).getTime();
      let now = new Date().getTime()

      if (now > open) {
        Swal.fire({
          'icon': 'error',
          'title': 'Invalid Open Time',
          'text': 'Opening time should never be earlier than the current date/time'
        })
        return;
      }
    }

    if (newActivity.close_at) {
      let open = new Date(newActivity.open_at).getTime();
      let close = new Date(newActivity.close_at).getTime();

      if (open >= close) {
        Swal.fire({
          'icon': 'error',
          'title': 'Invalid Close Time',
          'text': 'Opening time should never be later than closing time'
        })
        return;
      }
    }

    if (newActivity.timer !== null) {
      console.log(newActivity.timer);
      console.log(newActivity.timer <= 0)
      if (newActivity.timer <= 0) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Timer',
          text: 'Timer can\'t be a negative number.'
        })
        return;
      }
    }

    await fetch(backendUrl('/activity'), {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        ...newActivity, 
        timer: newActivity.timer * 60, 
        open_at: new Date(newActivity.open_at).toLocaleString(), 
        close_at: newActivity.close_at == null ? null : new Date(newActivity.close_at).toLocaleString()
      })
    })

    Toast("success", "Activity created!", 1000);
    refreshClassroom();
    setShow(false);
  }


  return (
    <>
      {/* Overlay + Drawer Container */}
      <div
        onClick={() => setShow(false)}
        className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
          show ? "bg-black bg-opacity-40 opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Drawer */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-0 right-0 overflow-auto h-full w-full sm:w-[500px] bg-white shadow-2xl px-8 pt-12 py-8 transition-transform duration-500 ease-in-out ${
            show ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Heading1>Create Quiz</Heading1>

          <div className="space-y-6 mt-8">
            {/* Activity Name */}
            <div>
              <label className="text-lg font-medium mb-1 block">Quiz Name</label>
              <input
                value={newActivity.name}
                onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                type="text"
                className="w-full px-4 py-3 rounded-lg border text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Activity Grade */}
            <div>
              <label className="text-lg font-medium mb-1 block">Grade</label>
              <select
                value={newActivity.perfect_score}
                onChange={(e) => setNewActivity(prev => ({ ...prev, perfect_score: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border text-lg focus:outline-none"
              >
                {[100, 50, 20, 10, 5].map(score => (
                  <option key={score} value={score}>{score}</option>
                ))}
              </select>
            </div>

            {/* Quiz Selection */}
            <div>
              <label className="text-lg font-medium mb-1 block">Questionnaire</label>
              <select
                value={newActivity.quiz_id}
                onChange={(e) => setNewActivity(prev => ({ ...prev, quiz_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border text-lg focus:outline-none"
              >
                {quizzes.map(quiz => (
                  <option key={quiz.id} value={quiz.id}>{quiz.name}</option>
                ))}
              </select>
            </div>

            {/* Open/Close Date */}
            <div className="flex flex-col gap-4">
              <div className="flex-1">
                <label className="text-lg font-medium mb-1 block">Open</label>
                <input
                  value={newActivity.open_at}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, open_at: e.target.value }))}
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-lg border text-md"
                />
              </div>
              <div className="flex-1">
                <label className="text-lg font-medium mb-1 block">Close</label>
                <input
                  value={newActivity.close_at}
                  onChange={(e) => setNewActivity(prev => ({ ...prev, close_at: e.target.value }))}
                  type="datetime-local"
                  className="w-full px-4 py-3 rounded-lg border text-md"
                />
              </div>
            </div>

            {/* Timer Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-lg font-medium">Has Timer?</label>
                <input
                  type="checkbox"
                  checked={hasTimer}
                  onChange={() => {
                    setHasTimer(!hasTimer)
                    setNewActivity(prev => ({ ...prev, timer: null }))
                  }}
                  className="w-6 h-6 rounded border-2 border-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasTimer && (
                <div className="flex items-center gap-3">
                  <label className="text-lg font-medium">Minutes:</label>
                  <input
                    value={newActivity.timer}
                    onChange={(e) => setNewActivity(prev => ({ ...prev, timer: e.target.value }))}
                    type="number"
                    min={1}
                    className="w-24 px-3 py-2 rounded-lg border text-lg"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={createActivity}
              className="w-full bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest hover:bg-BackgroundColor_Darker  text-white font-semibold py-3 rounded-lg text-lg transition-all duration-300"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>

  )
}