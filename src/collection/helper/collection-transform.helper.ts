/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export function extractBody(request: any): string {
  const body = request.body;
  if (!body) return '';

  switch (body.mode) {
    case 'raw':
      return body.raw || '';
    case 'urlencoded':
      return JSON.stringify(body.urlencoded || []);
    case 'formdata':
      return JSON.stringify(body.formdata || []);
    case 'file':
      return JSON.stringify(body.file || {});
    default:
      return '';
  }
}

export function parseUrlObject(urlObj: any): string {
  if (typeof urlObj === 'string') return urlObj;
  if (urlObj.raw) return urlObj.raw;
  if (Array.isArray(urlObj.path)) {
    const protocol = urlObj.protocol || 'http';
    const host = Array.isArray(urlObj.host) ? urlObj.host.join('.') : '';
    const path = urlObj.path.join('/');
    return `${protocol}://${host}/${path}`;
  }
  return '';
}
