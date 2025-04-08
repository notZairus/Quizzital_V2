import { useContext } from "react";
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { ClassroomContext } from '../../contexts/ClassroomContext.jsx';
import { backendUrl } from "../../js/functions.js";
import Swal from "sweetalert2";
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';
import { fileToBase64 } from "../../js/functions.js";


export default function ProfessorClassroom() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { classrooms, insertClassroom } = useContext(ClassroomContext);

  console.log("classrooms: ")
  console.log(classrooms);

  
  function showAddClassroomForm() {  
    Swal.fire({
      'showCancelButton': true,
      'showConfirmButton': true,
      'confirmButtonText': "Create", 
      'html': `
        <div class="space-y-4">
          <div>
              <label for="image" class="block text-lg text-left font-medium text-gray-700 outline-none">Upload Image</label>
              <input type="file" id="image" name="image" accept="image/*" required
                  class="mt-1 block w-full border border-gray-300 p-2 rounded-lg shadow-sm cursor-pointer focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
              <label for="name" class="block font-medium text-gray-700 outline-none text-left text-lg">Name</label>
              <input type="text" id="name" name="name" required
                  class="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500">
          </div>

          <div>
              <label for="description" class="block text-lg text-left font-medium text-gray-700 outline-none">Description</label>
              <textarea id="description" name="description" rows="4" required
                  class="resize-none mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
        </div>
      `,
      'preConfirm': async () => {
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const classroom_img = document.getElementById('image').files[0];

        if (name.length <= 0) {
          return;
        }

        let img_url = "https://i.ibb.co/MDTKHVS6/3d-illustration-human-avatar-profile-23-2150671142.jpg";
        if (classroom_img) {
          let base64 = await fileToBase64(classroom_img);
          let imgData = base64.split(',')[1];

          let formdata = new FormData();
          formdata.append('image', classroom_img);

          let post = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
            method: 'POST',
            body: formdata
          });
          
          let postres = await post.json()
          img_url = postres.data.url;
        }

        
        let res = await fetch(backendUrl('/classroom'), {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify({
            'user_id': currentUser.id,
            'name': name,
            'description': description,
            'img_url': img_url,
            'classroom_key': nanoid(10),
            'role': currentUser.role
          })
        });

        let new_classroom = await res.json()
        insertClassroom([...classrooms, new_classroom])
      }
    })
  }
  
  
  return (
    <div className="w-full grid grid-cols-3 gap-8 auto-rows-min">
      {
        classrooms.map(classroom => (
          <div onClick={() => navigate(`/classroom/${classroom.id}`)} key={classroom.classroom_key} className="bg-white relative cursor-pointer rounded-3xl border flex items-center justify-center h-64 overflow-hidden shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300">
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
      <div onClick={showAddClassroomForm} className=" h-64 flex hover:bg-black/15 transition-all duration-200 items-center justify-center text-3xl cursor-pointer bg-black/10 text-black/50 rounded-3xl">
        New Classroom
      </div>
    </div>
  )
}