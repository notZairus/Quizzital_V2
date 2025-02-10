import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Layout = lazy(() => import('./Layout.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Register = lazy(() => import('./components/Register.jsx'))
const Classrooms = lazy(() => import('./components/Classrooms.jsx'))
const Quizzes = lazy(() => import('./components/Quizzes.jsx'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'))


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
            <Route path='/user-roles' element={<Register />}/>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
