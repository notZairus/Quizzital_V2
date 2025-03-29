import { useState } from "react";
import { Validator } from '../../js/Classes'
import Swal from "sweetalert2";
import { backendUrl } from "../../js/functions"
import { useNavigate } from "react-router-dom";

import eye_open from '../../assets/icons/eye-open.svg';
import eye_closed from '../../assets/icons/eye-closed.svg';
import back_icon from '../../assets/icons/chevron-back-outline-svgrepo-com.svg'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    'first_name': "",
    'last_name': "",
    'email': "",
    'password': "",
    'password_confirm': "",
  })
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);


  const handleCreateAccount = async (e) => {  
    e.preventDefault();
    
    let newErrors = {};

    if (!Validator.lengthValidate(formData.first_name, 3)) {
      newErrors.first_name = "First name is should have more that 2 character."
    } 
    if (!Validator.lengthValidate(formData.last_name, 3)) {
      newErrors.last_name = "Last name is should have more that 2 character."
    } 
    if (!Validator.isEmail(formData.email)) {
      newErrors.email = "Invalid email format."
    }
    if (!Validator.lengthValidate(formData.password, 8)) {
      newErrors.password = "Password should have a minimum of 8 character."
    }
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = "Password doesn't match."
    } else {
      delete newErrors.password_confirm
    }

    setErrors(newErrors);
  
    if (Object.keys(newErrors).length != 0) return;
    
    let res = await fetch(backendUrl('/register'), {
      method: 'POST',
      headers: {
        "Content-Type": 'application/json'
      },
      body: JSON.stringify({
        ...formData,
        provider: 'email'
      })
    })

    setFormData({
      'first_name': "",
      'last_name': "",
      'email': "",
      'password': "",
      'password_confirm': "",
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Email already used",
        text: "A user with this email already exist."
      })
      return;
    }

    let newUser = await res.json();
    console.log(newUser);
    navigate('/login')
  }
  

  return (
    <>
      <div class="max-w-lg mx-auto my-16 bg-white p-8 rounded-xl shadow-slate-300 shadow-md relative">
        <button className="w-12 aspect-square absolute top-8 left-4" onClick={() => navigate('/login')}>
          <img 
            src={back_icon} 
            alt="back-btn" 
          />
        </button>

        <h1 class="text-4xl font-medium text-center">Register</h1>

        <form onSubmit={handleCreateAccount} class="my-10">
          <div class="flex flex-col space-y-5">
              <label for="first_name">
                  <p class="font-medium text-slate-700 pb-2">First Name</p>
                  <input 
                    id="first_name" 
                    type="text" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                    placeholder="John" 
                    value={formData.first_name}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        [e.target.id]: e.target.value
                      }))
                    }}
                  />
                  {errors.first_name && <span className="text-red-500 text-sm">{errors.first_name}</span>}
              </label>
              <label for="last_name">
                  <p class="font-medium text-slate-700 pb-2">Last Name</p>
                  <input 
                    id="last_name" 
                    type="text" class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                    placeholder="Doe" 
                    value={formData.last_name}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        [e.target.id]: e.target.value
                      }))
                    }}
                  />
                  {errors.last_name && <span className="text-red-500 text-sm">{errors.last_name}</span>}
              </label>
              <label for="email">
                  <p class="font-medium text-slate-700 pb-2">Email address</p>
                  <input 
                    id="email" 
                    type="email" 
                    class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                    placeholder="JohnDoe@gmail.com" 
                    value={formData.email}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        [e.target.id]: e.target.value
                      }))
                    }}
                  />
                  {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
              </label>
              <label for="password">
                <p className="font-medium text-slate-700 pb-2">Password</p>
                <div className="w-full border items-center border-slate-200 rounded-lg px-3 hover:shadow flex justify-between">
                  <input 
                    autoComplete="false" 
                    type={showPassword ? "text" : "password"} 
                    required value={formData.password} 
                    id="password" 
                    name="password" 
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        [e.target.id]: e.target.value
                      }))
                    }}
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
                {errors.password && <span className="text-red-500 text-sm">{errors.password}</span>}
              </label>
              <label for="password_confirm">
                <p class="font-medium text-slate-700 pb-2">Confirm Password</p>
                <input 
                  id="password_confirm" 
                  type={showPassword ? 'text' : 'password'} 
                  class="w-full py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                  value={formData.password_confirm}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      [e.target.id]: e.target.value
                    }))
                  }}
                />
                {errors.password_confirm && <span className="text-red-500 text-sm">{errors.password_confirm}</span>}
              </label>
              <button class="w-full py-3 font-medium text-white bg-BackgroundColor_Darker hover:bg-BackgroundColor_Darkest rounded-lg border-indigo-500 hover:shadow inline-flex space-x-2 items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Create Account</span>
              </button>
          </div>
        </form>
      </div>
    </>
  )
}