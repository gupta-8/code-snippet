import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, Download, Upload, Settings, Keyboard,
  Code2, Menu, LogOut, User, LogIn
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function Header({
  onNewSnippet,
  onExport,
  onImport,
  onShowShortcuts,
  onShowSettings,
  onLogout,
  onLogin,
  onMenuToggle,
  showMenuButton,
  username,
  isAuthenticated,
  snippetCount,
}) {
  return (
    <header className="flex items-center justify-between h-12 px-3 sm:px-4 border-b border-border bg-card">
      {/* Left side - Menu and Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu button */}
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onMenuToggle}
            data-testid="mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded bg-primary/10 border border-primary/20">
            <Code2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold text-base hidden sm:inline">Code Snippet Manager</span>
          <span className="font-semibold text-sm sm:hidden">Snippets</span>
        </div>
      </div>
      
      {/* Center stats (desktop only) */}
      {isAuthenticated && (
        <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
          <span>{snippetCount} snippet{snippetCount !== 1 ? 's' : ''}</span>
        </div>
      )}
      
      {/* Right side - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={onNewSnippet}
          className="h-8 px-2 sm:px-3 gap-1.5 bg-primary hover:bg-primary/90"
          data-testid="new-snippet-button"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
        </Button>
        
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="settings-dropdown-button">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onShowSettings} data-testid="settings-menu-item">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onExport} data-testid="export-menu-item">
                <Download className="h-4 w-4 mr-2" />
                Export snippets
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onImport} data-testid="import-menu-item">
                <Upload className="h-4 w-4 mr-2" />
                Import snippets
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onShowShortcuts} data-testid="shortcuts-menu-item">
                <Keyboard className="h-4 w-4 mr-2" />
                Keyboard shortcuts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* User menu / Login button */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 gap-2 px-2" data-testid="user-menu-button">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                  {username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">
                    {snippetCount} snippets
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive" data-testid="logout-menu-item">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogin}
            className="h-8 gap-2 px-2 sm:px-3"
            data-testid="login-button"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export default Header;
