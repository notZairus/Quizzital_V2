import { createContext, useEffect, useState } from "react";

export const ClassroomContext = createContext();

export function ClassroomProvider({ children }) {
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

  return (
    <ClassroomContext.Provider value={{classrooms, insertClassroom}}>
      { children }
    </ClassroomContext.Provider>
  )
}