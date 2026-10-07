import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import { del, get, list, put } from '@vercel/blob';

const LIMIT = 2 * 1024 * 1024;
const CHANNELS = new Set(['desktop', 'web']);

export function digest(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function channelOf(request) {
  const url = new URL(request.url, 'https://nca.invalid');
  const channel = url.searchParams.get('channel') || 'desktop';
  if (!CHANNELS.has(channel)) throw Object.assign(new Error('同步通道无效。'), { statusCode:400 });
  return channel;
}

export function authorized(header, expectedHash = process.env.NCA_SYNC_TOKEN_SHA256) {
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!expectedHash || !/^[a-f0-9]{64}$/i.test(expectedHash) || token.length < 20) return false;
  const actual = Buffer.from(digest(token), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function common(response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, If-Match');
  response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  response.setHeader('Access-Control-Expose-Headers', 'ETag');
}

async function versions(channel) {
  const result = await list({ prefix:`nca-study-hub/${channel}/`, limit:100, mode:'expanded' });
  return [...result.blobs].sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

async function latest(channel) {
  const [blob] = await versions(channel);
  if (!blob) return null;
  const result = await get(blob.pathname, { access:'private' });
  if (!result || result.statusCode !== 200) return null;
  const text = await new Response(result.stream).text();
  return { text, etag:`\"${digest(text)}\"`, blob };
}

export default async function handler(request, response) {
  common(response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (!authorized(request.headers.authorization)) return response.status(401).json({ message:'云端同步身份校验失败。' });
  try {
    const channel = channelOf(request);
    if (request.method === 'GET') {
      const record = await latest(channel);
      if (!record) return response.status(404).json({ message:'云端尚无此设备通道的备份。' });
      response.setHeader('ETag', record.etag);
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      return response.status(200).send(record.text);
    }
    if (request.method !== 'PUT') return response.status(405).json({ message:'不支持此请求方法。' });
    const text = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    if (Buffer.byteLength(text, 'utf8') > LIMIT) return response.status(413).json({ message:'云端备份超过 2 MiB 限制。' });
    let envelope;
    try { envelope = JSON.parse(text); } catch { return response.status(400).json({ message:'云端备份不是有效 JSON。' }); }
    if (envelope?.format !== 'nca-study-hub-encrypted-backup' || envelope.version !== 1 || typeof envelope.ciphertext !== 'string') {
      return response.status(400).json({ message:'云端备份封装格式无效。' });
    }
    const current = await latest(channel);
    const condition = request.headers['if-match'];
    if (condition && (!current || condition !== current.etag)) return response.status(409).json({ message:'云端已有更新版本，请先下载并确认后再上传。' });
    const savedAt = new Date().toISOString();
    await put(`nca-study-hub/${channel}/${Date.now()}-${randomUUID()}.json`, text, { access:'private', contentType:'application/json', addRandomSuffix:false });
    const all = await versions(channel);
    if (all.length > 10) await del(all.slice(10).map(item => item.url));
    const etag = `\"${digest(text)}\"`;
    response.setHeader('ETag', etag);
    return response.status(200).json({ ok:true, savedAt, etag, retained:Math.min(all.length, 10) });
  } catch (error) {
    console.error('NCA 云端备份错误', error);
    return response.status(error.statusCode || 500).json({ message:error.statusCode ? error.message : '云端备份服务暂时不可用。' });
  }
}
