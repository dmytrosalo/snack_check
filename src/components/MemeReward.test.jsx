import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MemeReward from './MemeReward';

// Mock app store if needed (MemeReward might import it but does it use it?)
// Checking MemeReward.jsx... it imports useAppStore but unused?
// Actually line 2: import { useAppStore } from '../stores/appStore';
// But checking the content I wrote in Step 420:
/*
export default function MemeReward({ meme, onClose }) {
  if (!meme) return null;
  ...
}
*/
// It doesn't seem to use the store in the body of the function.
// But to be safe, I'll mock it.

vi.mock('../stores/appStore', () => ({
    useAppStore: () => ({}),
}));

describe('MemeReward', () => {
    const mockMeme = {
        url: 'https://example.com/meme.jpg',
        title: 'Funny Meme',
    };

    it('renders nothing if no meme provided', () => {
        const { container } = render(<MemeReward meme={null} onClose={() => { }} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders meme image and title', () => {
        render(<MemeReward meme={mockMeme} onClose={() => { }} />);

        expect(screen.getByText('Meal Logged!')).toBeInTheDocument();
        expect(screen.getByAltText('Funny Meme')).toBeInTheDocument();
        expect(screen.getByText('Funny Meme')).toBeInTheDocument();
    });

    it('calls onClose when button is clicked', () => {
        const handleClose = vi.fn();
        render(<MemeReward meme={mockMeme} onClose={handleClose} />);

        const button = screen.getByText('Awesome!');
        fireEvent.click(button);

        expect(handleClose).toHaveBeenCalled();
    });
});
