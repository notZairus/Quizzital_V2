
import Heading1 from "../../Components/Heading1";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";
import ActivityPanel from "../../Components/ActivityPanel.jsx";


export default function ClassroomShow() {
  const { id } = useParams();
  const { classrooms } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));
  const navigate = useNavigate();
  const [showCreateActivityPanel, setShowCreateActivityPanel] = useState(false);

  console.log(currentClassroom)
  console.log(currentClassroom.students)
  console.log(showCreateActivityPanel)


  return (
    <>
      <ActivityPanel show={showCreateActivityPanel} setShow={setShowCreateActivityPanel} classroom_id={id}/>
        
      <div className="flex justify-between items-start">
          <Heading1>{currentClassroom.name} <span className="text-gray-300">(Key: {currentClassroom.classroom_key})</span></Heading1>
          <button 
            className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded font-semibold shadow"
            onClick={() => setShowCreateActivityPanel(true)}
          >
            Create Activity
          </button> 
      </div>
      <hr className="mb-8"/>
      <div className="flex gap-4">
        <div className="w-2/5 h-min bg-white px-4 rounded border py-4">
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
        </div>
        <div className="flex-1 bg-white px-4 py-4 rounded min-h-96 border">
          <h2 className="text-2xl font-semibold">Activities</h2>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {
              currentClassroom.activities.map(activity => (
                <div key={activity.id} className={`w-full border p-4 rounded text-xl`}>{activity.name}</div>
              ))
            }
          </div>
        </div>  
      </div>
    </>
  )
}