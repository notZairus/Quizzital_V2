import { lazy, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


const Login = lazy(() => import('./components/Login.jsx'));
const Layout = lazy(() => import('./Layout.jsx'));


function App() {
  const [count, setCount] = useState(0)

  return (
      <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>

          </Route>
          <Route path='/login' element={<Login />}/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
