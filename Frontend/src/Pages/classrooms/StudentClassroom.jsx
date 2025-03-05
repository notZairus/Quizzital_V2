import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { ClassroomContext } from "../../contexts/ClassroomContext";
import { backendUrl } from "../../js/functions";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

export default function StudentClassroom() {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { classrooms, insertClassroom } = useContext(ClassroomContext);

    console.log("classrooms: ")
    console.log(classrooms);

    console.log('sadasdd')


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
          insertClassroom(result)
        }
      });
    }

  return (
    <div className="w-full grid grid-cols-3 gap-8 auto-rows-min h-full">
      {
        classrooms.map((classroom, index) => (
          <div onClick={() => navigate(`/classroom/${classroom.id}`)} key={classroom.classroom_key} className="bg-white relative cursor-pointer rounded-3xl border flex items-center justify-center h-64 overflow-hidden shadow-md">
            <img src={classroom.img_url} alt="" className="w-full h-full bg-red-400"/>
            <div className="absolute z-0 bottom-0 w-full h-20 p-2 px-4 overflow-hidden shadow bg-white">
              <p className="text-2xl font-semibold">{classroom.name}</p>
              <p className="h-8 overflow-clip text-gray-400">
                {classroom.description}
              </p>
            </div>
          </div>
        ))
      }
      <div onClick={joinRoom} className="h-64 p-4 flex hover:bg-black/15 transition-all duration-200 items-center justify-center text-3xl cursor-pointer bg-black/10 text-black/50 rounded-3xl">
        + Join Room
      </div>
    </div>
  )
}