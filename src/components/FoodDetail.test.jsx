import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FoodDetail from './FoodDetail';
import { deleteFoodEntry } from '../lib/db';

// Mock dependencies
vi.mock('../lib/db', () => ({
    deleteFoodEntry: vi.fn().mockResolvedValue(true),
}));

vi.mock('../stores/appStore', () => ({
    useAppStore: () => ({ setError: vi.fn() }),
}));

describe('FoodDetail', () => {
    const mockEntry = {
        id: 123,
        name: 'Super Burger',
        calories: 500,
        protein: 30,
        carbs: 45,
        fat: 20,
        portion: '1 large burger',
        timestamp: Date.now(),
        tags: ['High Protein', 'Cheat Meal'],
        healthTip: 'Enjoy the gains, buddy!',
    };

    it('renders food details correctly', () => {
        render(<FoodDetail entry={mockEntry} onClose={() => { }} />);

        expect(screen.getByText('Super Burger')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument(); // calories
        expect(screen.getByText('30g')).toBeInTheDocument(); // protein
        expect(screen.getByText('1 large burger')).toBeInTheDocument(); // portion

        // New features
        expect(screen.getByText('High Protein')).toBeInTheDocument();
        expect(screen.getByText('Cheat Meal')).toBeInTheDocument();
        expect(screen.getByText(/PlateMate Says/i)).toBeInTheDocument();
        expect(screen.getByText('Enjoy the gains, buddy!')).toBeInTheDocument();
    });

    it('calls onClose when OK button is clicked', () => {
        const handleClose = vi.fn();
        render(<FoodDetail entry={mockEntry} onClose={handleClose} />);

        const okButton = screen.getByRole('button', { name: /ok/i });
        fireEvent.click(okButton);

        expect(handleClose).toHaveBeenCalled();
    });

    it('calls deleteFoodEntry when delete is clicked and confirmed', async () => {
        const handleClose = vi.fn();
        // Mock window.confirm to return true
        const mockConfirm = vi.spyOn(window, 'confirm');
        mockConfirm.mockImplementation(() => true);

        render(<FoodDetail entry={mockEntry} onClose={handleClose} />);

        // Helper to find the Delete button by aria-label since it has no text
        const deleteBtn = screen.getByRole('button', { name: /delete entry/i });
        fireEvent.click(deleteBtn);

        expect(mockConfirm).toHaveBeenCalled();
        expect(deleteFoodEntry).toHaveBeenCalledWith(123);
        // onClose should be called after delete, need to wait for async
        await waitFor(() => expect(handleClose).toHaveBeenCalled());
    });
});
