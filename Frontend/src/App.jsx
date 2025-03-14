import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizCreate from './Pages/quizzes/QuizCreate.jsx';
import { AuthContext } from './contexts/AuthContext.jsx';
import ProfessorRoute from './Components/ProfessorRoute.jsx';


const Classrooms = lazy(() => import('./Pages/classrooms/Index.jsx'));
const ClassroomShow = lazy(() => import('./Pages/classrooms/Show.jsx'));


const ActivityArea = lazy(() => import('./Components/ActivityArea.jsx'))


const Quizzes = lazy(() => import('./Pages/quizzes/Quizzes.jsx'));
const QuizShow = lazy(() => import('./Pages/quizzes/Show.jsx'));


const Layout = lazy(() => import('./Layout.jsx'));
const ProtectedRoute = lazy(() => import('./Components/ProtectedRoute.jsx'))
const UserRoles = lazy(() => import('./Components/UserRoles.jsx'))


// Auth
const Login = lazy(() => import('./Pages/auth/Login.jsx'));
const Register = lazy(() => import('./Pages/auth/Register.jsx'))
const Ai = lazy(() => import('./Pages/Ai.jsx'))


function App() {
  const { currentUser } = useContext(AuthContext);

  console.log(currentUser)

  return (
    <>
      <BrowserRouter> 
        <Suspense>
          <Routes key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>

              <Route path="/classroom" element={<Classrooms />} />
              <Route path="/classroom/:id" element={<ClassroomShow />} />

              <Route path='/quiz' element={<ProfessorRoute><Quizzes /></ProfessorRoute>}/>
              {currentUser && currentUser.role === "professor" && <Route path="/quiz/:id" element={<QuizShow />} />}

              <Route path='/quiz/create' element={<QuizCreate />}/>
              <Route path='/ai' element={<Ai />}/>
            </Route>

            <Route path='/login' element={<Login />}/>
            <Route path='/register' element={<Register />}/>

            <Route path='/user-roles' element={<UserRoles />}/>

            <Route path="/activity-area" element={<ActivityArea />} />


          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
