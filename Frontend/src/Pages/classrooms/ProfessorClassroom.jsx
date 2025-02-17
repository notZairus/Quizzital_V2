import { useEffect, useState, useContext } from "react";
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { backendUrl } from "../../js/functions.js";
import Swal from "sweetalert2";
import { nanoid } from 'nanoid';

export default function ProfessorClassroom() {
  const { currentUser } = useContext(AuthContext);
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const getClassrooms = async () => {
      let response = await fetch(backendUrl('/get_classrooms'), {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          role: currentUser.role
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
        console.log(currentUser);
        let res = await fetch(backendUrl('/classroom'), {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            'user_id': currentUser.id,
            'name': value,
            'classroom_key': nanoid(10),
            'role': currentUser.role
          })
        });

        let new_classroom = await res.json()
        setClassrooms([...classrooms, new_classroom])
      }
    });
  }

  return (
    <div className="w-full grid grid-cols-3 gap-8 mt-8 auto-rows-min">
      {
        classrooms.map(classroom => (
          <div key={classroom.classroom_key} className="bg-white rounded-3xl shadow p-4 flex items-center justify-center text-3xl h-64">
            {classroom.name}
          </div>
        ))
      }
      <div onClick={showAddClassroomForm} className="h-64 p-4 flex hover:bg-black/15 transition-all duration-200 items-center justify-center text-3xl cursor-pointer bg-black/10 text-black/50 rounded-3xl">
        + New Room
      </div>
    </div>
  )
}