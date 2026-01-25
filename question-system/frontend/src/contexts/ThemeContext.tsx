import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { Theme, lightTheme, darkTheme } from '../styles/theme';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeObject: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. localStorage から保存されたテーマを取得
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme as 'light' | 'dark';
    }
    // 2. OS の設定を検知
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    // 3. デフォルトはライトテーマ
    return 'light';
  });

  useEffect(() => {
    // テーマが変更されたら localStorage に保存
    localStorage.setItem('theme', theme);
    // body のクラスを更新して、CSSセレクタからもテーマを参照できるようにする（オプション）
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeObject = useMemo(() => (theme === 'light' ? lightTheme : darkTheme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeObject, toggleTheme }}>
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
