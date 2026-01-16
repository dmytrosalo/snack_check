import { describe, it, expect, vi } from 'vitest';
import { resizeImage } from './imageUtils';

describe('imageUtils', () => {
    describe('resizeImage', () => {
        it('should resolve with data URL', async () => {
            // Mock Image and Canvas
            global.Image = class {
                constructor() {
                    this.onload = null;
                    this.onerror = null;
                    // Simulate loading immediately used in real code
                    setTimeout(() => {
                        this.width = 1000;
                        this.height = 1000;
                        if (this.onload) this.onload();
                    }, 0);
                }
            };

            // Mock canvas
            const mockContext = {
                drawImage: vi.fn(),
            };

            const mockCanvas = {
                width: 0,
                height: 0,
                getContext: vi.fn(() => mockContext),
                toDataURL: vi.fn(() => 'data:image/jpeg;base64,resized'),
            };

            vi.spyOn(document, 'createElement').mockImplementation((tag) => {
                if (tag === 'canvas') return mockCanvas;
                return document.createElement(tag); // fallback
            });

            const result = await resizeImage('data:image/png;base64,original');
            expect(result).toBe('data:image/jpeg;base64,resized');
            expect(mockContext.drawImage).toHaveBeenCalled();
            expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
        });
    });
});
