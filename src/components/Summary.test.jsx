import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Summary from './Summary';
import { useAppStore } from '../stores/appStore';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
    }),
}));

vi.mock('../stores/appStore');

describe('Summary Component', () => {
    const mockDailyGoals = {
        calories: 2000,
        protein: 150,
        carbs: 250,
        fat: 65
    };

    beforeEach(() => {
        useAppStore.mockReturnValue({ dailyGoals: mockDailyGoals });
    });

    const mockEntries = [
        { calories: 500, protein: 30, carbs: 50, fat: 15 },
        { calories: 300, protein: 20, carbs: 40, fat: 10 }
    ];

    it('renders total calories calculated from entries', () => {
        render(<Summary entries={mockEntries} />);
        // Total calories = 500 + 300 = 800
        // The component renders "800" in a span
        expect(screen.getByText('800')).toBeInTheDocument();
    });

    it('displays the Flame icon via lucide-react', () => {
        const { container } = render(<Summary entries={mockEntries} />);
        // Look for the Flame icon by its class text-orange-500
        const flameIcon = container.querySelector('.text-orange-500');
        expect(flameIcon).toBeInTheDocument();
    });

    it('shows macro progress bars', () => {
        render(<Summary entries={mockEntries} />);
        // Protein total = 50, Goal = 150
        // New structure splits them: <span>50</span><span>/150</span>
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('/150')).toBeInTheDocument();

        // Check label
        expect(screen.getByText('detail.protein (g)')).toBeInTheDocument();
    });
});
