import Heading1 from "../../Components/Heading1";
import ButtonLarge from "../../Components/ButtonLarge";
import { AuthContext } from "../../contexts/AuthContext";
import { useContext, useRef, useState } from "react";
import { backendUrl } from '../../js/functions';
import Swal from "sweetalert2";

import plus_icon from "../../assets/icons/plus-svgrepo-com.svg";


export default function AccountSettings() {
  const { currentUser, login } = useContext(AuthContext);
  const [displayedInfo, setDisplayedInfo] = useState("personal")
  const [personalInfo, setPersonalInfo] = useState({
    'f_name': currentUser.first_name,
    'l_name': currentUser.last_name,
    'dp': currentUser.profile_picture
  })
  const fileInputRef = useRef(null);


  async function updateUser() {

    if (personalInfo.f_name.length <= 2) {
      Swal.fire()
      return;
    }

    if (personalInfo.l_name.length <= 1) {
      Swal.fire()
      return;
    }

    let response = await fetch(backendUrl('/user'), {
      method: 'PATCH',
      headers: {
        'Content-type' : 'application/json'
      },
      body: JSON.stringify({
        ...personalInfo,
        user_id: currentUser.id
      })
    })

    if (response.ok) {
      login({
        ...currentUser,
        first_name: personalInfo.f_name,
        last_name: personalInfo.l_name,
        profile_picture: personalInfo.dp
      })

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated Successfully!'
      })
    }
  }

  async function uploadPicture() {
    let fileInput = fileInputRef.current;

    return new Promise((resolve) => {
      fileInput.addEventListener('change', (e) => {
        let file = e.target.files[0]
        if (file) {
          resolve(file)
        }
      })
      fileInput.click()
    })
  }

  async function handleFileUplaod() {
    let picture = await uploadPicture();

    let formData = new FormData()
    formData.append('file', picture)
    formData.append("upload_preset", "my_unsigned_preset");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUDNAME}/raw/upload`, {
        method: "POST",
        body: formData
    });
    
    const data = await response.json();

    Swal.fire({
      title: 'Display Picture Updated!'
    })

    setPersonalInfo({...personalInfo, dp:data.url})
  }


  return (
    <>
      <div>
        <div className="h-[500px] flex gap-4 mt-8">
          <div className="w-1/4 flex justify-center">
            <div className="border-2 rounded-tl-2xl rounded-tr-2xl h-min pb-4 rounded-xl">
              <div className="px-4 py-4 border-b-2 w-full">
                <p className="text-xl text-gray-400 font-bold">Account Details</p>
              </div>
              <div className="flex flex-col items-start px-4 py-2 mt-2 space-y-2">
                <button onClick={() => setDisplayedInfo("personal")} className={displayedInfo == "personal" ? "text-xl text-BackgroundColor_Darker bg-BackgroundColor_Darkest/10 font-semibold px-6 py-3 rounded-full" : "text-xl text-gray-500 font-semibold px-6 py-3 rounded-full hover:bg-BackgroundColor_Darker/20 transition-all duration-300"}>
                  Personal Information
                </button>
                <button onClick={() => setDisplayedInfo("account")} className={displayedInfo == "account" ? "text-xl text-BackgroundColor_Darker bg-BackgroundColor_Darkest/10 font-semibold px-6 py-3 rounded-full" : "text-xl text-gray-500 font-semibold px-6 py-3 rounded-full hover:bg-BackgroundColor_Darker/20 transition-all duration-300"}>
                  Account Information
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-sm hover:shadow-md transition px-16 py-12 flex flex-col">
            <Heading1>{ displayedInfo === "personal" ? "Personal Information" : "Account Information"}</Heading1> 
            <div className="flex-1 flex items-start justify-between gap-20 mt-4">
              {displayedInfo === "personal" 
              ?
                <>
                  <div className="w-56 aspect-square relative">
                    <img src={!personalInfo.dp ? "https://muslimaid-2022.storage.googleapis.com/upload/img_cache/file-34105-0ab2275211d0f9a6ddb85dd13b2b0515.jpeg" : currentUser.profile_picture } alt="" className="w-full h-full rounded-full border-4"/>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*"/>
                    <div onClick={handleFileUplaod} className="w-16 h-16 bg-blue-400 absolute bottom-0 right-0 rounded-full cursor-pointer">
                      <img src={plus_icon} alt="" />
                    </div>
                  </div>
    
                  <div className="flex-1 flex flex-col gap-4">
                    <label for="first_name">
                      <p class="font-medium text-slate-700 pb-2 text-xl">First Name</p>
                      <input 
                        id="first_name" 
                        value={personalInfo.f_name}
                        onChange={(e) => setPersonalInfo({...personalInfo, f_name: e.target.value})}
                        class="text-xl w-4/5 py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                      />
                    </label>
    
                    <label for="last_name">
                      <p class="font-medium text-slate-700 pb-2 text-xl">Last Name</p>
                      <input 
                        id="first_name" 
                        value={personalInfo.l_name}
                        onChange={(e) => setPersonalInfo({...personalInfo, l_name: e.target.value})}
                        class="text-xl w-4/5  py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                      />
                    </label>
    
                    <div className="mt-8">
                      <button onClick={updateUser} className="w-1/3 text-2xl font-semibold text-white bg-BackgroundColor_Darker px-4 py-3 rounded-full hover:bg-BackgroundColor_Darkest transition-all duration-300">
                        Update
                      </button>
                    </div>
                  </div>
                </>
              :  
              <>
              <div className="flex-1 flex flex-col gap-4">
                <label for="last_name">
                  <p class="font-medium text-slate-700 pb-2 text-xl">Email</p>
                  <input 
                    id="first_name" 
                    value={currentUser.email}
                    readOnly="true"
                    class="text-xl w-4/5  py-3 border border-slate-200 rounded-lg px-3 focus:outline-none focus:border-slate-500 hover:shadow" 
                  />
                </label>
              </div>
            </>
              }

            </div>
            
          </div>
  
        </div>
      </div>
    </>
  )
}