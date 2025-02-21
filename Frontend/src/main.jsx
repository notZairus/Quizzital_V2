import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ClassroomProvider } from './contexts/ClassroomContext.jsx'
import { QuizProvider } from './contexts/QuizContext.jsx'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ClassroomProvider>
      <QuizProvider>
        <App />
      </QuizProvider>
    </ClassroomProvider>
  </AuthProvider>
)
