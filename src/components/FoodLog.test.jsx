import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FoodLog from './FoodLog';

// Mock dependencies
vi.mock('../lib/db', () => ({
    deleteFoodEntry: vi.fn(),
}));

vi.mock('../stores/appStore', () => ({
    useAppStore: () => ({ setError: vi.fn() }),
}));

describe('FoodLog', () => {
    it('renders "No food logged yet" when entries are empty', () => {
        render(<FoodLog entries={[]} />);
        expect(screen.getByText(/No food logged yet/i)).toBeInTheDocument();
    });

    it('renders a list of food items', () => {
        const entries = [
            { id: 1, name: 'Apple', calories: 95, protein: 0, carbs: 25, fat: 0, timestamp: Date.now() },
            { id: 2, name: 'Banana', calories: 105, protein: 1, carbs: 27, fat: 0, timestamp: Date.now() },
        ];
        render(<FoodLog entries={entries} />);
        expect(screen.getByText('Apple')).toBeInTheDocument();
        expect(screen.getByText('Banana')).toBeInTheDocument();
        expect(screen.getByText('95')).toBeInTheDocument(); // calories
    });

    it('calls onItemClick when an item is clicked', () => {
        const entries = [
            { id: 1, name: 'Apple', calories: 95, timestamp: Date.now() }
        ];
        const handleClick = vi.fn();
        render(<FoodLog entries={entries} onItemClick={handleClick} />);

        fireEvent.click(screen.getByText('Apple').closest('div')); // Click row/card
        // Note: The structure might be nested, ensuring we click the handled element
        // Actually our implementation attaches onClick to the outer div of the map

        expect(handleClick).toHaveBeenCalledWith(entries[0]);
    });
});
