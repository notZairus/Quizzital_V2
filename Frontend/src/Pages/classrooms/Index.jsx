import { useContext, lazy, Suspense, useEffect } from "react";
import { AuthContext } from '../../contexts/AuthContext.jsx';
import Heading1 from "../../Components/Heading1.jsx"
import { useNavigate } from "react-router-dom";

const ProfessorClassroom = lazy(() => import('./ProfessorClassroom.jsx'))
const StudentClassroom = lazy(() => import('./StudentClassroom.jsx'))

export default function Classrooms() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    if (!currentUser.role) {
      navigate('/user-roles');
    }
  }, [])
  

  return (
    <>
      <Heading1>Classroom</Heading1>
        <Suspense>
          {currentUser.role === 'professor' 
            ? <ProfessorClassroom />
            : <StudentClassroom />
          }
        </Suspense>
    </>
  )
} 
