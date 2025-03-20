import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useContext } from "react";

export default function UnauthenticatedRoute({ children }) {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? <Navigate to="/classroom" /> : children;
}