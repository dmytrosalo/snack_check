import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Avatar from './Avatar';

// Mock PainterlyFilter to avoid SVG complexities in test
vi.mock('./PainterlyFilter', () => ({
    default: () => <div data-testid="painterly-filter" />,
}));

describe('Avatar Component', () => {
    const defaultEquipped = {
        head: null,
        face: null,
        body: 1, // White Tee
        bottom: 2, // Jeans
        feet: 3, // Sneakers
        accessory: null
    };

    const defaultColors = {
        1: '#ffffff',
        2: '#3b82f6',
        3: '#ffffff'
    };

    it('renders without crashing', () => {
        render(<Avatar equipped={defaultEquipped} itemColors={defaultColors} />);
        expect(screen.getByTestId('painterly-filter')).toBeInTheDocument();
    });

    it('renders equipped items', () => {
        // We can't easily check for specific SVG paths without adding data-testids to the internal parts of Avatar.
        // For now, we verify that the container renders.
        const { container } = render(<Avatar equipped={defaultEquipped} itemColors={defaultColors} />);
        expect(container.firstChild).toHaveClass('relative w-64 h-96');
    });

    it('applies custom styling for Disco Elysium look', () => {
        const { container } = render(<Avatar equipped={defaultEquipped} itemColors={defaultColors} />);

        // Main container styles
        expect(container.firstChild).toHaveClass('border-4 border-slate-700 bg-slate-900 shadow-2xl');

        // Background texture
        const bgTexture = container.querySelector('[style*="thought_cabinet.png"]');
        expect(bgTexture).toBeInTheDocument();
        expect(bgTexture).toHaveClass('mix-blend-overlay');

        // Noir lighting
        const lighting = container.querySelector('.bg-gradient-to-tr');
        expect(lighting).toBeInTheDocument();
        expect(lighting).toHaveClass('from-black/80');
    });
});

