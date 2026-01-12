
import { processImageHD } from './imageProcessor';

export type MediaSource = 'CAMERA' | 'GALLERY';

export interface MediaCaptureResult {
  dataUrl: string;
  file: File;
}

/**
 * Converte arquivos HEIC/HEIF para JPEG se necessário (suporte básico via browser canvas)
 * e lida com compressão de arquivos > 5MB.
 */
export const captureMedia = async (file: File): Promise<string> => {
  // O processImageHD já possui lógica de redimensionamento e compressão.
  // Vamos garantir que ele receba o arquivo e retorne uma versão otimizada
  // independente do tamanho original.
  return await processImageHD(file);
};

export const createHiddenInput = (source: MediaSource): HTMLInputElement => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  if (source === 'CAMERA') {
    input.capture = 'environment';
  }
  return input;
};
