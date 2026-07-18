import { createContext, useContext, useState, useEffect } from "react";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("avefit_user_token");
    const savedUser = localStorage.getItem("avefit_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("avefit_user_token", userToken);
    localStorage.setItem("avefit_user", JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("avefit_user_token");
    localStorage.removeItem("avefit_user");
  };

  return (
    <UserAuthContext.Provider value={{ user, token, loading, loginUser, logoutUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export const useUserAuth = () => useContext(UserAuthContext);