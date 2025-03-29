import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

export default function ProfessorRoute({ children }) {
  const { currentUser } = useContext(AuthContext);
  return currentUser.role === 'professor' ? children : <Navigate to="/classroom" />
}