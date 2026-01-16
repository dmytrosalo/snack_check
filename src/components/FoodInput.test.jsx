import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodInput from './FoodInput';
import * as gemini from '../lib/gemini';
import * as db from '../lib/db';

// Mock dependencies
vi.mock('../lib/db', () => ({
    addFoodEntry: vi.fn(),
}));

vi.mock('../lib/gemini', () => ({
    analyzeFoodFromText: vi.fn(),
    analyzeFoodFromImage: vi.fn(),
}));

vi.mock('../stores/appStore', () => ({
    useAppStore: () => ({
        apiKey: 'test-key',
        setError: vi.fn(),
        setShowSettings: vi.fn(),
        requestCount: 0,
        incrementRequestCount: vi.fn(),
        language: 'ua', // Add language
    }),
}));

// Mock resizeImage since it's used in handleImageSelect
vi.mock('../lib/imageUtils', () => ({
    resizeImage: vi.fn().mockResolvedValue('data:image/jpeg;base64,resized'),
}));

describe('FoodInput', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders input and buttons', () => {
        render(<FoodInput onShowCamera={() => { }} />);

        expect(screen.getByPlaceholderText('input.placeholder')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'input.camera' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'input.send' })).toBeInTheDocument();
    });

    it('handles image selection and analysis', async () => {
        const mockFile = new File(['dummy'], 'food.jpg', { type: 'image/jpeg' });
        const onSuccess = vi.fn();

        gemini.analyzeFoodFromImage.mockResolvedValue({
            name: 'Burger',
            calories: 500,
            protein: 20,
            carbs: 40,
            fat: 25,
            portion: '1 burger',
            confidence: 'high'
        });

        render(<FoodInput onShowCamera={() => { }} onSuccess={onSuccess} />);

        // Simulate file selection - search by new label key
        // Use getByRole for better accessibility matching
        const inputButton = screen.getByRole('button', { name: /input\.uploadImage/i });
        const fileInput = inputButton.parentElement.querySelector('input[type="file"]');

        // Mock resizeImage resolution
        await fireEvent.change(fileInput, { target: { files: [mockFile] } });

        // Should see preview
        await waitFor(() => {
            expect(screen.getByAltText('Food preview')).toBeInTheDocument();
        });

        // Click Analyze
        const sendButton = screen.getByRole('button', { name: /input\.send/i });
        fireEvent.click(sendButton);

        // Should analyze (mocked gemini calls) - wait for result
        await waitFor(() => {
            expect(screen.getByText('Burger')).toBeInTheDocument();
        });

        // Click Add - use findAllByRole as there are two buttons (card + action bar)
        const addButtons = await screen.findAllByRole('button', { name: /input\.add/i });
        fireEvent.click(addButtons[0]);

        await waitFor(() => {
            expect(db.addFoodEntry).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalled();
        });
    });

    it('handles text input and analysis success', async () => {
        const mockSuccess = vi.fn();
        const mockAnalysisResult = {
            name: 'Apple',
            calories: 95,
            protein: 0,
            carbs: 25,
            fat: 0,
            portion: '1 medium',
            confidence: 'high'
        };

        gemini.analyzeFoodFromText.mockResolvedValue(mockAnalysisResult);
        db.addFoodEntry.mockResolvedValue(1); // Return ID

        render(
            <FoodInput
                onShowCamera={() => { }}
                selectedDate="2026-01-01"
                onSuccess={mockSuccess}
            />
        );

        // Type input
        const input = screen.getByPlaceholderText(/input\.placeholder/i);
        fireEvent.change(input, { target: { value: '1 apple' } });

        // Click send (Analyze)
        const sendButton = screen.getByRole('button', { name: /input\.send/i });
        fireEvent.click(sendButton);

        // Should call analyze with language
        expect(gemini.analyzeFoodFromText).toHaveBeenCalledWith('1 apple', 'ua');

        // Wait for analysis result to appear (button changes to Add Entry)
        const addButtons = await screen.findAllByRole('button', { name: /input\.add/i });
        const addButton = addButtons[0]; // Or just click first match

        // Click Add
        fireEvent.click(addButton);

        // Wait for addFoodEntry and onSuccess
        await waitFor(() => {
            expect(db.addFoodEntry).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(mockSuccess).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Apple',
                date: '2026-01-01'
            }));
        });
    });
});
