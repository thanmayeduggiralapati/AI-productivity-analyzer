// components/common/Layout.js
// Main layout wrapper — includes sidebar + page content

import { useTheme } from '../../context/ThemeContext';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const { isDark } = useTheme();
    return (
    <div className={`min-h-screen ${isDark ? 'bg-dark-bg' : 'bg-light-bg'}`}>
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content — offset by sidebar width */}
        <main className="ml-56 min-h-screen">
            <div className="p-6 max-w-7xl mx-auto">
                {children}
            </div>
        </main>
    </div>
);
};

export default Layout;