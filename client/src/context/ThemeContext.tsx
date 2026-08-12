import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'professional' | 'genz';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;
    return savedTheme ? savedTheme : 'professional';
  });

  useEffect(() => {
    // Apply theme to document element
    if (theme === 'genz') {
      document.documentElement.setAttribute('data-theme', 'genz');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'professional' ? 'genz' : 'professional'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
