/**
 * Resize an image to a maximum dimension while maintaining aspect ratio.
 * @param {string} dataUrl - The original image data URL.
 * @param {number} maxDimension - The maximum width or height (default 800px).
 * @param {number} quality - The JPEG quality (0 to 1, default 0.8).
 * @returns {Promise<string>} - The resized image as a data URL.
 */
export const resizeImage = (dataUrl, maxDimension = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round(height * (maxDimension / width));
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round(width * (maxDimension / height));
                    height = maxDimension;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to specified format (JPEG usually best for photos)
            resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.onerror = (err) => {
            reject(new Error('Failed to load image for resizing'));
        };
    });
};
