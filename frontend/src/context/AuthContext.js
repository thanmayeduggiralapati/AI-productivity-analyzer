// context/AuthContext.js
// Manages user authentication state across the app

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    // Load user from localStorage on app start
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
        setLoading(false);
    }, []);

  // ─── Login ────────────────────────────────
const login = async (email, password) => {
    const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
    });

    const { token, user } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setToken(token);
    setUser(user);

    return user;
};

  // ─── Register ─────────────────────────────
const register = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
    });

    const { token, user } = res.data.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    setToken(token);
    setUser(user);

    return user;
};

  // ─── Logout ───────────────────────────────
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
};

  // ─── Update User ──────────────────────────
const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
};

return (
    <AuthContext.Provider value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isLoggedIn: !!token
    }}>
        {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => useContext(AuthContext);