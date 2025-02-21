
import Heading1 from "../../Components/Heading1";
import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ClassroomContext } from "../../contexts/ClassroomContext.jsx";


export default function ClassroomShow() {
  const { id } = useParams();
  const { classrooms } = useContext(ClassroomContext);
  const [currentClassroom, setCurrentClassroom] = useState(classrooms.find(classroom => classroom.id == id));

  return (
    <Heading1> Hi from {currentClassroom.name} <span className="text-gray-300">({currentClassroom.classroom_key})</span></Heading1>
  )
}