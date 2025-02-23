import { useState, createContext, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser')) || null);


  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  } 

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }

  return (
    <AuthContext.Provider value={{currentUser, login, logout}}>
      { children }
    </AuthContext.Provider>
  )
}