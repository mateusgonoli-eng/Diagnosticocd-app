
import { DiagnosticState, SpecificationItem } from '../types';

/**
 * SERVIÇO DE SINCRONIZAÇÃO EM NUVEM - SOLAR COCA-COLA
 * 
 * Para produção real:
 * Substitua o localStorage por chamadas ao Firebase Firestore.
 */

const CLOUD_STORAGE_KEY = 'solar_cloud_sync_v1';

export const saveDiagnosticToCloud = async (id: string, data: any) => {
  try {
    // No Firebase Real: await setDoc(doc(db, "diagnostics", id), data);
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY) || '{}';
    const cloudData = JSON.parse(raw);
    
    cloudData[id] = { 
      ...data, 
      lastUpdate: new Date().toISOString() 
    };
    
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(cloudData));
    
    // Simula um delay de rede
    await new Promise(r => setTimeout(r, 800));
    return true;
  } catch (e) {
    console.error("Erro ao sincronizar com nuvem:", e);
    return false;
  }
};

export const loadDiagnosticsFromCloud = async () => {
  try {
    // No Firebase Real: const querySnapshot = await getDocs(collection(db, "diagnostics"));
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY) || '{}';
    return JSON.parse(raw);
  } catch (e) {
    console.error("Erro ao carregar da nuvem:", e);
    return {};
  }
};
