// context/ThemeContext.js
// Controls light and dark mode for entire app

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
    // Check if user had a preference saved
        return localStorage.getItem('theme') === 'dark';
    });
    useEffect(() => {
    // Apply dark class to body
        if (isDark) {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);
    const toggleTheme = () => setIsDark(!isDark);
    return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        {children}
    </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);