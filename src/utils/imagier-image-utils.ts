/**
 * Convert an SVG data URL to a PNG data URL via canvas.
 * Returns null on failure.
 */
function convertSvgToPng(svgDataUrl: string, size: number = 400): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => resolve(null);
    img.src = svgDataUrl;
  });
}

/**
 * Fetch an image URL and return a base64 data URI that react-pdf can render.
 * Handles SVG → PNG conversion automatically.
 */
export async function loadImageAsBase64ForImagier(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;

    const blob = await res.blob();
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // SVG → PNG conversion (react-pdf can't render SVG)
    if (blob.type === 'image/svg+xml' || url.endsWith('.svg')) {
      return await convertSvgToPng(dataUri);
    }

    return dataUri;
  } catch {
    return null;
  }
}
