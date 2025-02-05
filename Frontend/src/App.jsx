import { lazy, useState, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Layout = lazy(() => import('./Layout.jsx'));
const Login = lazy(() => import('./components/Login.jsx'));
const Register = lazy(() => import('./components/Register.jsx'))
const Home = lazy(() => import('./components/Home.jsx'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute.jsx'))


function App() {
  return (
      <>
      <BrowserRouter>
        <Suspense>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Home />}/>
            </Route>
            <Route path='/login' element={<Login />}/>
            <Route path='/register' element={<Register />}/>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
