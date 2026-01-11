
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-100 selection:text-indigo-700">
            {children}
        </div>
    );
};

export default Layout;
