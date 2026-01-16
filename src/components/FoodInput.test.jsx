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

    it('renders input field and button', () => {
        render(<FoodInput onShowCamera={() => { }} selectedDate="2026-01-01" />);
        expect(screen.getByPlaceholderText(/describe your food/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /camera/i })).toBeInTheDocument();
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
        const input = screen.getByPlaceholderText(/describe your food/i);
        fireEvent.change(input, { target: { value: '1 apple' } });

        // Click send (Analyze)
        const sendButton = screen.getByRole('button', { name: /send/i });
        fireEvent.click(sendButton);

        // Should call analyze
        expect(gemini.analyzeFoodFromText).toHaveBeenCalledWith('1 apple');

        // Wait for analysis result to appear (button changes to Add Entry)
        const addButton = await screen.findByRole('button', { name: /add entry/i });

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
