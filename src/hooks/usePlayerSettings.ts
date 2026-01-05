import { useState, useEffect, useCallback } from 'react';

export interface KeyBindings {
  moveLeft: string;
  moveRight: string;
  softDrop: string;
  hardDrop: string;
  rotateCW: string;
  rotateCCW: string;
  hold: string;
  pause: string;
}

export interface PlayerSettings {
  // Delayed Auto Shift - initial delay before auto-repeat starts (ms)
  das: number;
  // Auto Repeat Rate - interval between repeated moves (ms)
  arr: number;
  // DAS Cut Delay - delay when changing directions (ms)
  dcd: number;
  // Soft Drop Factor - multiplier for soft drop speed (higher = faster)
  sdf: number | 'instant';
  // Key bindings
  keyBindings: KeyBindings;
}

const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: ' ',
  rotateCW: 'ArrowUp',
  rotateCCW: 'z',
  hold: 'c',
  pause: 'p',
};

const DEFAULT_SETTINGS: PlayerSettings = {
  das: 133,
  arr: 10,
  dcd: 0,
  sdf: 20,
  keyBindings: DEFAULT_KEY_BINDINGS,
};

const STORAGE_KEY = 'tetris-player-settings';

export const usePlayerSettings = () => {
  const [settings, setSettings] = useState<PlayerSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed, keyBindings: { ...DEFAULT_KEY_BINDINGS, ...parsed.keyBindings } };
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof PlayerSettings>(key: K, value: PlayerSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateKeyBinding = useCallback((action: keyof KeyBindings, key: string) => {
    setSettings(prev => ({
      ...prev,
      keyBindings: { ...prev.keyBindings, [action]: key },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const applyPreset = useCallback((preset: 'default' | 'competitive' | 'casual') => {
    switch (preset) {
      case 'competitive':
        setSettings({
          ...settings,
          das: 83,
          arr: 0,
          dcd: 0,
          sdf: 'instant',
        });
        break;
      case 'casual':
        setSettings({
          ...settings,
          das: 170,
          arr: 33,
          dcd: 17,
          sdf: 10,
        });
        break;
      default:
        setSettings({
          ...settings,
          das: DEFAULT_SETTINGS.das,
          arr: DEFAULT_SETTINGS.arr,
          dcd: DEFAULT_SETTINGS.dcd,
          sdf: DEFAULT_SETTINGS.sdf,
        });
    }
  }, [settings]);

  return {
    settings,
    updateSetting,
    updateKeyBinding,
    resetToDefaults,
    applyPreset,
  };
};
