interface YtFormat {
  description: string;
  format: string;
  extension: string;
}

const formats: Record<number, YtFormat> = {
  5: { description: 'LQ FLV', format: 'FLV', extension: 'flv' },
  6: { description: 'LQ FLV', format: 'FLV', extension: 'flv' },
  13: { description: 'LQ 3GP', format: '3GP', extension: '3gp' },
  17: { description: 'LQ 3GP', format: '3GP', extension: '3gp' },
  18: { description: 'LQ MP4', format: 'MP4', extension: 'mp4' },
  22: { description: 'HD 720p MP4', format: 'MP4', extension: 'mp4' },
  34: { description: 'LQ FLV', format: 'FLV', extension: 'flv' },
  35: { description: 'HQ 480p FLV', format: 'FLV', extension: 'flv' },
  36: { description: 'LQ 3GP', format: '3GP', extension: '3gp' },
  37: { description: 'Full HD 1080 MP4', format: 'MP4', extension: 'mp4' },
  38: { description: 'Original MP4', format: 'MP4', extension: 'mp4' },
  43: { description: 'LQ WebM', format: 'WebM', extension: 'webm' },
  44: { description: 'HQ 480p WebM', format: 'WebM', extension: 'webm' },
  45: { description: 'HD 720p WebM', format: 'WebM', extension: 'webm' },
  46: { description: 'Full HD 1080 WebM', format: 'WebM', extension: 'webm' },
  82: { description: 'LQ MP4 (3D)', format: 'MP4', extension: 'mp4' },
  83: { description: 'LQ MP4 (3D)', format: 'MP4', extension: 'mp4' },
  84: { description: 'HD 720p MP4 (3D)', format: 'MP4', extension: 'mp4' },
  85: { description: 'HQ 520p MP4 (3D)', format: 'MP4', extension: 'mp4' },
  100: { description: 'LQ WebM (3D)', format: 'WebM', extension: 'webm' },
  101: { description: 'LQ WebM (3D)', format: 'WebM', extension: 'webm' },
  102: { description: 'HD 720p WebM (3D)', format: 'WebM', extension: 'webm' },
  133: { description: '*LQ 240p MP4', format: 'MP4', extension: 'mp4' },
  134: { description: '*MQ 360p MP4', format: 'MP4', extension: 'mp4' },
  135: { description: '*HQ 480p MP4', format: 'MP4', extension: 'mp4' },
  136: { description: '*HD 720p MP4', format: 'MP4', extension: 'mp4' },
  137: { description: '*Full HD 1080 MP4', format: 'MP4', extension: 'mp4' },
  138: { description: '*ULTRA HD 4K MP4', format: 'MP4', extension: 'mp4' },
  140: { description: '*AUDIO MP4', format: 'MP4', extension: 'm4a' },
  160: { description: '*LQ 144p WebM', format: 'WebM', extension: 'webm' },
  171: { description: '*AUDIO OGG', format: 'OGG', extension: 'ogg' },
  242: { description: '*LQ 240p WebM', format: 'WebM', extension: 'webm' },
  243: { description: '*MQ 360p WebM', format: 'WebM', extension: 'webm' },
  244: { description: '*HQ 480p WebM', format: 'WebM', extension: 'webm' },
  247: { description: '*HD 720p WebM', format: 'WebM', extension: 'webm' },
  248: { description: '*Full HD 1080 WebM', format: 'WebM', extension: 'webm' },
  264: { description: '*HD 1440p MP4', format: 'MP4', extension: 'mp4' },
  298: { description: '*HD 720p MP4 (60fps)', format: 'MP4', extension: 'mp4' },
  299: { description: '*Full HD 1080 (60fps)', format: 'MP4', extension: 'mp4' },
};

/**
 * Get the format description from an itag
 */
function getFormatDescription(itag: number) {
  const format = formats[itag]
  if (format) {
    return `${format.description} (${format.format})`;
  }
  return `Unknown (${itag})`;
}

export { formats, getFormatDescription };
