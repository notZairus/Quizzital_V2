import { useEffect, useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext.jsx';
import { baseUrl } from "../js/functions.js";
import Heading1 from "./Heading1.jsx"
import Swal from "sweetalert2";
import { nanoid } from 'nanoid';

export default function Classrooms() {
  const { currentUser } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState([]);

  console.log(classrooms)

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

  function showAddClassroomForm() {
    Swal.fire({
      title: 'Classroom Name',
      showCancelButton: true,
      input: "text",
      inputAttributes: {
        minlength: "3",
        maxlength: "10",
        required:"true"
      },
      backdrop: `
        rgba(0,0,0,0.2)
      `,
      preConfirm: async (value) => {
        let res = await fetch(baseUrl('/classroom'), {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            'user_id': currentUser.id,
            'name': value,
            'classroom_key': nanoid(10)
          })
        });

        let new_classroom = await res.json()
        setClassrooms([...classrooms, new_classroom])
      }
    });
  }

  return (
    <>
      <Heading1>Classrooms</Heading1>
      <div className="w-full grid grid-cols-5 gap-4 mt-8 auto-rows-min">
        {
          classrooms.map(classroom => (
            <div key={classroom.classroom_key} className="bg-white rounded shadow p-4 flex items-center justify-center text-3xl h-[150px]">
              {classroom.name}
            </div>
          ))
        }
        <div onClick={showAddClassroomForm} className="h-[150px] p-4 flex hover:bg-black/15 transition-all duration-200 items-center justify-center text-3xl cursor-pointer bg-black/10 text-black/50 rounded-lg">
          + New Room
        </div>
      </div>
    </>
  )
} 