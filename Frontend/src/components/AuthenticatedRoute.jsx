import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";


export default function AuthenticatedRoute({ children }) {
  const { currentUser } = useContext(AuthContext);

  return (
    currentUser ? children : <Navigate to='/login' />
  )
}