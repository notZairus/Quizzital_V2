import { useContext, useEffect } from "react";
import Heading1 from "../../Components/Heading1";
import { AuthContext } from "../../contexts/AuthContext";
import { ClassroomContext } from "../../contexts/ClassroomContext";
import { backendUrl, formatSeconds } from "../../js/functions";
import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";





export default function Activities() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { classrooms } = useContext(ClassroomContext);
  const [activities, setActivities] = useState({});

  useEffect(() => {
    if (!activities) return;

    const fetchActivities = async () => {
      let res = await fetch(backendUrl(`/activity?user_id=${currentUser.id}`))
      let result = await res.json();

      let _acts = {}

      result.activities.forEach(act => {
        let classroom = classrooms.find(c => c.id === act.classroom_id);
        
        if (!_acts[classroom.name]) {
          _acts[classroom.name] = { classroom_id: act.classroom_id, classroom_name: classroom.name, activities: [act], students: classroom.students }
        } else {
          _acts[classroom.name].activities.push(act);
        }
      });

      setActivities(_acts);
    }

    fetchActivities()
  }, [])


  async function answerActivity(activity_id, classroom_id) {
    let currentClassroom = classrooms.find(c => c.id == classroom_id);
    let currentActivity = currentClassroom.activities.find(act => act.id == activity_id);

    let students_who_already_answered = currentActivity.records.map((r) => r.user_id);
    if (students_who_already_answered.includes(currentUser.id)) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        html: `
          <p>You’ve already submitted this activity.</p>
          <p><b>Multiple attempts are not allowed.</b></p>
        `,
        confirmButtonText: 'Okay',
        footer: 'Please contact your instructor if you think this is a mistake.',
        allowOutsideClick: false
      });
      return;
    }

    let timeNow = new Date();
    let openTime = new Date(currentActivity.open_at);
    let closeTime = new Date(currentActivity.close_at);

    if (timeNow.getTime() < openTime.getTime()) {
      Swal.fire({
        icon: 'info',
        title: 'Activity Not Yet Started',
        html: `
          <p>The activity will be open starting:</p>
          <b>${openTime.toLocaleString()}</b>
        `,
        confirmButtonText: 'Okay',
        footer: 'Please come back once it opens.',
        allowOutsideClick: false
      });
      return;
    }

    if (timeNow.getTime() > closeTime.getTime() && currentActivity.close_at) {
      Swal.fire({
        icon: 'warning',
        title: 'Activity Closed',
        html: `
          <p>Sorry, this activity closed on:</p>
          <b>${closeTime.toLocaleString()}</b>
        `,
        confirmButtonText: 'Got it',
        footer: 'You can no longer participate in this activity.',
        allowOutsideClick: false
      });
      return;
    }
    
    localStorage.setItem('activity', JSON.stringify(currentActivity));
    localStorage.setItem('currentClassroom', JSON.stringify(currentClassroom));
    navigate('/activity-area');
  }

  return (
    <>
      <Heading1>Pending Activities</Heading1>
      <div className="w-full h-full">
        <div className="space-y-4">
          {Object.values(activities).map(c => {
            console.log(c);

            let acceptedStudents = c.students.filter(std => std.status === "accepted");

            if (!acceptedStudents.map(std => std.id).includes(currentUser.id)) {
              return null;
            }

            return (
              <>
                <div 
                  className=" bg-white flex flex-col w-full border-2 p-4 py-3 rounded text-xl "
                >
                  <p className="text-2xl cursor-pointer w-min" onClick={() => navigate(`/classroom/${c.classroom_id}`)} >{ c.classroom_name }</p>
                  <div className="w-full mt-2 space-y-2">
                  {
                    c.activities.map(activity => {

                      let students_who_already_answered = activity.records.map(r => r.user_id);

                      if (students_who_already_answered.includes(currentUser.id)) return null;
                    
                      if (!activity.quiz) return null
                  
                      return (
                        <div
                          key={activity.id}
                          onClick={() => answerActivity(activity.id, activity.classroom_id)}
                          className="w-full bg-gradient-to-r from-BackgroundColor_Darker to-BackgroundColor_Darkest rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                          <div className="text-white font-semibold text-lg">{activity.name}</div>
                        
                          <div className="text-sm text-white">
                            {activity.quiz ? (
                              <span>{activity.quiz.questions.length} Items</span>
                            ) : (
                              <span className="italic text-gray-300">No Questionnaire</span>
                            )}
                          </div>
                        
                          <div className="text-sm text-gray-300 text-right sm:text-left">
                            <p><span className="text-gray-300/80">Open:</span> {activity.open_at}</p>
                            <p><span className="text-gray-300/80">Close:</span> {activity.close_at ? activity.close_at : 'No Closing Date'}</p>
                            {activity.timer > 0 && (
                              <p><span className="text-gray-300/80">Timer:</span> {formatSeconds(activity.timer)} mins</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  }
                    
                  </div>
                </div>
              </>
            )

          })}
        </div>
      </div>
    </>
  )
}