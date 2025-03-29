
import Heading1 from "../../Components/Heading1";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useRef, useState, useEffect, lazy } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import Swal from "sweetalert2";
import { backendUrl } from "../../js/functions.js";
import { getClassroom } from "../../js/functions.js";
import Toast from "../../Components/Toast.js";


const ActivityPanel = lazy(() => import('../../Components/ActivityPanel.jsx'));


export default function ClassroomShow() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { classrooms, insertClassroom } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));
  const navigate = useNavigate();
  const [showCreateActivityPanel, setShowCreateActivityPanel] = useState(false);
  const [isProf, setIsProf] = useState(currentUser.role == 'professor')
  const fileInputRef = useRef(null);

  console.log(currentClassroom);

  function openActivity(_id) {
    isProf 
      ? showActivity()
      : answerActivity()


    function showActivity() {
      alert('show act');
    }

    async function answerActivity() {
      let currentActivity = currentClassroom.activities.find(act => act.id == _id);
      let students_who_already_answered = currentActivity.records.map((r) => r.user_id);

      if (students_who_already_answered.includes(currentUser.id)) {
        Swal.fire({
          icon: 'error',
          title: 'Forbidden',
          text: 'You have already taken this activity.'
        })
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
      
      getClassroom(currentUser, insertClassroom)
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



  useEffect(() => {
    setCurrentClassroom(classrooms.find(classroom => classroom.id == id))
  }, [classrooms])

  return (
    <>
      {isProf && <ActivityPanel show={showCreateActivityPanel} setShow={setShowCreateActivityPanel} classroom_id={id}/>}
        
      <div className="flex justify-between items-start">
        <Heading1>{currentClassroom.name} {isProf && <span className="text-gray-300">(Key: {currentClassroom.classroom_key})</span>}</Heading1>
      </div>

      {currentClassroom.description && <p className="mb-4">{currentClassroom.description}</p>}
      <hr className="mb-8"/>
      <div className="flex gap-4">

        {/* STUDENT DIV */}
        {isProf && <div className="w-2/5 h-min bg-white px-4 rounded border py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Students</h1>
            <p className="text-gray-400">Students enrolled: {currentClassroom.students.length}</p>
          </div>
          <div className="text-black mt-4 space-y-2">
            {
              currentClassroom.students.map((student, index) => (
                <div key={student.id} className="w-full border p-4 rounded flex justify-between">
                  <p>{student.first_name} {student.last_name}</p>
                  {student.status === 'pending' && <div className="flex gap-4">
                    <button onClick={() => acceptRequest(student.id)}className="text-blue-400 hover:text-blue-600">Accept</button>
                    <button onClick={() => declineRequest(student.id)} className="text-red-400 hover:text-red-600">Decline</button>
                  </div>}
                </div>
              ))
            }
          </div>
        </div>}
        <div className="flex-1 space-y-2">

          {/* ACTIVITY DIV */}
          <div className="flex-1 bg-white px-4 py-4 rounded border">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">Activities</h2>
              {isProf && 
                <button 
                  className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
                  onClick={() => setShowCreateActivityPanel(true)}
                >
                  Create
                </button>
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
          <div className="flex-1 bg-white px-4 py-4 rounded border">
          <div className="flex justify-between items-start">
              <h2 className="text-2xl font-semibold">Materials</h2>
              {isProf && 
                <>
                  <input type="file" ref={fileInputRef} className="hidden"/> 
                  <button 
                    className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
                    onClick={handleFileUpload}
                  >
                    Create
                  </button>
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
    </>
  )
}