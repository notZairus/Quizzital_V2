import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Layout = lazy(() => import('./Layout.jsx'));
const Login = lazy(() => import('./Components/Login.jsx'));
const Register = lazy(() => import('./Components/Register.jsx'))
const Classrooms = lazy(() => import('./Components/Classrooms.jsx'))
const Quizzes = lazy(() => import('./Components/Quizzes.jsx'))
const ProtectedRoute = lazy(() => import('./Components/ProtectedRoute.jsx'))
const UserRoles = lazy(() => import('./Components/UserRoles.jsx'))

function App() {
  return (
    <>
      <BrowserRouter>
        <Suspense>
          <Routes key={location.pathname}>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/classrooms" element={<Classrooms />}/>
              <Route path='/quizzes' element={<Quizzes />}/>
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
