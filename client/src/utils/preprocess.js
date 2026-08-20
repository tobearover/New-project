// 客户端图像预处理：灰度增强 / 对比度 / 简单去噪，提升 OCR 识别率

function toGray(imageData) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  return imageData;
}

function adjustContrast(imageData, factor = 1.6) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = (data[i + c] - 128) * factor + 128;
      data[i + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
  }
  return imageData;
}

function boxDenoise(imageData, size = 1) {
  const { data, width, height } = imageData;
  const src = new Uint8ClampedArray(data);
  const step = size * 2 + 1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, n = 0;
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const idx = (ny * width + nx) * 4;
          r += src[idx];
          g += src[idx + 1];
          b += src[idx + 2];
          n++;
        }
      }
      const idx = (y * width + x) * 4;
      data[idx] = r / n;
      data[idx + 1] = g / n;
      data[idx + 2] = b / n;
    }
  }
  return imageData;
}

// 将图像源（Image 或 Video）绘制到 canvas 并应用可选的预处理
export function renderToCanvas(source, maxSize = 1800, options = {}) {
  const scale = Math.min(1, maxSize / Math.max(source.naturalWidth || source.videoWidth, source.naturalHeight || source.videoHeight));
  const w = Math.round((source.naturalWidth || source.videoWidth) * scale);
  const h = Math.round((source.naturalHeight || source.videoHeight) * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, w, h);

  if (options.grayscale || options.contrast || options.denoise) {
    const imageData = ctx.getImageData(0, 0, w, h);
    if (options.grayscale) toGray(imageData);
    if (options.contrast) adjustContrast(imageData, options.contrastFactor || 1.6);
    if (options.denoise) boxDenoise(imageData, 1);
    ctx.putImageData(imageData, 0, 0);
  }
  return canvas;
}

export function canvasToBlob(canvas, type = 'image/png') {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('图像转换失败'))), type, 0.92);
  });
}
