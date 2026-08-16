import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminApi } from '@/lib/api';

interface SettingsState {
  settingsMap: Record<string, unknown>;
  loadedKeys: Set<string>;
  
  loadSetting: (key: string) => Promise<unknown>;
  updateSettingCache: (key: string, value: unknown) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useSettingsStore = create<SettingsState>()(
  isDev
    ? devtools(
        (set, get) => ({
          settingsMap: {},
          loadedKeys: new Set(),

          loadSetting: async (key) => {
            if (get().loadedKeys.has(key)) return get().settingsMap[key];
            try {
              const s = await adminApi.getSetting(key);
              set((prev) => ({
                settingsMap: { ...prev.settingsMap, [key]: s.value },
                loadedKeys: new Set([...prev.loadedKeys, key])
              }), false, 'settings/load/success');
              return s.value;
            } catch {
              // 404 = not set yet
              set((prev) => ({
                loadedKeys: new Set([...prev.loadedKeys, key])
              }), false, 'settings/load/not-found');
              return undefined;
            }
          },

          updateSettingCache: (key, value) => {
            set((prev) => ({
              settingsMap: { ...prev.settingsMap, [key]: value },
              loadedKeys: new Set([...prev.loadedKeys, key])
            }), false, 'settings/updateCache');
          }
        }),
        { name: 'SettingsStore' }
      )
    : (set, get) => ({
        settingsMap: {},
        loadedKeys: new Set(),

        loadSetting: async (key) => {
          if (get().loadedKeys.has(key)) return get().settingsMap[key];
          try {
            const s = await adminApi.getSetting(key);
            set((prev) => ({
              settingsMap: { ...prev.settingsMap, [key]: s.value },
              loadedKeys: new Set([...prev.loadedKeys, key])
            }));
            return s.value;
          } catch {
            set((prev) => ({
              loadedKeys: new Set([...prev.loadedKeys, key])
            }));
            return undefined;
          }
        },

        updateSettingCache: (key, value) => {
          set((prev) => ({
            settingsMap: { ...prev.settingsMap, [key]: value },
            loadedKeys: new Set([...prev.loadedKeys, key])
          }));
        }
      })
);
