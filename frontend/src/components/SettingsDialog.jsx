import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, Code2, Palette, Save, Keyboard, Database,
  Type, Layout, Zap, Shield, RefreshCw, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

// Setting row component
function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <Label className="text-sm">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// Settings content component
function SettingsContent({ settings, updateSetting, resetSettings }) {
  const [activeTab, setActiveTab] = useState('editor');
  
  const tabs = [
    { id: 'editor', label: 'Editor', icon: Code2 },
    { id: 'appearance', label: 'Look', icon: Palette },
    { id: 'snippets', label: 'Snippets', icon: Database },
    { id: 'autosave', label: 'Save', icon: Save },
    { id: 'advanced', label: 'More', icon: Zap },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto flex-shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              activeTab === tab.id 
                ? "border-primary text-foreground" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content - scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Editor Settings */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Typography
              </h3>
              
              <div className="space-y-1">
                <SettingRow label="Font Size" description="Editor font size (px)">
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[settings.editor.fontSize]}
                      onValueChange={([v]) => updateSetting('editor', 'fontSize', v)}
                      min={10}
                      max={24}
                      step={1}
                      className="w-20"
                    />
                    <span className="text-sm w-6 text-right font-mono">{settings.editor.fontSize}</span>
                  </div>
                </SettingRow>

                <SettingRow label="Line Height" description="Space between lines">
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[settings.editor.lineHeight * 10]}
                      onValueChange={([v]) => updateSetting('editor', 'lineHeight', v / 10)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-20"
                    />
                    <span className="text-sm w-6 text-right font-mono">{settings.editor.lineHeight}</span>
                  </div>
                </SettingRow>

                <SettingRow label="Font Family">
                  <Select 
                    value={settings.editor.fontFamily}
                    onValueChange={(v) => updateSetting('editor', 'fontFamily', v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                      <SelectItem value="Fira Code">Fira Code</SelectItem>
                      <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                      <SelectItem value="Monaco">Monaco</SelectItem>
                      <SelectItem value="Consolas">Consolas</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Behavior
              </h3>
              
              <div className="space-y-1">
                <SettingRow label="Tab Size" description="Spaces per tab">
                  <Select 
                    value={String(settings.editor.tabSize)}
                    onValueChange={(v) => updateSetting('editor', 'tabSize', parseInt(v))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </SettingRow>

                <SettingRow label="Line Numbers" description="Show line numbers">
                  <Switch
                    checked={settings.editor.lineNumbers}
                    onCheckedChange={(v) => updateSetting('editor', 'lineNumbers', v)}
                  />
                </SettingRow>

                <SettingRow label="Word Wrap" description="Wrap long lines">
                  <Switch
                    checked={settings.editor.wordWrap}
                    onCheckedChange={(v) => updateSetting('editor', 'wordWrap', v)}
                  />
                </SettingRow>

                <SettingRow label="Bracket Matching" description="Highlight matching brackets">
                  <Switch
                    checked={settings.editor.bracketMatching}
                    onCheckedChange={(v) => updateSetting('editor', 'bracketMatching', v)}
                  />
                </SettingRow>

                <SettingRow label="Auto Close Brackets" description="Auto close brackets/quotes">
                  <Switch
                    checked={settings.editor.autoCloseBrackets}
                    onCheckedChange={(v) => updateSetting('editor', 'autoCloseBrackets', v)}
                  />
                </SettingRow>

                <SettingRow label="Highlight Active Line" description="Highlight current line">
                  <Switch
                    checked={settings.editor.highlightActiveLine}
                    onCheckedChange={(v) => updateSetting('editor', 'highlightActiveLine', v)}
                  />
                </SettingRow>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-1">
            <SettingRow label="Theme" description="Application color theme">
              <Select 
                value={settings.appearance.theme}
                onValueChange={(v) => updateSetting('appearance', 'theme', v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Accent Color" description="Primary accent color">
              <Select 
                value={settings.appearance.accentColor}
                onValueChange={(v) => updateSetting('appearance', 'accentColor', v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teal">Teal</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="orange">Orange</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Sidebar Position" description="Sidebar placement">
              <Select 
                value={settings.appearance.sidebarPosition}
                onValueChange={(v) => updateSetting('appearance', 'sidebarPosition', v)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Compact Mode" description="Reduce UI spacing">
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={(v) => updateSetting('appearance', 'compactMode', v)}
              />
            </SettingRow>

            <SettingRow label="Code Preview" description="Show code preview in list">
              <Switch
                checked={settings.appearance.showCodePreview}
                onCheckedChange={(v) => updateSetting('appearance', 'showCodePreview', v)}
              />
            </SettingRow>

            <SettingRow label="Animations" description="Enable UI animations">
              <Switch
                checked={settings.appearance.animationsEnabled}
                onCheckedChange={(v) => updateSetting('appearance', 'animationsEnabled', v)}
              />
            </SettingRow>
          </div>
        )}

        {/* Snippets Settings */}
        {activeTab === 'snippets' && (
          <div className="space-y-1">
            <SettingRow label="Default Language" description="For new snippets">
              <Select 
                value={settings.snippets.defaultLanguage}
                onValueChange={(v) => updateSetting('snippets', 'defaultLanguage', v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="go">Go</SelectItem>
                  <SelectItem value="rust">Rust</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                  <SelectItem value="plaintext">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Auto-Detect Language" description="Detect from code content">
              <Switch
                checked={settings.snippets.autoDetectLanguage}
                onCheckedChange={(v) => updateSetting('snippets', 'autoDetectLanguage', v)}
              />
            </SettingRow>

            <SettingRow label="Confirm Delete" description="Show confirmation dialog">
              <Switch
                checked={settings.snippets.confirmDelete}
                onCheckedChange={(v) => updateSetting('snippets', 'confirmDelete', v)}
              />
            </SettingRow>

            <SettingRow label="Sort Order" description="Default snippet sorting">
              <Select 
                value={settings.snippets.sortOrder}
                onValueChange={(v) => updateSetting('snippets', 'sortOrder', v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <SettingRow label="Group by Language" description="Group snippets in sidebar">
              <Switch
                checked={settings.snippets.groupByLanguage}
                onCheckedChange={(v) => updateSetting('snippets', 'groupByLanguage', v)}
              />
            </SettingRow>
          </div>
        )}

        {/* Auto-Save Settings */}
        {activeTab === 'autosave' && (
          <div className="space-y-1">
            <SettingRow label="Auto-Save Enabled" description="Automatically save changes">
              <Switch
                checked={settings.autoSave.enabled}
                onCheckedChange={(v) => updateSetting('autoSave', 'enabled', v)}
              />
            </SettingRow>

            <SettingRow label="Auto-Save Delay" description="Milliseconds before saving">
              <div className="flex items-center gap-2">
                <Slider
                  value={[settings.autoSave.delay]}
                  onValueChange={([v]) => updateSetting('autoSave', 'delay', v)}
                  min={500}
                  max={5000}
                  step={100}
                  className="w-24"
                  disabled={!settings.autoSave.enabled}
                />
                <span className="text-sm w-12 text-right font-mono">{settings.autoSave.delay}</span>
              </div>
            </SettingRow>

            <SettingRow label="Save on Blur" description="Save when leaving editor">
              <Switch
                checked={settings.autoSave.saveOnBlur}
                onCheckedChange={(v) => updateSetting('autoSave', 'saveOnBlur', v)}
              />
            </SettingRow>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard
              </h3>
              
              <div className="space-y-1">
                <SettingRow label="Vim Mode" description="Enable Vim keybindings">
                  <Switch
                    checked={settings.keyboard.vimMode}
                    onCheckedChange={(v) => {
                      updateSetting('keyboard', 'vimMode', v);
                      if (v) updateSetting('keyboard', 'emacsMode', false);
                    }}
                  />
                </SettingRow>

                <SettingRow label="Emacs Mode" description="Enable Emacs keybindings">
                  <Switch
                    checked={settings.keyboard.emacsMode}
                    onCheckedChange={(v) => {
                      updateSetting('keyboard', 'emacsMode', v);
                      if (v) updateSetting('keyboard', 'vimMode', false);
                    }}
                  />
                </SettingRow>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </h3>
              
              <div className="space-y-1">
                <SettingRow label="Share by Default" description="New snippets are shareable">
                  <Switch
                    checked={settings.privacy.shareByDefault}
                    onCheckedChange={(v) => updateSetting('privacy', 'shareByDefault', v)}
                  />
                </SettingRow>

                <SettingRow label="Include Timestamps" description="Include in exports">
                  <Switch
                    checked={settings.privacy.includeTimestamps}
                    onCheckedChange={(v) => updateSetting('privacy', 'includeTimestamps', v)}
                  />
                </SettingRow>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset
              </h3>
              
              <Button variant="outline" onClick={resetSettings} size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset All Settings
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Restore all settings to default values
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsDialog({ open, onOpenChange }) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Use Sheet (slide from right)
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
          <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0 pr-12">
            <SheetTitle className="flex items-center gap-2 text-base text-left">
              <Settings className="h-4 w-4 text-primary" />
              Settings
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <SettingsContent
              settings={settings}
              updateSetting={updateSetting}
              resetSettings={resetSettings}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[500px] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <SettingsContent
            settings={settings}
            updateSetting={updateSetting}
            resetSettings={resetSettings}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
