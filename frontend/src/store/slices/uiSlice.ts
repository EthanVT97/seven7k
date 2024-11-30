import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    activeTab: string;
    notifications: Array<{
        id: string;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>;
    language: string;
}

const initialState: UIState = {
    theme: 'light',
    sidebarOpen: true,
    activeTab: 'messages',
    notifications: [],
    language: 'en',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setActiveTab: (state, action: PayloadAction<string>) => {
            state.activeTab = action.payload;
        },
        addNotification: (state, action: PayloadAction<{
            message: string;
            type: 'success' | 'error' | 'info' | 'warning';
        }>) => {
            const id = Date.now().toString();
            state.notifications.push({
                id,
                ...action.payload,
            });
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            );
        },
        setLanguage: (state, action: PayloadAction<string>) => {
            state.language = action.payload;
        },
    },
});

export const {
    toggleTheme,
    toggleSidebar,
    setActiveTab,
    addNotification,
    removeNotification,
    setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer; 