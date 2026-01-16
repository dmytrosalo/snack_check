import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PainterlyFilter from './PainterlyFilter';

describe('PainterlyFilter Component', () => {
    it('renders without crashing', () => {
        const { container } = render(
            <svg>
                <PainterlyFilter />
            </svg>
        );
        expect(container.querySelector('filter')).toBeInTheDocument();
        expect(container.querySelector('#painterly')).toBeInTheDocument();
    });

    it('contains turbulence and displacement map primitives', () => {
        const { container } = render(
            <svg>
                <PainterlyFilter />
            </svg>
        );
        expect(container.querySelector('feTurbulence')).toBeInTheDocument();
        expect(container.querySelector('feDisplacementMap')).toBeInTheDocument();
    });
});
