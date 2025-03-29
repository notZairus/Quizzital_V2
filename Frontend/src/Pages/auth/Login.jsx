import { lazy, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { auth, googleProvider } from "../../configs/firebase";
import { signInWithPopup } from "firebase/auth";
import { backendUrl, getClassroom, getQuizzes } from "../../js/functions.js"
import Swal from "sweetalert2";
import { AuthContext } from "../../contexts/AuthContext";
import { ClassroomContext } from "../../contexts/ClassroomContext";
import { QuizContext } from "../../contexts/QuizContext";
import { useNavigate } from "react-router-dom";
import Toast from '../../Components/Toast.js';

import eye_open from '../../assets/icons/eye-open.svg';
import eye_closed from '../../assets/icons/eye-closed.svg';


const Register = lazy(() => import('./Register'))


export default function Login() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext);
  const { classrooms, insertClassroom } = useContext(ClassroomContext);
  const { quizzes, insertQuiz } = useContext(QuizContext);
  const [formData, setFormData] = useState({
    'email': '',
    'password': ''
  })
  const [showPassword, setShowPassword] = useState(false);

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
    login(user);

    await getClassroom(user, insertClassroom);
    await getQuizzes(user, insertQuiz);

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
      Toast('error', 'user not found!')
      return;
    }

    let user = await res.json();


    if (user && user.password === formData.password) {  
      Toast('success', 'Login Successfully!');

      login(user);

      await getClassroom(user, insertClassroom);
      await getQuizzes(user, insertQuiz);
      navigate('/classroom');

    } else {
      Toast('error', 'Incorrect Password.')
      return;
    }
  }

  
  return (
    <>
      <div className="max-w-lg mx-auto my-16 bg-white p-8 rounded-xl shadow-slate-300 shadow-md">
          <h1 className="text-4xl font-medium text-center">Login</h1>
  
          <div className="my-5">
              <button onClick={googleSignIn} className="w-full text-center py-3 my-3 border flex space-x-2 items-center justify-center border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150">
                  <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt="" /> <span>Login with Google</span>
              </button>
          </div>
          <form onSubmit={signIn} className="my-10">
              <div className="flex flex-col space-y-5">
                  <label htmlFor="email">
                      <p className="font-medium text-slate-700 pb-2">Email address</p>
                      <input 
                        autoComplete="false" 
                        required 
                        value={formData.email} 
                        onChange={(e) => setFormData(prev => ({...prev, 'email': e.target.value}))} 
                        id="email" name="email" 
                        type="email" 
                        className="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                        placeholder="JohnDoe@gmail.com" 
                      />
                  </label>
                  <label htmlFor="password">
                      <p className="font-medium text-slate-700 pb-2">Password</p>
                      <div className="w-full border items-center border-slate-200 rounded-lg px-3 hover:shadow flex justify-between">
                        <input 
                          autoComplete="false" 
                          type={showPassword ? "text" : "password"} 
                          required value={formData.password} 
                          id="password" 
                          name="password" 
                          onChange={(e) => setFormData(prev => ({...prev, 'password': e.target.value}))}
                          className="w-full h-full outline-none py-3"
                        />
                        
                        <div className="aspect-square w-8 flex items-center justify-center">
                          <img 
                            src={showPassword ? eye_open : eye_closed } 
                            alt="show password button" 
                            onClick={() => setShowPassword(!showPassword)}
                          />
                        </div>
                      </div>
                  </label>
                  <button className="w-full py-3 font-medium text-white bg-BackgroundColor_Darker hover:bg-BackgroundColor_Darkest transition-all duration-300 rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Login</span>
                  </button>
                  <p className="text-center">Not registered yet? <Link to="/register" element={<Register />} className="text-indigo-600 font-medium inline-flex space-x-1 items-center"><span>Register now </span><span><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg></span></Link></p>
              </div>
          </form>
      </div>
    </>
  )
}