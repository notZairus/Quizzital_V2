import { useState } from "react";
import { Outlet,  useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { ClassroomContext } from "./contexts/ClassroomContext";
import { QuizContext } from "./contexts/QuizContext";


import burger_icon from './assets/icons/burger-icon.svg';
import cross_icon from './assets/icons/cross-svgrepo-com.svg'
import school_icon from "./assets/icons/school-svgrepo-com (white).svg"
import school_icon_gray from "./assets/icons/school-svgrepo-com (gray).svg"
import quizzes_icon from './assets/icons/documents-papers-with-text-lines-svgrepo-com (white).svg'
import quizzes_icon_gray from './assets/icons/documents-papers-with-text-lines-svgrepo-com (gray).svg'
import acc_settings from './assets/icons/settings-svgrepo-com (white).svg'
import acc_settings_gray from './assets/icons/settings-svgrepo-com (gray).svg'


export default function Layout() {
  const navigate = useNavigate();
  const [sideExpanded, setSideExpanded] = useState(false);
  const { logout, currentUser } = useContext(AuthContext);
  const { insertClassroom } = useContext(ClassroomContext);
  const { insertQuiz } = useContext(QuizContext);

  function handleLogout() {
    const clearData = () => {
      insertClassroom([]);
      insertQuiz([]);
    };

    clearData();
    logout();
    navigate('/login')
  }

  return (
    <>  
      <div className="w-full min-h-screen bg-BackgroundColor text-TextColor">

        <header 
          className="left-0 right-0 h-20 bg-white shadow flex justify-between items-center absolute z-20 px-8" 
        >
          <div className="w-12 aspect-square" onClick={() => setSideExpanded(!sideExpanded)}>
            <img src={sideExpanded ? cross_icon : burger_icon} alt="asdasd" />
          </div>
          <div>
            <h1 className="font-bold text-3xl cursor-pointer" onClick={() => {
              navigate('/classroom');
              setSideExpanded(false);
            }}>
              Quizzital V2
            </h1>
          </div>
          <div></div>
        </header>
        
        <div className="flex h-full">
          <div className={`${sideExpanded ? "w-80 " : 'w-0'} z-10 pb-4 flex flex-col justify-between pt-20 h-full shadow bg-white transition-all duration-500 overflow-hidden absolute left-0`}>
            <nav>
              <div onClick={() => navigate('/classroom')}>
                <div className={`${window.location.pathname.startsWith('/classroom') ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname.startsWith('/classroom') ? school_icon : school_icon_gray} />
                  </div>
                  Classroom
                </div>
              </div>
  
              {currentUser.role === 'professor' && <div onClick={() => navigate('/quiz')}>
                <div className={`${window.location.pathname.startsWith('/quiz') ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                      <div className="w-8">
                        <img src={window.location.pathname.startsWith('/quiz') ? quizzes_icon : quizzes_icon_gray} />
                      </div>
                  Quiz
                </div>
              </div>}
  
              <div onClick={() => navigate('/ai')}>
                <div className={`${window.location.pathname == '/ai' ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname == '/ai' ? acc_settings : acc_settings_gray} />
                  </div>
                  Ai Quiz Generator
                </div>
              </div>
            </nav>
            <div className="flex justify-center items-center">
              <button onClick={handleLogout} className="bg-BackgroundColor_Darker rounded px-4 py-2 text-white text-2xl hover:bg-red-500">Logout</button>
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