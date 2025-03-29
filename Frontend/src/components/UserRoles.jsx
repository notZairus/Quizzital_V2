import { useContext, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";
import { backendUrl } from "../js/functions";

export default function UserRoles() {
  const navigate = useNavigate()
  const { currentUser, logout, login } = useContext(AuthContext);
  const selectRef = useRef(null)

  async function handleSubmit() {
    let res = await fetch(backendUrl('/user-role'), {
      method: "PATCH",
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        "user_id": currentUser.id,
        "role": selectRef.current.value
      })
    })

    let updatedUser = await res.json()
    logout()
    login(updatedUser)
    console.log(updatedUser)
    navigate('/classroom')
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-BackgroundColor flex-col space-y-8">
      <select ref={selectRef} required name="role" id="role" className="text-3xl px-2 pr-8 py-1 rounded text-left shadow">
        <option value="professor">Professor</option>
        <option value="student">Student</option>
      </select>
      <button onClick={handleSubmit} className="text-xl transition-all duration-300 font-semibold hover:text-white hover:bg-black/80 px-4 py-2 rounded">Confirm</button>
    </div>
  )
}