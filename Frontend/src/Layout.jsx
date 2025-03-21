import { useState } from "react";
import { Outlet,  useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { ClassroomContext } from "./contexts/ClassroomContext";
import { QuizContext } from "./contexts/QuizContext";


import burger_icon from './assets/icons/burger-icon.svg';
import cross_icon from './assets/icons/cross-svgrepo-com.svg'
import school_icon from "./assets/icons/school-svgrepo-com (active).svg"
import school_icon_gray from "./assets/icons/school-svgrepo-com (gray).svg"
import quizzes_icon from './assets/icons/documents-papers-with-text-lines-svgrepo-com (active).svg'
import quizzes_icon_gray from './assets/icons/documents-papers-with-text-lines-svgrepo-com (gray).svg'
import acc_settings from './assets/icons/settings-svgrepo-com (active).svg'
import acc_settings_gray from './assets/icons/settings-svgrepo-com (gray).svg'
import logo from './assets/logo/logo-no-name.png';


export default function Layout() {
  const navigate = useNavigate();
  const [sideExpanded, setSideExpanded] = useState(false);
  const { logout, currentUser } = useContext(AuthContext);
  const { insertClassroom } = useContext(ClassroomContext);
  const { insertQuiz } = useContext(QuizContext);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  

  function handleLogout() {
    const clearData = () => {
      localStorage.clear();
      insertClassroom([]);
      insertQuiz([]);
    };

    clearData();
    logout();
    navigate('/login')
  }

  console.log(currentUser);

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
            <h1 className="text-BackgroundColor_Darker text-4xl font-bold">Quizzital</h1>
          </div>
          <div 
            className="cursor-pointer h-full flex items-center gap-2 border-2 px-2 py-1 rounded-lg relative"
            onClick={() => setOpenUserMenu(!openUserMenu)}
          >
            <div className="h-full aspect-square bg-red-400 rounded-full">
              <img src={acc_settings_gray} alt="" className="h-full"/>
            </div>
            <p className="text-xl">{currentUser.first_name}</p>

            <div className={`${openUserMenu ? "scale-y-100" : "scale-y-0"} origin-top h-20 w-[350px] transition-all duration-300 text-2xl overflow-hidden absolute bg-white border rounded -left-[235px] -bottom-[90px] flex flex-col`}>
              <div  onClick={handleLogout} className="flex-1 flex justify-center items-center hover:bg-black/5 transition-all duration-300">
                Logout
              </div>
            </div>

          </div>
        </header>
      
        <div className="flex h-full">

          {/* this is the sidebar */}
          <div className={`${sideExpanded ? "w-80 " : 'w-0'} z-10 pb-4 flex flex-col justify-between pt-20 min-h-screen h-full shadow bg-white transition-all duration-500 overflow-hidden fixed left-0 top-0`}>

            <nav>
              <div onClick={() => navigate('/classroom')}>
                <div className={`${window.location.pathname.startsWith('/classroom') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/classroom') ? school_icon : school_icon_gray} />
                  </div>
                  Classroom
                </div>
              </div>
  
              {currentUser.role === 'professor' && <div onClick={() => navigate('/questionnaire')}>
                <div className={`${window.location.pathname.startsWith('/questionnaire') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6`}>
                      <div className="w-8">
                        <img src={window.location.pathname.startsWith('/questionnaire') ? quizzes_icon : quizzes_icon_gray} />
                      </div>
                  Questionnaire
                </div>
              </div>}
  
              <div onClick={() => navigate('/ai')}>
              <div className={`${window.location.pathname.startsWith('/ai') ? 'text-black/50 bg-BackgroundColor border-l-BackgroundColor_Darker border-l-8 font-semibold' : 'text-gray-300'} transition-all duration-300 flex items-center gap-4 text-xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname == '/ai' ? acc_settings : acc_settings_gray} />
                  </div>
                  Ai Q. Generator
                </div>
              </div>
            </nav>
            <div className="flex justify-center items-center px-4">
              <div className="w-full px-4 py-2 bg-BackgroundColor_Darker/10 text-black text-xl text-center rounded">
                {currentUser.role === 'student' ? 'Student' : 'Professor'}
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