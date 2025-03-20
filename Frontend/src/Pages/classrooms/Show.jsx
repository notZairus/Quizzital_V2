
import Heading1 from "../../Components/Heading1";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useRef, useState, useEffect, lazy } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import Swal from "sweetalert2";


const ActivityPanel = lazy(() => import('../../Components/ActivityPanel.jsx'));


export default function ClassroomShow() {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const { classrooms } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));
  const navigate = useNavigate();
  const [showCreateActivityPanel, setShowCreateActivityPanel] = useState(false);
  const [isProf, setIsProf] = useState(currentUser.role == 'professor')



  const [learningMaterials, setLearningMaterials] = useState([]);
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS
  // IMPLEMENT UPLOADS OF LEARNING MATERIALS



  function openActivity(_id) {
    isProf 
      ? showActivity()
      : answerActivity()


    function showActivity() {
      alert('show act');
    }

    function answerActivity() {
      localStorage.setItem('activity', JSON.stringify(currentClassroom.activities.find(act => act.id == _id)));
      localStorage.setItem('currentClassroom', JSON.stringify(currentClassroom));
      navigate('/activity-area');
    }
  }

  console.log(currentClassroom);


  return (
    <>
      {isProf && <ActivityPanel show={showCreateActivityPanel} setShow={setShowCreateActivityPanel} classroom_id={id}/>}
        
      <div className="flex justify-between items-start">
          <Heading1>{currentClassroom.name} {isProf && <span className="text-gray-300">(Key: {currentClassroom.classroom_key})</span>}</Heading1>
          {isProf && <button 
            className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => setShowCreateActivityPanel(true)}
          >
            Create Activity
          </button> }
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
                <div key={student.id} className="w-full border p-4 rounded">{student.first_name} {student.last_name}</div>
              ))
            }
          </div>
        </div>}
        <div className="flex-1 space-y-2">

          {/* ACTIVITY DIV */}
          <div className="flex-1 bg-white px-4 py-4 rounded border">
            <h2 className="text-2xl font-semibold">Activities</h2>
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
            <h2 className="text-2xl font-semibold">Materials</h2>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {
                learningMaterials.map(activity => (
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
        </div>
      </div>
    </>
  )
}