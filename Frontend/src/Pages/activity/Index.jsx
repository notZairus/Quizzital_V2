import { useContext, useEffect } from "react";
import Heading1 from "../../Components/Heading1";
import { AuthContext } from "../../contexts/AuthContext";
import { ClassroomContext } from "../../contexts/ClassroomContext";
import { backendUrl } from "../../js/functions";
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
          _acts[classroom.name] = { classroom_id: act.classroom_id, classroom_name: classroom.name, activities: [act] }
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

    if (timeNow.getTime() > closeTime.getTime()) {
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
            return (
              <>
                <div 
                  className=" bg-white flex flex-col cursor-pointer w-full border-2 p-4 py-5 rounded text-xl "
                >
                  <p className="text-2xl">{ c.classroom_name }</p>
                  <div className="w-full mt-2 space-y-2">
                  {
                    c.activities.map(activity => {

                      let students_who_already_answered = activity.records.map(r => r.user_id);

                      if (students_who_already_answered.includes(currentUser.id)) return null;

                  
                      return (
                        <div 
                          key={activity.id} 
                          className="flex items-center justify-between cursor-pointer w-full bg-white border-2 p-4 rounded text-xl hover:border-BackgroundColor_Darker transition-all duration-200"
                          onClick={() => answerActivity(activity.id, c.classroom_id)}
                        >
                          <p>{activity.name}</p>
                          <div>
                            <p className="text-sm"><span className="text-gray-400">Open at: </span>{activity.open_at}</p>
                            <p className="text-sm"><span className="text-gray-400">Close at: </span>{activity.close_at}</p>
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