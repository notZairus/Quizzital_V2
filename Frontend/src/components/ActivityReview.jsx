import { useState, useEffect, useContext } from "react"
import { useNavigate, useParams } from "react-router-dom";
import { ClassroomContext } from "../contexts/ClassroomContext";
import { backendUrl } from "../js/functions";
import { AuthContext } from "../contexts/AuthContext";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaCheck, FaXmark } from "react-icons/fa6"


export default function ActivityReview() {
  const navigate = useNavigate();
  const parameters = useParams();
  const [activityRecord, setActivityRecord] = useState(null);
  const { classrooms } = useContext(ClassroomContext);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    ChartJS.register(ArcElement, Tooltip, Legend);
    fetch(backendUrl(`/activity-record?user_id=${currentUser.id}&activity_id=${parameters.id}`))
    .then(res => res.json())
    .then(data => setActivityRecord(data));
  }, [])

  console.log(activityRecord)

  return (
    <>
      {activityRecord && 
        (
          <>
            <div className="w-full h-screen bg-backgroundColor flex flex-col items-center justify-center">
              <div className=" bg-white rounded shadow-md py-8 px-10 flex gap-12 w-1/3">
                <div>
                  <p className="text-2xl">{`Passing Grade: ${Math.round(activityRecord.answers.length * 0.7 / activityRecord.answers.length * activityRecord.perfect_score)}`}</p>
                  <p className="text-2xl">{`Your Grade: ${Math.round(activityRecord.answers.filter(q => q.correct).length / activityRecord.answers.length * activityRecord.perfect_score)}`}</p>
  
                  <p className="text-6xl font-thin mt-12">
                    {
                      Math.round(0.7 * activityRecord.perfect_score) <= Math.round(activityRecord.answers.filter(q => q.correct).length / activityRecord.answers.length * activityRecord.perfect_score) 
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
                      data: [activityRecord.answers.length - activityRecord.answers.filter((q) => q.correct).length, activityRecord.answers.filter((q) => q.correct).length],
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
                <button 
                  onClick={() => {
                    let classroom_id = localStorage.getItem('currentClassroomId');
                    localStorage.removeItem('currentClassroomId');
                    navigate(classroom_id ? `/classroom/${classroom_id}` : '/classroom')
                  }} 
                  className="text-2xl w-full border px-5 py-4 border-BackgroundColor_Darker bg-white text-BackgroundColor_Darker rounded hover:bg-BackgroundColor_Darker hover:text-white transition-all duration-300">
                  Back to Classroom
                </button>
              </div>
            </div>
            <div className="w-full min-h-screen flex flex-col py-4 px-40 mb-12 bg-BackgroundColor gap-12"> 
              <div className="w-full">
                <p className="text-3xl text-center">Multiple Choice Questions</p>
                <div className="space-y-4 mt-4">
                  {
                    activityRecord.answers.filter(ans => ans.type === "multiple_choice").map((entry, index) => (
                      <div className="w- bg-white border rounded px-8 pt-4 pb-8">
                        <div className="flex justify-between items-center">
                          <p className="text-2xl">{index+1}. {entry.question}</p>
                          <div className="h-12 aspect-square">
                            {entry.correct 
                            ? 
                              (<FaCheck className="w-full h-full text-BackgroundColor_Darker" />)
                            :
                              (<FaXmark className="w-full h-full text-red-500" />)
                            }
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p>Choices: </p>
                          {
                            [...JSON.parse(entry.choices), entry.correct_answer].map(choice => (
                              <div className={`border text-xl rounded px-4 py-2 ${entry.student_answer === choice && "border-BackgroundColor_Darker/60 border-2" }`}>
                                {choice}
                              </div>
                            ))
                          }
                        </div>
                        <div className="mt-4">
                          <p>Answer: </p>
                          <div className={`text-xl rounded px-4 py-2 border-BackgroundColor_Darker border-2 bg-BackgroundColor_Darker text-white`}>
                            {entry.correct_answer}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              <div className="w-full">
                <p className="text-3xl text-center">Identification Questions</p>
                <div className="space-y-4 mt-4">
                  {
                    activityRecord.answers.filter(ans => ans.type === "identification").map((entry, index) => (
                      <div className="w-full bg-white border rounded px-8 pt-4 pb-8">
                        <div className="flex justify-between items-center">
                          <p className="text-2xl">{index+11}. {entry.question}</p>
                          <div className="h-12 aspect-square">
                            {entry.correct 
                            ? 
                              (<FaCheck className="w-full h-full text-BackgroundColor_Darker" />)
                            :
                              (<FaXmark className="w-full h-full text-red-500" />)
                            }
                          </div>
                        </div>

                        <div className="mt-4">
                          <p>Your Answer: </p>
                          <div className={`text-xl rounded px-4 py-2 border-BackgroundColor_Darker border-2 text-black`}>
                            {entry.student_answer}
                          </div>
                        </div>

                        <div className="mt-4">
                          <p>Answer: </p>
                          <div className={`text-xl rounded px-4 py-2 border-BackgroundColor_Darker border-2 bg-BackgroundColor_Darker text-white`}>
                            {entry.correct_answer}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              
            
            </div>
          </>
        )
      }
    </>
  )
} 