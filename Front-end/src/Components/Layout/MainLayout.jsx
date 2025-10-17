import React from 'react';
import ThemeToggle from '../Context/ThemeToggle.jsx'; 

function MainLayout({ children }) {
  return (
    <div className="min-h-screen relative transition-colors duration-500 
                bg-gray-50 text-gray-900 
                dark:bg-gray-800 dark:text-gray-100">
      
     
      <div className="absolute top-4 right-4 z-20"> 
        <ThemeToggle />
      </div>

    
      <main className=""> 
        {children}
      </main>

    </div>
  );
}

export default MainLayout;



