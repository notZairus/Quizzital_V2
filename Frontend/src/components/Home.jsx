import { useEffect, useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext.jsx';
import { baseUrl } from "../js/functions.js";


export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const getClassrooms = async () => {
      let response = await fetch(baseUrl('/get_classrooms'), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.id
        })
      })

      let result = await response.json();
      setClassrooms(result);
    }
    getClassrooms();
  }, [])

  return (
    <h1 className="text-black">Hi from Home</h1>
  )
} 