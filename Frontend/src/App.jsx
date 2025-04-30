import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuizCreate from './Pages/quizzes/QuizCreate.jsx';
import { AuthContext } from './contexts/AuthContext.jsx';
import ProfessorRoute from './Components/ProfessorRoute.jsx';


const LandingPage = lazy(() => import('./Pages/Landing.jsx'));

const Classrooms = lazy(() => import('./Pages/classrooms/Index.jsx'));
const ClassroomShow = lazy(() => import('./Pages/classrooms/Show.jsx'));

const ActivityArea = lazy(() => import('./Components/ActivityArea.jsx'))
const ShowActivity = lazy(() => import('./Pages/classrooms/activity/Show.jsx'));
const ActivityReview = lazy(() => import('./Components/ActivityReview.jsx'));

const Quizzes = lazy(() => import('./Pages/quizzes/Quizzes.jsx'));
const QuizShow = lazy(() => import('./Pages/quizzes/Show.jsx'));

const Activities = lazy(() => import('./Pages/activity/Index.jsx'));

const Layout = lazy(() => import('./Layout.jsx'));
const AuthenticatedRoute = lazy(() => import('./Components/AuthenticatedRoute.jsx'))
const UnauthenticatedRoute = lazy(() => import('./Components/UnauthenticatedRoute.jsx'))
const UserRoles = lazy(() => import('./Components/UserRoles.jsx'))

const AccountSettings = lazy(() => import('./Pages/account/AccountSettings.jsx'))


// Auth
const Login = lazy(() => import('./Pages/auth/Login.jsx'));
const Register = lazy(() => import('./Pages/auth/Register.jsx'))


function App() {
  const { currentUser } = useContext(AuthContext);
  
  return (
    <>
      <BrowserRouter> 
        <Suspense>
          <Routes key={location.pathname}>

            
            <Route path="/" element={<LandingPage />}/>
            
            <Route path="/" element={<AuthenticatedRoute><Layout /></AuthenticatedRoute>}>

            
              {/* Links of Classroom */}
              <Route path="/classroom" element={<Classrooms />} />
              <Route path="/classroom/:id" element={<ClassroomShow />} />

              <Route path="/classroom/:classroom_id/activity/:activity_id/data" element={<ShowActivity />} />
              <Route path="/classroom/:classroom_id/activity/:activity_id/student/:student_id" element={<ProfessorRoute><ActivityReview /></ProfessorRoute>} />


              {/* Links of Questionnaire */}
              <Route path='/questionnaire' element={<ProfessorRoute><Quizzes /></ProfessorRoute>}/>
              {currentUser && currentUser.role === "professor" && <Route path="/questionnaire/:id" element={<QuizShow />} />}
              <Route path='/questionnaire/create' element={<QuizCreate />}/>


              <Route path='/activity' element={<Activities />}/>

              
              <Route path="/my-account" element={<AccountSettings />} />

            </Route>
            
            {/* Sessions */}
            <Route path='/login' element={<UnauthenticatedRoute><Login /></UnauthenticatedRoute>}/>
            <Route path='/register' element={<UnauthenticatedRoute><Register /></UnauthenticatedRoute>}/>

            {/* Shows up when the user has no roles yet. */}
            <Route path='/user-roles' element={<UserRoles />}/>

            {/* Activity Area */}
            <Route path="/activity-area" element={<ActivityArea />} />

            <Route path="/activity/:id/review" element={<ActivityReview />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
