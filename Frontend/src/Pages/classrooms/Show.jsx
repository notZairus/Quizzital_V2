
import Heading1 from "../../Components/Heading1";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useRef, useState, useEffect, lazy } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import Swal from "sweetalert2";
import { backendUrl } from "../../js/functions.js";
import Toast from "../../Components/Toast.js";
import Button from '../../Components/Button.jsx';
import plus_icon from '../../assets/icons/plus-svgrepo-com.svg'

const ActivityPanel = lazy(() => import('../../Components/ActivityPanel.jsx'));


export default function ClassroomShow() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { classrooms, insertClassroom, refreshClassroom } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));
  const navigate = useNavigate();
  const [showCreateActivityPanel, setShowCreateActivityPanel] = useState(false);
  const [isProf, setIsProf] = useState(currentUser.role == 'professor');
  const fileInputRef = useRef(null);
  const [activityRecords, setActivityRecords] = useState(null);


  function openActivity(_id) {
    isProf 
    ? showActivity()
    : answerActivity()

    async function showActivity() {
      let activity = currentClassroom.activities.find(act => act.id === _id)

      // if (!activity.quiz) {
      //   Swal.fire({
      //     icon: 'info',
      //     title: "This Activity has no assigned Questionnaire",
      //     text: 'Please assign a questionnaire'
      //   })
      //   return;
      // }

      navigate(`/classroom/${currentClassroom.id}/activity/${_id}/data`)
    }

    async function answerActivity() {
      let currentActivity = currentClassroom.activities.find(act => act.id == _id);

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
      let closeTime = currentActivity.close_at ? new Date(currentActivity.close_at) : null;

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

      if (closeTime && timeNow.getTime() > closeTime.getTime()) {
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
  }

  async function uploadMaterial() {
    let fileInput = fileInputRef.current;

    return new Promise(resolve => {
      fileInput.addEventListener('change', (event) => {
        let file = event.target.files[0];
        if (file) resolve(file);
      });
      fileInput.click();
    })
  }

  async function handleFileUpload() {
    try {
      let selectedFile = await uploadMaterial();
      let formData = new FormData();

      formData.append('file', selectedFile)
      formData.append("upload_preset", "my_unsigned_preset");

      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/raw/upload`, {
          method: "POST",
          body: formData
      });
      const data = await response.json();

      const response2 = await fetch(backendUrl('/learning-material'), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          'classroom_id': currentClassroom.id,
          'file_name': selectedFile.name,
          'link': data.secure_url
        })
      })
      
      refreshClassroom();
      Toast("success", "Activity created!", 1000);

    } catch (error) {
      console.error("Upload failed:", error);
    }
  }

  async function acceptRequest(student_id) {
    let res = await fetch(backendUrl('/classroom-request'), {
      method: 'PATCH',
      headers: {
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({
        'student_id': student_id,
        'classroom_id': currentClassroom.id
      })
    })

    let result = await res.json()

    if (result.status === 200) {
      let updated_students = currentClassroom.students.map(std => std.id == student_id ? {...std, status: 'accepted'} : std);
      setCurrentClassroom({...currentClassroom, students: updated_students})
      insertClassroom(classrooms.map((c) => c.id == currentClassroom.id ? {...currentClassroom, students: updated_students} : c));
    }
  }

  async function declineRequest(student_id) {
    let res = await fetch(backendUrl('/classroom-request'), {
      method: 'DELETE',
      headers: {
        'Content-type' : 'application/json',
      },
      body: JSON.stringify({
        'student_id': student_id,
        'classroom_id': currentClassroom.id
      })
    })

    let result = await res.json()

    if (result.status === 200) {
      let updated_students = currentClassroom.students.filter(std => std.id != student_id);
      setCurrentClassroom({...currentClassroom, students: updated_students})
      insertClassroom(classrooms.map((c) => c.id == currentClassroom.id ? {...currentClassroom, students: updated_students} : c));
    }
  }

  async function kickStudent(student_id) {
    let student = currentClassroom.students.find(s => s.id === student_id);

    // to be implemented
    Swal.fire({
      icon: 'warning',
      title: `Kick ${student.first_name}?`,
      text: "Are you sure you want to remove this student?",
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, kick!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        
        await fetch(backendUrl('/classroom-request'), {
          method: 'DELETE',
          headers: {
            'Content-type' : 'application/json'
          },
          body: JSON.stringify({
            'student_id': student_id,
            'classroom_id': currentClassroom.id
          })
        })

        // await fetch(backendUrl('/activity-record'), {
        //   method: 'DELETE',
        //   headers: {
        //     'Content-type' : 'application/json'
        //   },
        //   body: JSON.stringify({
        //     'user_id': student_id,
        //     'classroom_id': currentClassroom.id
        //   })
        // })

        refreshClassroom();
        Swal.fire('Kicked!', `${student.first_name} has been removed.`, 'success');
      }
    });

    return;
  }


  useEffect(() => {
    setCurrentClassroom(classrooms.find(classroom => classroom.id == id))
  }, [classrooms])

  useEffect(() => {
    if (!currentClassroom) return;

    let allRecords = {};

    currentClassroom.students.forEach(std => {
      allRecords[`${std.last_name} ${std.first_name}`] = [`${std.last_name} ${std.first_name}`];
      currentClassroom.activities.forEach(act => {
        let student_record = act.records.find(_record => _record.user_id === std.id)
        allRecords[`${std.last_name} ${std.first_name}`].push(student_record ? student_record.user_score: 0);
      })
    })

    setActivityRecords(allRecords);
  }, [currentClassroom, classrooms]);


  function recordTable() {
    if (!activityRecords) return;

    let records = Object.values(activityRecords);

    return (
      <>
        <h2 className="text-2xl font-semibold text-center">Student Records</h2>
        <div class="overflow-x-auto rounded-lg mt-4">
          <table class="min-w-full table-auto bg-white border-collapse text-gray-700">
            <thead class="bg-BackgroundColor_Darker text-white">
              <tr>
                <th class="px-6 py-3 text-center uppercase font-semibold">Student Name</th>
                {
                  currentClassroom.activities.map(act => (
                    <th class="px-6 py-3 uppercase font-semibold text-center">{act.name} ({act.perfect_score}%)</th>
                  ))
                }
              </tr>
            </thead>
            <tbody>
              {records.map((rec => (
                <tr class="border-b  hover:bg-BackgroundColor hover:text-black transition-all duration-300">
                  {
                    rec.map(data => (
                      <td class="px-6 py-4 text-lg text-center">{data.length >= 3 ? data : `${data}%`}</td>
                    ))
                  }
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </>
    )
  }

  


  return (
    <>
      {isProf && <ActivityPanel show={showCreateActivityPanel} setShow={setShowCreateActivityPanel} classroom_id={id}/>}
        
      <Heading1>
        <div>
          <span className="cursor-pointer" onClick={() => navigate('/classroom')}>Classroom &gt;</span> {currentClassroom.name} {isProf && <span className="text-gray-300">(Key: {currentClassroom.classroom_key})</span>}
        </div>
      </Heading1>

      {currentClassroom.description && <p onClick={recordTable} className="mb-4">{currentClassroom.description}</p>}
      <hr className="mb-8"/>
      <div className="flex gap-4">

        {/* STUDENT DIV */}
        {isProf && <div className="w-2/5 h-min bg-white px-4 rounded border py-4 hover:shadow-lg  transition-all duration-300">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Students</h1>
            <p className="text-gray-400">Students enrolled: {currentClassroom.students.filter(s => s.status === "accepted").length}</p>
          </div>
          <div className="text-black mt-4 space-y-2">
            {
              currentClassroom.students.map((student, index) => (
                <div key={student.id} className="w-full border p-4 rounded flex justify-between">
                  <p>{student.first_name} {student.last_name}</p>
                  {student.status === 'pending' 
                  ? 
                    <div className="flex gap-4">
                      <button onClick={() => acceptRequest(student.id)}className="text-blue-400 hover:text-blue-600">Accept</button>
                      <button onClick={() => declineRequest(student.id)} className="text-red-400 hover:text-red-600">Decline</button>
                    </div>
                  :
                    <div className="flex gap-4">
                      <button onClick={() => kickStudent(student.id)} className="text-red-400 hover:text-red-600">Kick</button>
                    </div>
                  }
                </div>
              ))
            }
          </div>
        </div>}
        <div className="flex-1 space-y-2">

          {/* ACTIVITY DIV */}
          <div className="flex-1 bg-white px-4 py-4 rounded border hover:shadow-lg  transition-all duration-300">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">Activities</h2>
              {isProf && 
                <Button 
                  onClick={() => setShowCreateActivityPanel(true)}
                >
                  <div className="w-6">
                    <img src={plus_icon} alt="+" />
                  </div>
                  <span className="font-semibold">Create</span>
                </Button>
              }
            </div>
            <div className="grid gap-2 mt-4">
              {
                currentClassroom.activities.map(activity => (
                  <div 
                    key={activity.id} 
                    className="cursor-pointer w-full border-2 p-4 rounded text-xl hover:border-BackgroundColor_Darker transition-all duration-200"
                    onClick={() => openActivity(activity.id)}
                  >
                    {activity.name}
                  </div>
                ))
              }
            </div>
          </div>  

          {/* LEARNING MATERIALS DIV */}
          {/* TO BE IMPLEMENTED */}
          <div className="flex-1 bg-white px-4 py-4 rounded border hover:shadow-lg  transition-all duration-300">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">Materials</h2>
              {isProf && 
                <>
                  <input type="file" ref={fileInputRef} className="hidden"/> 
                  <Button 
                    onClick={handleFileUpload}
                  >
                    <div className="w-6">
                      <img src={plus_icon} alt="+" />
                    </div>
                    <span className="font-semibold">Create</span>
                  </Button>
                </>
              }
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {
                currentClassroom.learning_materials.map(learning_material => (
                  <a 
                    key={learning_material.id} 
                    className="cursor-pointer w-full border-2 p-8 rounded text-xl hover:border-BackgroundColor_Darker transition-all duration-200 text-wrap flex items-center"
                    href={learning_material.link}
                    target="_blank"
                  >
                    <p className="max-w-full text-wrap overflow-hidden">{learning_material.file_name}</p>
                  </a>
                ))
              }
            </div>
          </div>  
        </div>

      </div>
      <div className="w-full mt-8 bg-white px-4 rounded border py-4 hover:shadow-lg  transition-all duration-300 flex flex-col">
        { recordTable() }
      </div>
    </>
  )
}