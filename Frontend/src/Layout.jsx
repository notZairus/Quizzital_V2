import { useState } from "react";
import { Outlet,  useNavigate } from "react-router-dom";
import burger_icon from './assets/icons/burger-icon.svg';
import cross_icon from './assets/icons/cross-svgrepo-com.svg'
import school_icon from "./assets/icons/school-svgrepo-com (white).svg"
import school_icon_gray from "./assets/icons/school-svgrepo-com (gray).svg"
import quizzes_icon from './assets/icons/documents-papers-with-text-lines-svgrepo-com (white).svg'
import quizzes_icon_gray from './assets/icons/documents-papers-with-text-lines-svgrepo-com (gray).svg'
import acc_settings from './assets/icons/settings-svgrepo-com (white).svg'
import acc_settings_gray from './assets/icons/settings-svgrepo-com (gray).svg'


export default function Layout() {
  const [sideExpanded, setSideExpanded] = useState(false);
  const navigate = useNavigate();

  return (
    <>  
      <div className="w-full min-h-screen bg-BackgroundColor text-TextColor">

        <header 
          className="left-0 right-0 h-20 bg-white shadow flex justify-between items-center absolute z-10 px-8" 
        >
          <div className="w-12 aspect-square" onClick={() => setSideExpanded(!sideExpanded)}>
            <img src={sideExpanded ? cross_icon : burger_icon} alt="asdasd" />
          </div>
          <div>
            <h1 className="font-bold text-3xl">Quizzital V2</h1>
          </div>
          <div></div>
        </header>
        
        <div className="flex h-full">
          <div className={`${sideExpanded ? "w-80 " : 'w-0'} pt-20 h-full shadow bg-white transition-all duration-500 overflow-hidden absolute left-0`}>
            <nav>
              <div onClick={() => navigate('/classrooms')}>
                <div className={`${window.location.pathname == '/classrooms' ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname == '/classrooms' ? school_icon : school_icon_gray} />
                  </div>
                  Classrooms
                </div>
              </div>
  
              <div onClick={() => navigate('/quizzes')}>
                <div className={`${window.location.pathname == '/quizzes' ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                      <div className="w-8">
                        <img src={window.location.pathname == '/quizzes' ? quizzes_icon : quizzes_icon_gray} />
                      </div>
                  Quizzes
                </div>
              </div>
  
              <div onClick={() => navigate('/account-settings')}>
                <div className={`${window.location.pathname == '/account-settings' ? 'text-white bg-BackgroundColor_Darker' : 'text-gray-300'} transition-all duration-300 flex items-center font-semibold gap-4 text-2xl px-8 py-6`}>
                  <div className="w-8">
                    <img src={window.location.pathname == '/account-settings' ? acc_settings : acc_settings_gray} />
                  </div>
                  Account Settings
                </div>
              </div>
            </nav>
          </div>
  
          <div className="flex-1 pt-28 px-16 pb-12">
            <Outlet />
          </div>
        </div>

      </div>
    </>
  )
}