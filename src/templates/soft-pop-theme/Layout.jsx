
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#FDFBF7] text-slate-700 font-sans antialiased selection:bg-[#FFD1CF] selection:text-[#E07A5F] overflow-x-hidden">
            {/* Global styles for 'Clay' effect */}
            <style>{`
        .clay-card {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 
            20px 20px 60px #d9d7d4, 
            -20px -20px 60px #ffffff;
        }
        .clay-card-sm {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 
            8px 8px 16px #d9d7d4, 
            -8px -8px 16px #ffffff;
        }
        .clay-btn {
          border-radius: 50px;
          box-shadow: 
            6px 6px 12px rgba(0,0,0,0.1), 
            -6px -6px 12px rgba(255,255,255,0.8);
          transition: all 0.2s ease;
        }
        .clay-btn:active {
          box-shadow: 
            inset 4px 4px 8px rgba(0,0,0,0.1), 
            inset -4px -4px 8px rgba(255,255,255,0.8);
          transform: translateY(2px);
        }
        .font-rounded {
          font-family: 'Fredoka', 'Quicksand', system-ui, sans-serif; 
          /* Assuming user might import these, or fallback to system rounded/sans */
        }
      `}</style>
            {children}
        </div>
    );
};

export default Layout;
