import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DashboardState {
  selectedDateRange: string;
  sidebarOpen: boolean;
  setDateRange: (range: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

const isDev = process.env.NODE_ENV !== 'production';

export const useDashboardStore = create<DashboardState>()(
  isDev
    ? devtools(
        (set) => ({
          selectedDateRange: 'today',
          sidebarOpen: false,
          setDateRange: (range) => set({ selectedDateRange: range }, false, 'dashboard/setDateRange'),
          setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'dashboard/setSidebarOpen'),
        }),
        { name: 'DashboardStore' }
      )
    : (set) => ({
        selectedDateRange: 'today',
        sidebarOpen: false,
        setDateRange: (range) => set({ selectedDateRange: range }),
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
      })
);
