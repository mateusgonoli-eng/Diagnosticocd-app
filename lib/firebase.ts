
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDocs, 
  collection,
  serverTimestamp,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * CONFIGURAÇÃO FIREBASE SOLAR COCA-COLA
 * 
 * ATENÇÃO: Você DEVE copiar os valores do seu Console Firebase:
 * Project Settings > General > Your Apps > SDK Setup and Configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyBYjFL36qnX7QlyKQQURW17qhNiUNzavR0",
  authDomain: "diagnosticocd-app.firebaseapp.com",
  projectId: "diagnosticocd-app", // Substitua pelo ID que aparece no seu console
  storageBucket: "diagnosticocd-app.firebasestorage.app",
  messagingSenderId: "1022779331462",
  appId: "1:1022779331462:web:367ef3772ba22ebf4bd207"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Habilita persistência offline para evitar erros de conexão imediata
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn("Persistência falhou: multiplas abas abertas.");
    } else if (err.code === 'unimplemented') {
        console.warn("O navegador não suporta persistência.");
    }
});

export const saveDiagnosticToCloud = async (id: string, data: any) => {
  try {
    const docRef = doc(db, "diagnostics", id);
    await setDoc(docRef, {
      ...data,
      lastUpdate: serverTimestamp()
    });
    return true;
  } catch (e: any) {
    console.error("Erro ao salvar no Firestore:", e);
    
    // Se o erro for permissão negada, avisa o usuário sobre as Rules
    if (e.message?.includes("permission-denied")) {
        alert("Erro de Permissão: Verifique se você configurou as 'Rules' no console do Firebase para 'allow read, write: if true;'.");
    }

    // Fallback para localStorage
    localStorage.setItem(`offline_${id}`, JSON.stringify(data));
    return false;
  }
};

export const loadDiagnosticsFromCloud = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "diagnostics"));
    const data: Record<string, any> = {};
    querySnapshot.forEach((doc) => {
      data[doc.id] = doc.data();
    });
    return data;
  } catch (e: any) {
    console.error("Erro ao carregar do Firestore:", e);
    
    // Recupera dados salvos localmente caso falhe a conexão
    const offlineData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('offline_')) {
        const id = key.replace('offline_', '');
        try {
            offlineData[id] = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (err) {
            console.error("Erro ao ler item offline", key);
        }
      }
    }
    return offlineData;
  }
};
