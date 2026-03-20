/**
 * Image Optimizer Module
 * Auto-optimizes images on upload to R2
 * Uses Cloudflare Images API or basic optimization
 */

export interface ImageOptimizerConfig {
  bucket: R2Bucket;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  enableWebP?: boolean;
  enableAVIF?: boolean;
}

export class ImageOptimizer {
  private bucket: R2Bucket;
  private maxWidth: number;
  private maxHeight: number;
  private quality: number;
  private enableWebP: boolean;
  private enableAVIF: boolean;

  constructor(config: ImageOptimizerConfig) {
    this.bucket = config.bucket;
    this.maxWidth = config.maxWidth || 2048;
    this.maxHeight = config.maxHeight || 2048;
    this.quality = config.quality || 85;
    // Disabled by default - requires actual image conversion implementation
    // or Cloudflare Images subscription
    this.enableWebP = config.enableWebP ?? false;
    this.enableAVIF = config.enableAVIF ?? false;
  }

  /**
   * Check if file is an image
   */
  isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  /**
   * Optimize image using Cloudflare Image Resizing
   * Requires Cloudflare Images subscription
   */
  async optimizeWithCloudflare(
    imageUrl: string,
    options: { width?: number; height?: number; quality?: number; format?: string }
  ): Promise<Response> {
    const params = new URLSearchParams();

    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.quality) params.set('quality', options.quality.toString());
    if (options.format) params.set('format', options.format);
    params.set('fit', 'scale-down');

    const cfImageUrl = `/cdn-cgi/image/${params.toString()}/${imageUrl}`;
    return fetch(cfImageUrl);
  }

  /**
   * Get image metadata
   */
  async getImageInfo(blob: Blob): Promise<{ width: number; height: number; type: string } | null> {
    try {
      // Note: Workers don't have native image decoding, so this is a placeholder
      // In production, you'd use Cloudflare Images API or an external service
      return {
        width: 0,
        height: 0,
        type: blob.type,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create optimized variants of an image
   */
  async createVariants(
    key: string,
    originalBlob: Blob
  ): Promise<{ original: string; variants: string[] }> {
    const variants: string[] = [];
    const baseKey = key.replace(/\.[^.]+$/, '');
    const ext = key.split('.').pop();

    // Save original
    await this.bucket.put(key, originalBlob, {
      httpMetadata: {
        contentType: originalBlob.type,
      },
      customMetadata: {
        variant: 'original',
        optimized: 'false',
      },
    });

    // Create WebP variant if enabled
    if (this.enableWebP && originalBlob.type.startsWith('image/')) {
      const webpKey = `${baseKey}.webp`;
      variants.push(webpKey);

      // Placeholder: In production, convert to WebP using Cloudflare Images
      // or an external service
    }

    // Create AVIF variant if enabled
    if (this.enableAVIF && originalBlob.type.startsWith('image/')) {
      const avifKey = `${baseKey}.avif`;
      variants.push(avifKey);

      // Placeholder: In production, convert to AVIF
    }

    return {
      original: key,
      variants,
    };
  }

  /**
   * Serve optimized image based on Accept header
   * NOTE: Currently serves original image only. Enable WebP/AVIF conversion
   * by implementing createVariants() or using Cloudflare Images API
   */
  async serveOptimized(request: Request, key: string): Promise<Response> {
    const accept = request.headers.get('accept') || '';
    const baseKey = key.replace(/\.[^.]+$/, '');

    // Try to serve AVIF if supported
    if (this.enableAVIF && accept.includes('image/avif')) {
      const avifKey = `${baseKey}.avif`;
      const avif = await this.bucket.get(avifKey);
      if (avif) {
        return new Response(avif.body, {
          headers: {
            'Content-Type': 'image/avif',
            'Cache-Control': 'public, max-age=31536000',
            'Vary': 'Accept',
          },
        });
      }
    }

    // Try to serve WebP if supported
    if (this.enableWebP && accept.includes('image/webp')) {
      const webpKey = `${baseKey}.webp`;
      const webp = await this.bucket.get(webpKey);
      if (webp) {
        return new Response(webp.body, {
          headers: {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000',
            'Vary': 'Accept',
          },
        });
      }
    }

    // Serve original
    const original = await this.bucket.get(key);
    if (!original) {
      return new Response('Image not found', { status: 404 });
    }

    return new Response(original.body, {
      headers: {
        'Content-Type': original.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  }
}
