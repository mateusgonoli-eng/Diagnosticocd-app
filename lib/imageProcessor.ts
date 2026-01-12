
/**
 * PROCESSADOR DE IMAGENS DE ALTA RESILIÊNCIA (V20 - STABILITY EDITION)
 * Focado em eliminar o "Hardware Decode Fail" em dispositivos móveis.
 */

let isHardwareUnstable = false;
let processingQueue = Promise.resolve();

/**
 * Força a limpeza do pipeline da GPU e buffers de memória.
 */
const resetGPUPipeline = () => {
  try {
    const vacuum = document.createElement('canvas');
    vacuum.width = 1;
    vacuum.height = 1;
    const ctx = vacuum.getContext('2d');
    ctx?.fillRect(0, 0, 1, 1);
    vacuum.width = 0;
    vacuum.height = 0;
  } catch (e) {}
};

const getModularStrategy = (fileSize: number) => {
  if (fileSize > 25 * 1024 * 1024) return { tier: [640], quality: 0.3, strategy: 'EMERGENCY' };
  if (fileSize > 12 * 1024 * 1024) return { tier: [1024, 800], quality: 0.5, strategy: 'ULTRA_HIGH' };
  return { tier: [1280, 960], quality: 0.6, strategy: 'STANDARD' };
};

export const processImageHD = async (file: File): Promise<string> => {
  // Enfileiramento para garantir que o hardware processe uma imagem por vez
  return new Promise((resolve, reject) => {
    processingQueue = processingQueue.then(async () => {
      try {
        const result = await executeSafeProcess(file);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
};

async function executeSafeProcess(file: File): Promise<string> {
  resetGPUPipeline();
  const config = getModularStrategy(file.size);
  
  // Se o hardware falhou antes, usamos tiers mínimos
  const effectiveTiers = isHardwareUnstable ? [480] : config.tier;

  for (const dim of effectiveTiers) {
    try {
      // Tenta o método via Bitmap (mais rápido mas consome mais RAM de pico)
      if (!isHardwareUnstable && file.size < 15 * 1024 * 1024) {
        return await renderViaBitmap(file, dim, config.quality);
      }
      // Fallback para o pipeline ultra-seguro (Base64/FileReader) para arquivos gigantes
      return await renderViaUltraSafePipeline(file, dim, config.quality);
    } catch (err) {
      console.warn(`V20: Pressão em ${dim}px. Ativando Modo de Segurança.`);
      isHardwareUnstable = true;
      resetGPUPipeline();
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // TENTATIVA FINAL DE EMERGÊNCIA
  return await renderViaUltraSafePipeline(file, 320, 0.2);
}

async function renderViaBitmap(file: File, targetDim: number, quality: number): Promise<string> {
  if (!window.createImageBitmap) throw new Error("No Bitmap support");

  const bitmap = await createImageBitmap(file, {
    resizeWidth: targetDim,
    resizeQuality: 'low',
    imageOrientation: 'from-image'
  });

  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  
  if (!ctx) throw new Error("Context fail");
  ctx.drawImage(bitmap, 0, 0);
  
  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  bitmap.close();
  canvas.width = 0; canvas.height = 0;
  return dataUrl;
}

/**
 * Método Ultra Seguro: Lê como DataURL antes de desenhar.
 * Evita o erro de "Blob URL" do hardware em alguns firmwares Android/iOS.
 */
async function renderViaUltraSafePipeline(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.decoding = 'async';
      
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
          canvas.width = Math.floor(img.width * scale);
          canvas.height = Math.floor(img.height * scale);

          const ctx = canvas.getContext('2d', { alpha: false });
          if (!ctx) throw new Error("Safety Context Fail");

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'low';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const result = canvas.toDataURL('image/jpeg', quality);
          canvas.width = 0; canvas.height = 0;
          img.src = "";
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error("Image Load Fail"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("File Read Fail"));
    reader.readAsDataURL(file);
  });
}
