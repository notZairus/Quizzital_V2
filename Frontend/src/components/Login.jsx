import { lazy, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { auth, googleProvider } from "../configs/firebase";
import { signInWithPopup } from "firebase/auth";
import { backendUrl } from "../js/functions";
import Swal from "sweetalert2";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = lazy(() => import('./Register'))
const UserRoles = lazy(() => import('./UserRoles'))


export default function Login() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    'email': '',
    'password': ''
  })


  async function googleSignIn() {
    let result = await signInWithPopup(auth, googleProvider);

    let data = {
      first_name: result.user.displayName.split(" ")[0],
      last_name: result.user.displayName.split(" ")[1],
      email: result.user.email
    }

    let response = await fetch(backendUrl("/login"), {
      method: "POST",
      headers: {
        'Content-type' : 'application/json'
      },
      body: JSON.stringify({
        ...data,
        provider: 'google'
      }),
    })

    if (response.status == 403) {
      Swal.fire({
        icon:"error",
        title: 'Forbidden.',
        text: 'The user is not registered using the selected provider.'
      })
      return;
    }

    let user = await response.json()

    console.log(user)

    login(user);

    if (!user.role) {
      navigate('/user-roles')
      return;
    }

    navigate('/classroom');
  }

  async function signIn(e) {
    e.preventDefault();

    let res = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        ...formData, 
        provider: 'email'
      })
    })

    setFormData({
      'email': '',
      'password': ''
    })

    if (res.status == 404) {
      Swal.fire({
        icon: 'error',
        title: 'User not found.',
        text: 'User with this email doesn\'t exist'
      })
      return;
    }

    let user = await res.json();

    if (user && user.password === formData.password) {
      Swal.fire({
        'icon': 'success',
        'title': 'Login Successfully!',
      }) 

      login(user);
      
      if (!user.role) {
        navigate('/user-roles')
        return;
      }

      navigate('/classroom');
    } else {
      Swal.fire({
        'icon': 'error',
        'title': 'Incorrect Password!',
      })
      return;
    }
  }

  
  return (
    <>
      <div class="max-w-lg mx-auto my-16 bg-white p-8 rounded-xl shadow-slate-300 shadow-md">
          <h1 class="text-4xl font-medium text-center">Login</h1>
  
          <div class="my-5">
              <button onClick={googleSignIn} class="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                  <img src="https://www.svgrepo.com/show/355037/google.svg" class="w-6 h-6" alt="" /> <span>Login with Google</span>
              </button>
          </div>
          <form onSubmit={signIn} class="my-10">
              <div class="flex flex-col space-y-5">
                  <label for="email">
                      <p class="font-medium text-slate-700 pb-2">Email address</p>
                      <input required value={formData.email} onChange={(e) => setFormData(prev => ({...prev, 'email': e.target.value}))} id="email" name="email" type="email" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter email address" />
                  </label>
                  <label for="password">
                      <p class="font-medium text-slate-700 pb-2">Password</p>
                      <input required value={formData.password} onChange={(e) => setFormData(prev => ({...prev, 'password': e.target.value}))} id="password" name="password" type="password" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" placeholder="Enter your password" />
                  </label>
                  <button class="w-full py-3 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Login</span>
                  </button>
                  <p class="text-center">Not registered yet? <Link to="/register" element={<Register />} class="text-indigo-600 font-medium inline-flex space-x-1 items-center"><span>Register now </span><span><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg></span></Link></p>
              </div>
          </form>
      </div>
    </>
  )
}