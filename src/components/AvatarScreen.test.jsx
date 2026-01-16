import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AvatarScreen from './AvatarScreen';
import { useAppStore } from '../stores/appStore';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'avatar.title': 'ВАШ СТИЛЬ',
                'avatar.wardrobe': 'ГАРДЕРОБ',
                'avatar.lvl': 'LVL'
            };
            return translations[key] || key;
        },
    }),
}));

vi.mock('../stores/appStore');
vi.mock('./Avatar', () => ({
    default: () => <div data-testid="mock-avatar" />,
    ITEMS: {
        1: { id: 1, name: 'White Tee', slot: 'body', icon: () => null, color: 'white' },
        2: { id: 2, name: 'Jeans', slot: 'bottom', icon: () => null, color: 'blue' },
    }
}));

describe('AvatarScreen Component', () => {
    const mockEquipItem = vi.fn();
    const mockSetItemColor = vi.fn();
    const mockClose = vi.fn();

    beforeEach(() => {
        useAppStore.mockReturnValue({
            unlockedItems: [1, 2],
            equippedItems: { body: 1, bottom: 2 },
            equipItem: mockEquipItem,
            itemColors: { 1: '#ffffff' },
            setItemColor: mockSetItemColor
        });
        vi.clearAllMocks();
    });

    it('renders correctly with Disco Elysium UI', () => {
        render(<AvatarScreen onClose={mockClose} />);

        // Check for Serif font class indicating DE style
        expect(screen.getByText('ВАШ СТИЛЬ').closest('.font-serif')).toBeInTheDocument();
        expect(screen.getByText('ГАРДЕРОБ')).toBeInTheDocument();
        expect(screen.getByTestId('mock-avatar')).toBeInTheDocument();
    });

    it('allows equipping items', () => {
        render(<AvatarScreen onClose={mockClose} />);

        // items are buttons in the grid. We can find them by their role.
        const buttons = screen.getAllByRole('button');
        // First button is likely close, next are palette (if open), then wardrobe.
        // Since White Tee (id 1) is rendered, let's click it.
        // In the mock, we know there are 2 items.
        // The Close button is first.
        // Then 2 wardrobe items.

        // Click the first wardrobe item (White Tee)
        fireEvent.click(buttons[1]);

        // Should trigger toggle logic. Since it's equipped, it might unequip or select color.
        // The implementation selects color if clicked.
        // Let's verify that equipItem was called or state changed?
        // Wait, the component calls `handleEquip`.
        // If we click it, it calls `equipItem`.
        expect(mockEquipItem).toHaveBeenCalled();
    });

    it('shows pigment selector when an item is selected', () => {
        // Start with nothing equipped so clicking will equip & select
        useAppStore.mockReturnValue({
            unlockedItems: [1, 2],
            equippedItems: {},
            equipItem: mockEquipItem,
            itemColors: { 1: '#ffffff' },
            setItemColor: mockSetItemColor
        });

        render(<AvatarScreen onClose={mockClose} />);
        const wardrobeItem = screen.getAllByRole('button')[1]; // First wardrobe item

        fireEvent.click(wardrobeItem);

        // Now "PIGMENT" selector should be visible
        // Use getAllByText because multiple parent elements might contain the text in their textContent
        // We just need to verify it exists.
        expect(screen.getAllByText(/PIGMENT/i).length).toBeGreaterThan(0);
    });

    it('calls onClose when close button is clicked', () => {
        render(<AvatarScreen onClose={mockClose} />);
        const closeButton = screen.getAllByRole('button')[0];
        fireEvent.click(closeButton);
        expect(mockClose).toHaveBeenCalled();
    });
});
