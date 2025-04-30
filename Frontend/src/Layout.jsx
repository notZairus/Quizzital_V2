import { useState } from "react";
import { Outlet,  useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { ClassroomContext } from "./contexts/ClassroomContext";
import { QuizContext } from "./contexts/QuizContext";
import Swal from "sweetalert2";


import burger_icon from './assets/icons/burger-icon.svg';
import cross_icon from './assets/icons/cross-svgrepo-com.svg'
import school_icon from "./assets/icons/school-svgrepo-com (active).svg"
import school_icon_gray from "./assets/icons/school-svgrepo-com (gray).svg"
import quizzes_icon from './assets/icons/documents-papers-with-text-lines-svgrepo-com (active).svg'
import quizzes_icon_gray from './assets/icons/documents-papers-with-text-lines-svgrepo-com (gray).svg'
import activity_icon from './assets/icons/documents-papers-with-text-lines-svgrepo-com (active).svg'
import activity_icon_gray from './assets/icons/documents-papers-with-text-lines-svgrepo-com (gray).svg'
import acc_settings from './assets/icons/settings-svgrepo-com (active).svg'
import acc_settings_gray from './assets/icons/settings-svgrepo-com (gray).svg'
import logo from './assets/logo/logo-no-name.png';


export default function Layout() {
  const navigate = useNavigate();
  const [sideExpanded, setSideExpanded] = useState(false);
  const { logout, currentUser } = useContext(AuthContext);
  const { insertClassroom } = useContext(ClassroomContext);
  const { insertQuiz } = useContext(QuizContext);
  

  function handleLogout() {
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout'
    }).then((result) => {
      if (result.isConfirmed) {

        const clearData = () => {
          localStorage.clear();
          insertClassroom([]);
          insertQuiz([]);
        };
    
        clearData();
        logout();

        Swal.fire({
          title: 'Logged out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
  
        // Example redirect after a short delay
        setTimeout(() => {
          navigate('/login')
        }, 1500);
      }
    });
  }

  return (
    <>  
      <div className="w-full min-h-screen bg-BackgroundColor text-TextColor">
        <header 
          className="left-0 right-0 h-20 bg-white shadow flex justify-between items-center fixed z-20 px-8 py-4" 
        >
          <div className="w-12 aspect-square" onClick={() => setSideExpanded(!sideExpanded)}>
            <img src={sideExpanded ? cross_icon : burger_icon} alt="asdasd" />
          </div>
          <div className="cursor-pointer h-full flex justify-center items-center" onClick={() => navigate('/classroom')}>
            <img src={logo} alt="logo" className="h-16"/>
            {/* <h1 className="text-BackgroundColor_Darker text-4xl font-bold">Quizzital</h1> */}
          </div>
          <div 
            className="h-full relative flex gap-12 items-center"
          >
            <div className="bg-BackgroundColor_Darker text-white px-4 py-2 rounded-full shadow-md text-xl">
                {currentUser.role === 'student' ? 'Student' : 'Professor'}
            </div>

          </div>

        </header> 
      
        <div className="flex h-full">

          {/* this is the sidebar */}
          <div className={`${sideExpanded ? "w-80 " : 'w-0'} z-10 pb-4 flex flex-col justify-between pt-20 min-h-screen h-full shadow bg-white transition-all duration-500 overflow-hidden fixed left-0 top-0`}>

            <nav>
              <div onClick={() => navigate('/classroom')}>
                <div className={`${window.location.pathname.startsWith('/classroom') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold cursor-pointer' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6 cursor-pointer`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/classroom') ? school_icon : school_icon_gray} />
                  </div>
                  <p className="cursor-pointer">Classroom</p>
                </div>
              </div>
  
              {currentUser.role === 'professor' && <div onClick={() => navigate('/questionnaire')}>
                <div className={`${window.location.pathname.startsWith('/questionnaire') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold cursor-pointer' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6 cursor-pointer`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/questionnaire') ? quizzes_icon : quizzes_icon_gray} />
                  </div>
                  <p className="cursor-pointer">Questionnaire</p>
                </div>
              </div>}

              {currentUser.role === "student" && <div onClick={() => navigate('/activity')}>
                <div className={`${window.location.pathname.startsWith('/activity') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold cursor-pointer' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6 cursor-pointer`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/activity') ? activity_icon : activity_icon_gray} />
                  </div>
                  <p className="cursor-pointer">Activities</p>
                </div>
              </div>}

              <div onClick={() => navigate('/my-account')}>
                <div className={`${window.location.pathname.startsWith('/my-account') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold cursor-pointer' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6 cursor-pointer`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/my-account') ? acc_settings : acc_settings_gray} />
                  </div>
                  <p className="cursor-pointer">Account Details</p>
                </div>
              </div>
            </nav>
            <div className="flex justify-center items-center px-4">
              <div className="w-full bg-BackgroundColor_Darker h-32 rounded shadow p-4 flex flex-col gap-4 transition duration-300 hover:shadow-lg hover:scale-[1.01]">
                <div className="flex items-center gap-5 w-full text-white text-2xl">
                  <div 
                    className="h-12 aspect-square rounded-full p-[3px] bg-gray-200 cursor-pointer hover:ring-2 hover:ring-white transition duration-200"
                    onClick={() => navigate('/my-account')}
                  >
                    <img
                      src={
                        !currentUser.profile_picture
                          ? "https://muslimaid-2022.storage.googleapis.com/upload/img_cache/file-34105-0ab2275211d0f9a6ddb85dd13b2b0515.jpeg"
                          : currentUser.profile_picture
                      }
                      alt=""
                      className="h-full rounded-full"
                    />
                  </div>
                  <p className="max-h-8 max-w-48 truncate">{currentUser.first_name} {currentUser.last_name}</p>
                </div>
                <div className="flex-1">
                  <button
                    onClick={handleLogout}
                    className="bg-white w-full h-full rounded-md text-black hover:bg-gray-200 transition duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 pt-28 px-16 pb-12">
            <Outlet />
          </div>

        </div>

      </div>
    </>
  )
}