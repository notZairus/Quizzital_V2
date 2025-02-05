import { lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Layout = lazy(() => import('./Layout.jsx'));

const Login = lazy(() => import('./components/Login.jsx'));
const Register = lazy(() => import('./components/Register.jsx'))

const Home = lazy(() => import('./components/Home.jsx'))


function App() {
  return (
      <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />}/>
          </Route>
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
