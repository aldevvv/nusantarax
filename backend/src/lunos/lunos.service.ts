import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LunosClient } from '@lunos/client';

@Injectable()
export class LunosService {
  private readonly logger = new Logger(LunosService.name);
  private client: LunosClient;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('LUNOS_API_KEY');
    if (!apiKey) {
      this.logger.warn('LUNOS_API_KEY is not set');
    }
    this.client = new LunosClient({ apiKey });
  }

  async generateImageBase64(
    prompt: string,
    model: string,
    size: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024',
  ): Promise<string> {
    // Prefer base64 to allow uploading to storage
    const res: any = await this.client.image.generateBase64({
      prompt,
      model,
      size,
      quality: 'hd',
    });

    // Try common shapes
    const b64Candidates: string[] = [];
    const urlCandidates: string[] = [];

    if (res?.data && Array.isArray(res.data)) {
      for (const item of res.data) {
        if (item?.b64_json) b64Candidates.push(item.b64_json);
        if (item?.base64) b64Candidates.push(item.base64);
        if (item?.url) urlCandidates.push(item.url);
      }
    }
    if (res?.images && Array.isArray(res.images)) {
      for (const item of res.images) {
        if (item?.b64_json) b64Candidates.push(item.b64_json);
        if (item?.url) urlCandidates.push(item.url);
      }
    }
    if (res?.b64_json) b64Candidates.push(res.b64_json);
    if (res?.url) urlCandidates.push(res.url);

    const b64 = b64Candidates.find(Boolean);
    if (b64) return b64 as string;

    // Fallback: fetch from URL if provider returned URL despite b64 request
    const url = urlCandidates.find(Boolean);
    if (url) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Fetch failed with ${r.status}`);
        const buf = Buffer.from(await r.arrayBuffer());
        return buf.toString('base64');
      } catch (e) {
        this.logger.error(`Failed to fetch image URL from Lunos: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Log keys to help debugging
    try {
      const keys = res && typeof res === 'object' ? Object.keys(res) : [];
      this.logger.error(`Unexpected image generation response shape from Lunos (keys: ${keys.join(',')})`);
    } catch {}
    throw new Error('Failed to parse image response from Lunos');
  }

  async generateImageBase64WithSize(
    prompt: string,
    model: string,
    width: number,
    height: number,
    options?: { style?: 'vivid' | 'natural'; n?: number; quality?: 'hd' | 'standard' }
  ): Promise<string[]> {
    const body: any = {
      prompt,
      model,
      width,
      height,
      response_format: 'b64_json',
      quality: options?.quality || 'hd',
    };
    if (options?.style) body.style = options.style;
    if (options?.n) body.n = options.n;

    const res: any = await this.client.image.generateImage(body);

    const b64s: string[] = [];
    if (res?.data && Array.isArray(res.data)) {
      for (const item of res.data) {
        if (item?.b64_json) b64s.push(item.b64_json);
        else if (item?.url) {
          try {
            const r = await fetch(item.url);
            if (r.ok) {
              const buf = Buffer.from(await r.arrayBuffer());
              b64s.push(buf.toString('base64'));
            }
          } catch (e) {
            this.logger.warn(`Failed to fetch generated image URL: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      }
    }

    if (b64s.length === 0) {
      const keys = res && typeof res === 'object' ? Object.keys(res) : [];
      this.logger.error(`Unexpected image generation response (size) from Lunos (keys: ${keys.join(',')})`);
      throw new Error('Failed to parse image generation response from Lunos');
    }

    return b64s;
  }
  async createVariationsBase64(
    image: string,
    model: string,
    count = 3,
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024',
  ): Promise<string[]> {
    const img = image.startsWith('data:image/') ? image : image;
    const res: any = await this.client.image.createImageVariation({
      image: img,
      model,
      n: count,
      size,
      response_format: 'b64_json',
    });

    const b64s: string[] = [];
    if (res?.data && Array.isArray(res.data)) {
      for (const item of res.data) {
        if (item?.b64_json) b64s.push(item.b64_json);
        else if (item?.url) {
          try {
            const r = await fetch(item.url);
            if (r.ok) {
              const buf = Buffer.from(await r.arrayBuffer());
              b64s.push(buf.toString('base64'));
            }
          } catch (e) {
            this.logger.warn(`Failed to fetch variation image URL: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
      }
    }

    if (b64s.length === 0) {
      const keys = res && typeof res === 'object' ? Object.keys(res) : [];
      this.logger.error(`Unexpected variation response shape from Lunos (keys: ${keys.join(',')})`);
      throw new Error('Failed to parse variation response from Lunos');
    }

    return b64s;
  }

  async editImageBase64(
    image: string,
    prompt: string,
    model: string,
    size: '256x256' | '512x512' | '1024x1024' = '1024x1024',
  ): Promise<string> {
    const img = image.startsWith('data:image/') ? image : image;
    const res: any = await this.client.image.editImage({
      image: img,
      prompt,
      model,
      size,
      response_format: 'b64_json',
    });

    const b64Candidates: string[] = [];
    const urlCandidates: string[] = [];
    if (res?.data && Array.isArray(res.data)) {
      for (const item of res.data) {
        if (item?.b64_json) b64Candidates.push(item.b64_json);
        if (item?.base64) b64Candidates.push(item.base64);
        if (item?.url) urlCandidates.push(item.url);
      }
    }
    if (res?.b64_json) b64Candidates.push(res.b64_json);
    if (res?.url) urlCandidates.push(res.url);

    const b64 = b64Candidates.find(Boolean);
    if (b64) return b64 as string;

    const url = urlCandidates.find(Boolean);
    if (url) {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Fetch failed with ${r.status}`);
        const buf = Buffer.from(await r.arrayBuffer());
        return buf.toString('base64');
      } catch (e) {
        this.logger.error(`Failed to fetch edited image URL from Lunos: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const keys = res && typeof res === 'object' ? Object.keys(res) : [];
    this.logger.error(`Unexpected edit image response shape from Lunos (keys: ${keys.join(',')})`);
    throw new Error('Failed to parse edit image response from Lunos');
  }
}
