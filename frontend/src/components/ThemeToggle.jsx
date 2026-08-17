import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} title={theme === 'light' ? 'Switch to dark' : 'Switch to light'}>
      {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
    </button>
  );
}