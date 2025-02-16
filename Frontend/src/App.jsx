import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizCreate from './Pages/quizzes/QuizCreate.jsx';

const Layout = lazy(() => import('./Layout.jsx'));
const Login = lazy(() => import('./Components/Login.jsx'));
const Register = lazy(() => import('./Components/Register.jsx'))
const Classrooms = lazy(() => import('./Pages/classrooms/Classrooms.jsx'))
const Quizzes = lazy(() => import('./Pages/quizzes/Quizzes.jsx'))
const ProtectedRoute = lazy(() => import('./Components/ProtectedRoute.jsx'))
const UserRoles = lazy(() => import('./Components/UserRoles.jsx'))

function App() {
  return (
    <>
      <BrowserRouter> 
        <Suspense>
          <Routes key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/classroom" element={<Classrooms />}/>
              <Route path='/quiz' element={<Quizzes />}/>
              <Route path='/quiz/create' element={<QuizCreate />}/>
            </Route>
            <Route path='/login' element={<Login />}/>
            <Route path='/register' element={<Register />}/>
            <Route path='/user-roles' element={<UserRoles />}/>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
