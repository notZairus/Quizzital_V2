import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { backendUrl } from "../js/functions";
import Swal from "sweetalert2";

export default function StudentClassroom() {
    const { currentUser } = useContext(AuthContext);
    const [classrooms, setClassrooms] = useState([]);

    console.log(currentUser)
    console.log(classrooms)

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

    function joinRoom() {
      Swal.fire({
        title: 'Classroom Key',
        showCancelButton: true,
        input: "text",
        inputAttributes: {
          required:"true"
        },
        backdrop: `
          rgba(0,0,0,0.2)
        `,
        preConfirm: async (value) => {
          let res = await fetch(backendUrl('/classroom'), {
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
            },
            body: JSON.stringify({
              'user_id': currentUser.id,
              'classroom_key': value,
              'role': currentUser.role
            })
          });

          if (res.status == 404) {
            Swal.fire({
              icon: 'error',
              title: 'Classroom not found.',
              text: 'Classroom with this key doesn\'t exist'
            })
            return;
          }

          if (res.status == 500) {
            Swal.fire({
              icon: 'error',
              title: 'Forbidden.',
              text: 'Duplicated Classroom.'
            })
            return;
          }

          let result = await res.json()
          setClassrooms(result)
        }
      });
    }


  return (
    <div className="w-full grid grid-cols-5 gap-4 mt-8 auto-rows-min">
      {
        classrooms.map((classroom, index) => (
          <div key={index} className="bg-white rounded shadow p-4 flex items-center justify-center text-3xl h-[150px]">
            {classroom.name}
          </div>
        ))
      }
      <div onClick={joinRoom} className="h-[150px] p-4 flex hover:bg-black/15 transition-all duration-200 items-center justify-center text-3xl cursor-pointer bg-black/10 text-black/50 rounded-lg">
        + Join Room
      </div>
    </div>
  )
}