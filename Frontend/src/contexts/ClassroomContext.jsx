import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { backendUrl } from "../js/functions";

export const ClassroomContext = createContext();

export function ClassroomProvider({ children }) {
  const { currentUser } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    let storedClassrooms = JSON.parse(localStorage.getItem('classrooms'));
    if (storedClassrooms) {
      setClassrooms(storedClassrooms);
    }
  }, [])

  function insertClassroom(_classrooms) {
    localStorage.setItem("classrooms", JSON.stringify(_classrooms));
    setClassrooms(_classrooms);
  }

  function refreshClassroom() {
    let fetchClassroom = async () => {
      let response = await fetch(backendUrl('/get_classrooms'), {
        method: 'POST',
        headers: {
          'Content-type' : 'application/json'
        },
        body: JSON.stringify({
          'user_id': currentUser.id,
          'role': currentUser.role
        })
      })
  
      let result = await response.json()
      insertClassroom(result);
    }

    fetchClassroom();
  }

  return (
    <ClassroomContext.Provider value={{classrooms, insertClassroom, refreshClassroom}}>
      { children }
    </ClassroomContext.Provider>
  )
}