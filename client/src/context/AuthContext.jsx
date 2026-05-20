import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));


    const login = (data) => {
        // console.log(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user.email);
        setToken(data.token);
        setUser(data.user.email);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
    // This work belongs to Arjit Prakher
};

export const useAuth = () => useContext(AuthContext);