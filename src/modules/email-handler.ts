/**
 * Email Handler Module
 * Automatically saves email attachments to R2
 * Configure via Cloudflare Email Routing
 */

export interface EmailMessage {
  from: string;
  to: string;
  headers: Headers;
  raw: ReadableStream;
  rawSize: number;
}

export interface EmailAttachment {
  filename: string;
  content: Uint8Array;
  contentType: string;
  size: number;
}

export class EmailHandler {
  private bucket: R2Bucket;
  private saveFolder: string;

  constructor(bucket: R2Bucket, saveFolder: string = 'email-attachments') {
    this.bucket = bucket;
    this.saveFolder = saveFolder;
  }

  /**
   * Parse email and extract attachments
   */
  async parseEmail(message: EmailMessage): Promise<EmailAttachment[]> {
    const attachments: EmailAttachment[] = [];
    const reader = message.raw.getReader();
    const chunks: Uint8Array[] = [];

    // Read the email stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const fullEmail = new TextDecoder().decode(this.concatenate(chunks));

    // Simple MIME parser for attachments
    const boundaryMatch = fullEmail.match(/boundary="?([^"\s;]+)"?/);
    if (!boundaryMatch) return attachments;

    const boundary = boundaryMatch[1];
    const parts = fullEmail.split(`--${boundary}`);

    for (const part of parts) {
      if (part.includes('Content-Disposition: attachment')) {
        const attachment = this.extractAttachment(part);
        if (attachment) attachments.push(attachment);
      }
    }

    return attachments;
  }

  /**
   * Save attachments to R2
   */
  async saveAttachments(
    message: EmailMessage,
    attachments: EmailAttachment[]
  ): Promise<{ saved: string[]; errors: string[] }> {
    const saved: string[] = [];
    const errors: string[] = [];
    const timestamp = new Date().toISOString().split('T')[0];

    for (const attachment of attachments) {
      try {
        const key = `${this.saveFolder}/${timestamp}/${attachment.filename}`;

        await this.bucket.put(key, attachment.content, {
          httpMetadata: {
            contentType: attachment.contentType,
          },
          customMetadata: {
            source: 'email',
            from: message.from,
            to: message.to,
            receivedAt: new Date().toISOString(),
            size: attachment.size.toString(),
          },
        });

        saved.push(key);
      } catch (error) {
        errors.push(`${attachment.filename}: ${error}`);
      }
    }

    return { saved, errors };
  }

  /**
   * Main email handler
   */
  async handleEmail(message: EmailMessage): Promise<Response> {
    try {
      const attachments = await this.parseEmail(message);

      if (attachments.length === 0) {
        return new Response('No attachments found', { status: 200 });
      }

      const result = await this.saveAttachments(message, attachments);

      return new Response(
        JSON.stringify({
          message: 'Attachments processed',
          saved: result.saved,
          errors: result.errors,
          total: attachments.length,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      return new Response(`Error processing email: ${error}`, { status: 500 });
    }
  }

  // Helper methods
  private concatenate(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  private extractAttachment(part: string): EmailAttachment | null {
    const filenameMatch = part.match(/filename="?([^"\r\n]+)"?/);
    if (!filenameMatch) return null;

    const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n;]+)/);
    const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

    // Extract base64 content
    const contentMatch = part.match(/\r?\n\r?\n([\s\S]+?)(?=\r?\n--)/);
    if (!contentMatch) return null;

    const base64Content = contentMatch[1].replace(/\s/g, '');
    const content = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));

    return {
      filename: filenameMatch[1],
      content,
      contentType,
      size: content.length,
    };
  }
}
