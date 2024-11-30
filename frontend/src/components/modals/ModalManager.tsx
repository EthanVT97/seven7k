import React from 'react';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useTheme } from '../../theme/ThemeProvider';
import ContactModal from './ContactModal';
import AnalyticsModal from './AnalyticsModal';
import SettingsModal from './SettingsModal';

// Modal state type
export interface ModalState {
    activeModal: string | null;
}

// Initial state
const initialState: ModalState = {
    activeModal: null
};

// Create the slice
export const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<string>) => {
            state.activeModal = action.payload;
        },
        closeModal: (state) => {
            state.activeModal = null;
        }
    }
});

// Export actions and reducer
export const { openModal, closeModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;

// Modal selector
const selectActiveModal = (state: { modal: ModalState }) => state.modal.activeModal;

const ModalManager: React.FC = () => {
    const activeModal = useAppSelector(selectActiveModal);
    const dispatch = useAppDispatch();
    const { theme } = useTheme();

    const handleClose = () => {
        dispatch(closeModal());
    };

    const modalBaseClass = `
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${theme === 'dark' ? 'bg-gray-900 bg-opacity-75' : 'bg-black bg-opacity-50'}
        transition-opacity duration-300
    `;

    const modalContentClass = `
        relative bg-white dark:bg-gray-800 rounded-lg shadow-xl
        p-6 max-w-md w-full mx-auto
        transform transition-all duration-300
        ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
    `;

    return (
        <>
            <ContactModal
                isOpen={activeModal === 'contact'}
                onClose={handleClose}
                baseClass={modalBaseClass}
                contentClass={modalContentClass}
            />
            <AnalyticsModal
                isOpen={activeModal === 'analytics'}
                onClose={handleClose}
                baseClass={modalBaseClass}
                contentClass={modalContentClass}
            />
            <SettingsModal
                isOpen={activeModal === 'settings'}
                onClose={handleClose}
                baseClass={modalBaseClass}
                contentClass={modalContentClass}
            />
        </>
    );
};

export default ModalManager; 