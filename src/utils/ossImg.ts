/**
 * 获取 CDN 图片 URL
 * @param url 图片 URL
 * @returns CDN 图片 URL
 */
export const getCdnUrl = (url: string): string => {
  if (!url) return '';
  
  return `https://cdn.designgpt.art/${url}`;
};
