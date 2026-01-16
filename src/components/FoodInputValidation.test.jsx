import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodInput from './FoodInput';
import { useAppStore } from '../stores/appStore';

// Mock dependencies
vi.mock('../lib/db', () => ({
    addFoodEntry: vi.fn(),
}));

vi.mock('../lib/gemini', () => ({
    analyzeFoodFromText: vi.fn(),
    analyzeFoodFromImage: vi.fn(),
    isGeminiInitialized: () => true
}));

// Mock app store
const mockSetError = vi.fn();
vi.mock('../stores/appStore', () => ({
    useAppStore: () => ({
        apiKey: 'test-key',
        setError: mockSetError,
        setShowSettings: vi.fn(),
        requestCount: 0,
        incrementRequestCount: vi.fn(),
        language: 'ua',
    }),
}));

vi.mock('../lib/imageUtils', () => ({
    resizeImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,resized'),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

describe('FoodInput Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects non-image files', async () => {
        render(<FoodInput onShowCamera={() => { }} />);

        const mockFile = new File(['dummy'], 'test.txt', { type: 'text/plain' });

        // Find input by searching for button with aria-label then getting input
        const inputButton = screen.getByRole('button', { name: 'input.uploadImage' });
        const fileInput = inputButton.parentElement.querySelector('input[type="file"]');

        await fireEvent.change(fileInput, { target: { files: [mockFile] } });

        expect(mockSetError).toHaveBeenCalledWith('errors.invalidFileType');
    });

    it('rejects large files (>10MB)', async () => {
        render(<FoodInput onShowCamera={() => { }} />);

        // Create a large file (mock size)
        const mockFile = {
            name: 'large.jpg',
            type: 'image/jpeg',
            size: 11 * 1024 * 1024 // 11MB
        };

        const inputButton = screen.getByRole('button', { name: 'input.uploadImage' });
        const fileInput = inputButton.parentElement.querySelector('input[type="file"]');

        // We can't actually pass a huge buffer in jsdom efficiently,
        // but we can pass an object that looks like a File if the code only checks .size
        // However, fireEvent expects a FileList with File objects.
        // We can mock the File object property.

        const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' });
        Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

        await fireEvent.change(fileInput, { target: { files: [largeFile] } });

        expect(mockSetError).toHaveBeenCalledWith('errors.fileTooLarge');
    });
});
