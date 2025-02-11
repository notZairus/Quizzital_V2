import { useContext, lazy, Suspense } from "react";
import { AuthContext } from '../contexts/AuthContext.jsx';
import Heading1 from "./Heading1.jsx"

const ProfessorClassroom = lazy(() => import('./ProfessorClassroom.jsx'))
const StudentClassroom = lazy(() => import('./StudentClassroom.jsx'))




export default function Classrooms() {
  const { currentUser } = useContext(AuthContext)

  return (
    <>
      <Heading1>Classrooms</Heading1>
        <Suspense>
          {currentUser.role === 'professor' 
            ? <ProfessorClassroom />
            : <StudentClassroom />
          }
        </Suspense>
    </>
  )
} 