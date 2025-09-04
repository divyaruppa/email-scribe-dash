import { RefreshCw, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-foreground">
            AI Email Management Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligent email processing with sentiment analysis and priority management
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-smooth"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-smooth"
          >
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4" />
                Light
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                Dark
              </>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}