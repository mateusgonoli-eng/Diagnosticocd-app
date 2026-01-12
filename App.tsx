
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Camera, 
  ArrowRight, 
  ChevronRight,
  Printer,
  ArrowLeft,
  ClipboardList,
  Filter,
  Check,
  ChevronDown,
  Plus,
  Sparkles,
  Loader2,
  Calendar,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  UploadCloud,
  Pencil,
  Trash2,
  Clock,
  Target,
  FolderOpen,
  Save,
  ImageIcon,
  MoreVertical,
  Presentation,
  LayoutGrid,
  FileSpreadsheet,
  FileText,
  GripVertical,
  Maximize,
  Minimize,
  Move
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { SPECIFICATIONS as INITIAL_SPECS } from './constants';
import { ComplianceStatus, DiagnosticState, CDInfo, DiagnosticItem, SpecificationItem, RiskLevel } from './types';
import { Header } from './components/Header';
import { ComplianceButton } from './components/ComplianceButton';
import { RiskSelector } from './components/RiskSelector';
import { processImageHD } from './lib/imageProcessor';
import { generateRequirements } from './lib/aiService';

const STORAGE_KEY = 'solar_coca_cola_diagnostics_v1';

export default function App() {
  const [step, setStep] = useState<'HOME' | 'INFO' | 'CHECKLIST' | 'SUMMARY' | 'LOAD_LIST'>('HOME');
  const [activeCategory, setActiveCategory] = useState<string>('TODOS');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customSpecs, setCustomSpecs] = useState<SpecificationItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [processingImage, setProcessingImage] = useState<string | null>(null);
  const [savedDiagnostics, setSavedDiagnostics] = useState<{id: string, name: string, date: string, partner: string}[]>([]);
  
  const [mediaSelector, setMediaSelector] = useState<{ specId: string } | null>(null);
  const [cameraPreview, setCameraPreview] = useState<{ specId: string, dataUrl: string, file: File } | null>(null);

  const [presentationMode, setPresentationMode] = useState<{ isOpen: boolean, diagnostic: (DiagnosticState & { customSpecs?: SpecificationItem[] }) | null }>({ isOpen: false, diagnostic: null });
  const [presentationTab, setPresentationTab] = useState<'SLIDES' | 'TABLE'>('SLIDES');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [presentationOrder, setPresentationOrder] = useState<string[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Configuração de estilo por slide
  const [slideConfig, setSlideConfig] = useState<Record<string, { fontSize: number, reverse: boolean }>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = useState({ title: '', category: 'Operacional', description: '', requirements: [] as string[] });

  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    info: { name: '', partner: '', location: '', date: new Date().toISOString().split('T')[0], auditor: '', goliveDate: '' },
    items: {}
  });

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const list = Object.keys(data).map(id => ({
          id,
          name: data[id].info.name,
          partner: data[id].info.partner,
          date: data[id].info.date
        }));
        setSavedDiagnostics(list);
      } catch (e) { console.error(e); }
    }
  }, [step]);

  const allSpecs = useMemo(() => [...INITIAL_SPECS, ...customSpecs], [customSpecs, INITIAL_SPECS]);

  const categories = useMemo(() => {
    const cats = new Set(INITIAL_SPECS.map(s => s.category));
    cats.add('Extra');
    return Array.from(cats).sort();
  }, []);

  const filteredSpecs = useMemo(() => {
    let result = allSpecs;
    if (activeCategory !== 'TODOS') result = result.filter(s => s.category === activeCategory);
    if (showOnlyPending) result = result.filter(s => !diagnostic.items[s.id]);
    return result;
  }, [activeCategory, showOnlyPending, allSpecs, diagnostic.items]);

  const handleInfoChange = useCallback((field: keyof CDInfo, value: string) => {
    setDiagnostic(prev => ({
      ...prev,
      info: { ...prev.info, [field]: value }
    }));
  }, []);

  const handleAISuggest = async () => {
    if (!newItem.title) return alert("Digite um título primeiro!");
    setIsGeneratingAI(true);
    const suggested = await generateRequirements(newItem.title, newItem.category);
    setNewItem(prev => ({ ...prev, requirements: suggested }));
    setIsGeneratingAI(false);
  };

  const handleAddCustomItem = () => {
    if (!newItem.title) return;
    const id = `custom_${Date.now()}`;
    const finalRequirements = newItem.requirements.length > 0 ? newItem.requirements : ['Validar conforme necessidade local'];
    setCustomSpecs(prev => [...prev, { ...newItem, requirements: finalRequirements, id }]);
    setNewItem({ title: '', category: 'Operacional', description: '', requirements: [] });
    setShowAddModal(false);
  };

  const handleDeleteCustomItem = (id: string) => {
    setCustomSpecs(prev => prev.filter(item => item.id !== id));
    setDiagnostic(prev => {
      const nextItems = { ...prev.items };
      delete nextItems[id];
      return { ...prev, items: nextItems };
    });
  };

  const handleItemUpdate = useCallback((specId: string, updates: Partial<DiagnosticItem>) => {
    setDiagnostic(prev => {
      const existing = prev.items[specId] || { specId, status: ComplianceStatus.NAO_APLICAVEL, observations: '', photos: [], risk: RiskLevel.BAIXO };
      const newItems = { ...prev.items };
      let newDeadline = updates.deadline !== undefined ? updates.deadline : existing.deadline;
      if (updates.status === ComplianceStatus.NAO_CONFORME && !newDeadline) {
        newDeadline = prev.info.goliveDate;
      }
      newItems[specId] = { ...existing, ...updates, deadline: newDeadline };
      return { ...prev, items: newItems };
    });

    if (presentationMode.isOpen && presentationMode.diagnostic) {
      setPresentationMode(prev => {
        if (!prev.diagnostic) return prev;
        const newItems = { ...prev.diagnostic.items };
        newItems[specId] = { ...(newItems[specId] || { specId, status: ComplianceStatus.NAO_APLICAVEL, observations: '', photos: [], risk: RiskLevel.BAIXO }), ...updates };
        return { ...prev, diagnostic: { ...prev.diagnostic, items: newItems } };
      });
    }
  }, [presentationMode.isOpen, presentationMode.diagnostic]);

  const handleAddPhoto = (specId: string, photoDataUrl: string) => {
    setDiagnostic(prev => {
      const existing = prev.items[specId] || { specId, status: ComplianceStatus.NAO_APLICAVEL, observations: '', photos: [], risk: RiskLevel.BAIXO };
      return { ...prev, items: { ...prev.items, [specId]: { ...existing, photos: [...existing.photos, photoDataUrl] } } };
    });
  };

  const handleRemovePhoto = (specId: string, index: number) => {
    setDiagnostic(prev => {
      const item = prev.items[specId];
      if (!item) return prev;
      const newPhotos = [...item.photos];
      newPhotos.splice(index, 1);
      return { ...prev, items: { ...prev.items, [specId]: { ...item, photos: newPhotos } } };
    });
  };

  const handleProcessFile = async (specId: string, file: File, isCamera: boolean = false) => {
    setProcessingImage(specId);
    setMediaSelector(null);
    try {
      const optimizedImage = await processImageHD(file);
      if (isCamera) setCameraPreview({ specId, dataUrl: optimizedImage, file });
      else handleAddPhoto(specId, optimizedImage);
    } catch (err) { alert("Falha ao processar arquivo."); }
    finally { setProcessingImage(null); }
  };

  const handleSaveToStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const id = diagnostic.info.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now();
    data[id] = { ...diagnostic, customSpecs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    alert("Diagnóstico salvo!");
    setStep('HOME');
  };

  const handleLoadDiagnostic = (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const saved = data[id];
      if (saved) {
        setDiagnostic(saved);
        if (saved.customSpecs) setCustomSpecs(saved.customSpecs);
        setStep('SUMMARY');
      }
    }
  };

  const handleOpenPresentation = (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const saved = data[id];
      if (saved) {
        const nonCompliantSpecs = [...INITIAL_SPECS, ...(saved.customSpecs || [])]
          .filter(s => saved.items[s.id]?.status === ComplianceStatus.NAO_CONFORME);
        setPresentationOrder(nonCompliantSpecs.map(s => s.id));
        setPresentationMode({ isOpen: true, diagnostic: saved });
        setOpenMenuId(null);
      }
    }
  };

  const exportExcel = () => {
    if (!presentationMode.diagnostic) return;
    const diag = presentationMode.diagnostic;
    const specs = [...INITIAL_SPECS, ...(diag.customSpecs || [])];
    let csv = "\ufeffTítulo;Categoria;Descrição;Observações;Risco;Prazo;Status;Conformidade\n";
    presentationOrder.forEach(id => {
      const spec = specs.find(s => s.id === id);
      const item = diag.items[id];
      if (spec && item) {
        const deadline = item.deadline || diag.info.goliveDate;
        const status = deadline === diag.info.goliveDate ? "Go-Live" : (deadline > diag.info.goliveDate ? "pós Go-live" : "pré Go-Live");
        csv += `"${spec.title}";"${spec.category}";"${spec.description}";"${item.observations.replace(/"/g, '""')}";"${item.risk}";"${new Date(deadline + 'T12:00:00').toLocaleDateString('pt-BR')}";"${status}";"${item.status}"\n`;
      }
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Dados_${diag.info.name}.csv`);
    link.click();
  };

  const getDynamicFontSize = (text: string, baseSize: number) => {
    const length = text.length;
    if (length > 400) return baseSize * 0.5;
    if (length > 250) return baseSize * 0.7;
    if (length > 150) return baseSize * 0.85;
    return baseSize;
  };

  const updateSlideConfig = (id: string, key: 'fontSize' | 'reverse', value: any) => {
    setSlideConfig(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { fontSize: 24, reverse: false }), [key]: value }
    }));
  };

  const progress = allSpecs.length > 0 ? Math.round((Object.keys(diagnostic.items).length / allSpecs.length) * 100) : 0;
  const isChecklistComplete = Object.keys(diagnostic.items).length === allSpecs.length && allSpecs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-left">
      <Header />
      
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && mediaSelector) handleProcessFile(mediaSelector.specId, file, true); e.target.value = ''; }} />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && mediaSelector) handleProcessFile(mediaSelector.specId, file, false); e.target.value = ''; }} />

      {step === 'HOME' && (
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
          <div className="relative w-72 h-72 mb-8">
            <div className="absolute inset-0 bg-red-600/10 rounded-full animate-pulse scale-110" />
            <div className="relative w-full h-full bg-white rounded-full flex flex-col items-center justify-center shadow-2xl overflow-hidden border-8 border-white">
              <ClipboardList size={100} className="text-[#E01E2B] mb-2" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-3 rounded-full shadow-lg border-4 border-white"><CheckCircle size={32} /></div>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2 px-4 leading-tight tracking-tight uppercase">Diagnóstico CD</h2>
          <div className="bg-black text-white px-6 py-2 rounded-full text-xs font-black tracking-[0.3em] uppercase mb-8 mx-auto inline-block shadow-lg border-b-4 border-red-600">PROJETO NMA</div>
          <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
            <button onClick={() => setStep('INFO')} className="bg-[#E01E2B] text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 active:scale-95 group">Novo Diagnóstico <ArrowRight size={24} /></button>
            <button onClick={() => setStep('LOAD_LIST')} className="bg-white text-gray-700 py-5 rounded-2xl font-black text-xl shadow-md border-2 border-gray-100 flex items-center justify-center gap-4 active:scale-95 hover:bg-gray-50 transition-all">Abrir Diagnóstico <FolderOpen size={24} className="text-red-600" /></button>
          </div>
        </main>
      )}

      {step === 'LOAD_LIST' && (
        <>
          <div className="p-4 bg-white border-b sticky top-[64px] z-40">
             <div className="flex items-center gap-2 text-gray-400 mb-1 cursor-pointer hover:text-red-600" onClick={() => setStep('HOME')}><ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Voltar</span></div>
             <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Diagnósticos Salvos</h3>
          </div>
          <main className="flex-1 p-6 space-y-4 max-w-2xl mx-auto w-full py-8 text-left">
            {savedDiagnostics.length > 0 ? savedDiagnostics.map(diag => (
              <div key={diag.id} className="relative">
                <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:border-red-200 transition-all group">
                  <div onClick={() => handleLoadDiagnostic(diag.id)} className="flex-1 cursor-pointer">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(diag.date).toLocaleDateString('pt-BR')}</span>
                    <h4 className="text-xl font-black text-gray-900 uppercase tracking-tight">{diag.name}</h4>
                    <p className="text-sm font-bold text-red-600 uppercase tracking-widest">{diag.partner}</p>
                  </div>
                  <button onClick={() => setOpenMenuId(openMenuId === diag.id ? null : diag.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"><MoreVertical size={24} /></button>
                </div>
                {openMenuId === diag.id && (
                  <div className="absolute right-4 top-16 bg-white shadow-2xl rounded-2xl border border-gray-100 py-2 w-56 z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => handleLoadDiagnostic(diag.id)} className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors font-bold text-sm text-gray-700"><BarChart3 size={18} className="text-red-600" /> Abrir Dashboard</button>
                    <button onClick={() => handleOpenPresentation(diag.id)} className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors font-bold text-sm text-gray-700"><Presentation size={18} className="text-red-600" /> Abrir Apresentação</button>
                  </div>
                )}
              </div>
            )) : <div className="text-center py-20 text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum diagnóstico salvo</div>}
          </main>
        </>
      )}

      {step === 'INFO' && (
        <>
          <div className="p-4 bg-white border-b sticky top-[64px] z-40">
             <div className="flex items-center gap-2 text-gray-400 mb-1 cursor-pointer hover:text-red-600" onClick={() => setStep('HOME')}><ArrowLeft size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Voltar</span></div>
             <h3 className="text-lg font-bold text-gray-800 uppercase tracking-tight">Dados da Unidade</h3>
          </div>
          <main className="flex-1 p-6 max-w-2xl mx-auto w-full py-12 text-left">
            <div className="space-y-6 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div><label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Nome da Unidade (CD)</label><input type="text" value={diagnostic.info.name} onChange={(e) => handleInfoChange('name', e.target.value)} placeholder="Ex: CD Caucaia" className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-semibold uppercase" /></div>
              <div><label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Parceiro Logístico</label><input type="text" value={diagnostic.info.partner} onChange={(e) => handleInfoChange('partner', e.target.value)} placeholder="Ex: Transportadora XYZ" className="w-full p-4 border-2 border-gray-100 rounded-2xl focus:border-red-500 outline-none font-semibold uppercase" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-red-600 uppercase mb-2 tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Data Go-Live</label><input type="date" value={diagnostic.info.goliveDate} onChange={(e) => handleInfoChange('goliveDate', e.target.value)} className="w-full p-4 border-2 border-red-100 bg-red-50/30 rounded-2xl font-bold text-red-700" /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase mb-2 tracking-widest">Auditor</label><input type="text" value={diagnostic.info.auditor} onChange={(e) => handleInfoChange('auditor', e.target.value)} className="w-full p-4 border-2 border-gray-100 rounded-2xl font-semibold uppercase" /></div>
              </div>
              <button disabled={!diagnostic.info.name || !diagnostic.info.partner || !diagnostic.info.goliveDate} onClick={() => setStep('CHECKLIST')} className="w-full bg-[#E01E2B] text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-sm shadow-md disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4">Iniciar Verificação <ChevronRight size={18} /></button>
            </div>
          </main>
        </>
      )}

      {step === 'CHECKLIST' && (
        <>
          <div className="bg-white border-b sticky top-[64px] z-40 shadow-sm p-4 text-left">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Conclusão Técnica</span><span className="text-sm font-black text-red-600">{progress}%</span></div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-red-600 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
              </div>
              <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${ (activeCategory !== 'TODOS' || showOnlyPending) ? 'border-[#E01E2B] bg-red-50 text-[#E01E2B]' : 'bg-white border-gray-100 text-gray-600' }`}><Filter size={14} /> Filtro</button>
            </div>
          </div>

          <main className="flex-1 p-4 space-y-6 pb-24 text-left">
            {filteredSpecs.map((spec) => {
              const currentItem = diagnostic.items[spec.id];
              return (
                <div key={spec.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden text-left relative">
                  <div className="p-5 border-b border-gray-50">
                    <div className="flex justify-between items-start"><span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-widest mb-2 inline-block">{spec.category}</span>{spec.id.startsWith('custom_') && <button onClick={() => handleDeleteCustomItem(spec.id)} className="p-3 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-2xl transition-all"><Trash2 size={24} /></button>}</div>
                    <h4 className="text-xl font-bold text-gray-900 leading-tight uppercase tracking-tight">{spec.title}</h4>
                    <p className="text-sm text-gray-500 mt-1 italic">{spec.description}</p>
                  </div>
                  <div className="p-5 space-y-6">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Requisitos de Validação</span>
                      <ul className="grid gap-2">{spec.requirements.map((req, i) => (<li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"><div className="mt-1 bg-red-500 w-1.5 h-1.5 rounded-full shrink-0" /><span className="text-xs font-bold text-gray-700 leading-tight">{req}</span></li>))}</ul>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="flex flex-col gap-1.5"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</span><div className="flex gap-2">{Object.values(ComplianceStatus).map((status) => (<ComplianceButton key={status} status={status} selected={currentItem?.status === status} onClick={() => handleItemUpdate(spec.id, { status })} />))}</div></div>
                          <RiskSelector selected={currentItem?.risk} onChange={(risk) => handleItemUpdate(spec.id, { risk })} />
                       </div>
                       <textarea placeholder="Observações..." value={currentItem?.observations || ''} onChange={(e) => handleItemUpdate(spec.id, { observations: e.target.value })} className="w-full p-4 border-2 border-gray-100 rounded-2xl text-sm outline-none focus:border-red-300 min-h-[100px] font-medium" />
                    </div>
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Evidências Fotográficas</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentItem?.photos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-md group"><img src={photo} className="w-full h-full object-cover" /><button onClick={() => handleRemovePhoto(spec.id, idx)} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><X size={14} /></button></div>
                        ))}
                        {processingImage === spec.id ? <div className="aspect-square border-2 border-dashed rounded-2xl bg-red-50 flex items-center justify-center text-[#E01E2B]"><Loader2 className="animate-spin" size={24} /></div> : <button onClick={() => setMediaSelector({ specId: spec.id })} className="aspect-square border-2 border-dashed rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-red-50 transition-all"><Plus size={24} /><span className="text-[8px] font-black uppercase mt-1">Add Foto</span></button>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </main>

          <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-6 w-16 h-16 bg-[#E01E2B] text-white rounded-full shadow-[0_8px_30px_rgb(224,30,43,0.3)] flex items-center justify-center z-[60] active:scale-90 transition-all"><Plus size={36} strokeWidth={3} /></button>
          
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t flex gap-4 z-50 text-left">
            <button onClick={() => setStep('INFO')} className="flex-1 bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-all active:scale-95"><ArrowLeft size={16} /> Dados</button>
            <button disabled={!isChecklistComplete} onClick={() => setStep('SUMMARY')} className={`flex-[2] py-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-lg transition-all ${ isChecklistComplete ? 'bg-[#E01E2B] text-white' : 'bg-gray-200 text-gray-400' }`}>Dashboard <BarChart3 size={18} /></button>
          </div>
        </>
      )}

      {step === 'SUMMARY' && (
        <>
          <div className="bg-black text-white p-10 print:text-black print:bg-white print:border-b-4 print:border-red-600 text-left">
            <h3 className="text-5xl font-black uppercase tracking-tighter mb-2 leading-none">{diagnostic.info.name}</h3>
            <div className="flex items-center gap-4 text-left"><p className="text-xl font-bold text-red-500 uppercase tracking-widest">{diagnostic.info.partner}</p><div className="h-6 w-px bg-white/20" /><p className="text-sm font-bold text-white/60 uppercase">Go-Live: {new Date(diagnostic.info.goliveDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 p-4 rounded-3xl border border-white/10 text-left"><span className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Global</span><span className="text-4xl font-black text-green-400 leading-none">{Math.round((Object.values(diagnostic.items).filter(i => i.status === ComplianceStatus.CONFORME).length / allSpecs.length) * 100)}%</span></div>
              <div className="bg-green-600/20 p-4 rounded-3xl border border-green-500/20 text-left"><span className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Conformes</span><span className="text-4xl font-black text-green-500 leading-none">{Object.values(diagnostic.items).filter(i => i.status === ComplianceStatus.CONFORME).length}</span></div>
              <div className="bg-red-600/20 p-4 rounded-3xl border border-red-500/20 text-left"><span className="block text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 text-left">Pendências</span><span className="text-4xl font-black text-red-500 leading-none">{Object.values(diagnostic.items).filter(i => i.status === ComplianceStatus.NAO_CONFORME).length}</span></div>
            </div>
          </div>
          <main className="flex-1 p-6 space-y-8 max-w-6xl mx-auto w-full py-12 text-left pb-32">
            <div className="flex items-center gap-2 border-b pb-4"><Target className="text-red-600" size={20} /><h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Plano de Ação (Apenas Não Conformes)</h4></div>
            <div className="grid gap-6">
              {allSpecs.filter(s => diagnostic.items[s.id]?.status === ComplianceStatus.NAO_CONFORME).map(spec => {
                const item = diagnostic.items[spec.id];
                const riskColor = item.risk === RiskLevel.ALTO ? 'border-red-600' : item.risk === RiskLevel.MEDIO ? 'border-amber-500' : 'border-gray-300';
                const deadline = item.deadline || diagnostic.info.goliveDate;
                const statusLabel = deadline === diagnostic.info.goliveDate ? "Go-Live" : (deadline > diagnostic.info.goliveDate ? "pós Go-live" : "pré Go-Live");
                const labelColor = deadline === diagnostic.info.goliveDate ? "text-red-600 bg-red-50" : (deadline > diagnostic.info.goliveDate ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50");
                return (
                  <div key={spec.id} className={`bg-white p-8 rounded-[40px] border-2 ${riskColor} shadow-md flex flex-col lg:flex-row gap-8 relative text-left`}>
                    <div className="flex-1 space-y-4 text-left">
                      <div className="flex gap-2"><span className="text-[10px] font-black text-red-600 uppercase bg-red-50 px-3 py-1 rounded-full">{spec.category}</span><span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase bg-gray-50 border border-gray-200`}>Risco {item.risk}</span></div>
                      <h5 className="font-black text-2xl uppercase tracking-tight leading-none">{spec.title}</h5>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left"><span className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Requisitos:</span><ul className="space-y-1.5">{spec.requirements.map((req, i) => (<li key={i} className="text-xs font-bold text-gray-700 flex items-start gap-2"><div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 shrink-0" />{req}</li>))}</ul></div>
                      <div className="bg-gray-50 p-6 rounded-2xl italic font-bold text-gray-700 border border-dashed border-gray-200">"{item.observations || 'Sem observações.'}"</div>
                      <div className="flex flex-col gap-2"><div className="flex items-center gap-3 ml-1"><label className="block text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={12} /> Prazo</label><span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${labelColor}`}>{statusLabel}</span></div><input type="date" value={deadline} onChange={(e) => handleItemUpdate(spec.id, { deadline: e.target.value })} className="p-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 w-full lg:max-w-xs" /></div>
                    </div>
                    {item.photos.length > 0 && <div className="lg:w-72 shrink-0 grid grid-cols-2 lg:grid-cols-1 gap-2">{item.photos.slice(0, 2).map((photo, i) => (<div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-inner bg-gray-50 border-4 border-white"><img src={photo} className="w-full h-full object-cover" /></div>))}</div>}
                  </div>
                );
              })}
            </div>
            <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 print:hidden">
              <button onClick={() => setStep('CHECKLIST')} className="bg-white text-gray-400 border-2 border-gray-100 py-6 rounded-3xl font-black uppercase flex items-center justify-center gap-3"><ArrowLeft size={20} /> Revisar</button>
              <button onClick={handleSaveToStorage} className="bg-black text-white py-6 rounded-3xl font-black uppercase flex items-center justify-center gap-3 shadow-xl"><Save size={20} className="text-red-600" /> Salvar</button>
            </div>
          </main>
        </>
      )}

      {/* MODAL ADD ADEQUAÇÃO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
            <div className="flex justify-between items-center mb-6"><h4 className="text-2xl font-black uppercase tracking-tight">Nova Adequação</h4><button onClick={() => setShowAddModal(false)}><X size={24} className="text-gray-400" /></button></div>
            <div className="space-y-6">
              <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Título</label><input type="text" placeholder="Ex: Reparo no Corrimão" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-red-500 font-bold" /></div>
              <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Categoria</label><select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="block text-[10px] font-black text-gray-400 uppercase">Requisitos</label><button onClick={handleAISuggest} disabled={isGeneratingAI || !newItem.title} className="text-[10px] font-black text-red-600 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full disabled:opacity-50">{isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} IA Suggest</button></div>
                <div className="space-y-2 max-h-40 overflow-y-auto">{newItem.requirements.length > 0 ? newItem.requirements.map((req, i) => (<div key={i} className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-100"><CheckCircle size={14} className="text-green-500" /><span className="text-xs font-bold text-gray-700">{req}</span></div>)) : <p className="text-[10px] text-gray-400 italic p-4 text-center border-2 border-dashed border-gray-100 rounded-2xl uppercase font-black">Nenhum requisito definido</p>}</div>
              </div>
            </div>
            <button onClick={handleAddCustomItem} disabled={!newItem.title} className="w-full bg-[#E01E2B] text-white py-5 rounded-3xl font-black uppercase mt-10">Incluir</button>
          </div>
        </div>
      )}

      {/* MODAL MÍDIA */}
      {mediaSelector && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden">
            <div className="p-6 text-center border-b border-gray-50"><h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Capturar Evidência</h4></div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-3xl border border-red-100 active:scale-95"><div className="bg-[#E01E2B] text-white p-4 rounded-2xl mb-3 shadow-lg"><Camera size={32} /></div><span className="text-[10px] font-black uppercase text-red-600">Câmera</span></button>
              <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100 active:scale-95"><div className="bg-black text-white p-4 rounded-2xl mb-3 shadow-lg"><UploadCloud size={32} /></div><span className="text-[10px] font-black uppercase text-gray-900">Arquivos</span></button>
            </div>
            <button onClick={() => setMediaSelector(null)} className="w-full py-6 text-[10px] font-black uppercase text-gray-400 border-t">Voltar</button>
          </div>
        </div>
      )}

      {cameraPreview && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
          <div className="w-full max-w-lg flex flex-col gap-6 text-left">
            <div className="relative rounded-[40px] overflow-hidden border-4 border-white aspect-[3/4] bg-gray-900"><img src={cameraPreview.dataUrl} className="w-full h-full object-cover" alt="Preview" /></div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { handleAddPhoto(cameraPreview.specId, cameraPreview.dataUrl); setCameraPreview(null); }} className="w-full bg-green-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3"><CheckCircle size={24} /> Confirmar Foto</button>
              <button onClick={() => { const sid = cameraPreview.specId; setCameraPreview(null); setMediaSelector({ specId: sid }); }} className="w-full bg-white/10 text-white border-2 border-white/20 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3"><RefreshCw size={20} /> Recapturar</button>
            </div>
          </div>
        </div>
      )}

      {/* FILTROS */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-end justify-center animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-t-[40px] p-8 shadow-2xl flex flex-col items-center">
            <div className="flex justify-between items-center mb-6 w-full"><h4 className="text-xl font-black uppercase tracking-tight">Filtrar</h4><button onClick={() => setIsFilterOpen(false)}><X size={24} className="text-gray-400" /></button></div>
            <div className="space-y-6 w-full text-left">
              <div className="w-full text-left"><label className="block text-[10px] font-black text-gray-400 uppercase mb-3">Categoria</label><div className="flex flex-wrap gap-2">{['TODOS', ...categories].map(cat => <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeCategory === cat ? 'bg-[#E01E2B] text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>)}</div></div>
              <div className="w-full text-left"><label className="block text-[10px] font-black text-gray-400 uppercase mb-3">Status</label><button onClick={() => setShowOnlyPending(!showOnlyPending)} className={`w-full p-4 rounded-2xl border-2 font-black uppercase text-xs flex items-center justify-between ${showOnlyPending ? 'border-[#E01E2B] bg-red-50 text-[#E01E2B]' : 'border-gray-100 bg-gray-50'}`}><span>Apenas Pendentes</span>{showOnlyPending ? <CheckCircle size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}</button></div>
            </div>
            <button onClick={() => setIsFilterOpen(false)} className="w-full max-w-sm bg-black text-white py-5 rounded-3xl font-black uppercase mt-8">Aplicar</button>
          </div>
        </div>
      )}

      {/* MODAL APRESENTAÇÃO */}
      {presentationMode.isOpen && presentationMode.diagnostic && (
        <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col animate-in fade-in duration-300 print:bg-white overflow-hidden">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              .presentation-page { 
                page-break-after: always !important; 
                height: 100vh !important; 
                display: flex !important; 
                flex-direction: column !important; 
                padding: 40px !important; 
                border: none !important; 
                box-shadow: none !important; 
                margin: 0 !important;
                background: white !important;
              }
              body { background: white !important; }
              #root { display: none !important; }
            }
          `}</style>
          
          <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 no-print">
            <div className="flex items-center gap-4">
              <button onClick={() => setPresentationMode({ isOpen: false, diagnostic: null })} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
              <div className="h-8 w-px bg-gray-100" />
              <h4 className="font-black uppercase tracking-tight text-gray-900 leading-tight">Apresentação: {presentationMode.diagnostic.info.name}</h4>
            </div>
            <div className="bg-gray-100 p-1.5 rounded-[20px] flex gap-1">
              <button onClick={() => setPresentationTab('SLIDES')} className={`px-5 py-2.5 rounded-[15px] font-black uppercase text-[10px] tracking-widest transition-all ${presentationTab === 'SLIDES' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Visualização</button>
              <button onClick={() => setPresentationTab('TABLE')} className={`px-5 py-2.5 rounded-[15px] font-black uppercase text-[10px] tracking-widest transition-all ${presentationTab === 'TABLE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Tabela de Dados</button>
            </div>
            <div className="flex gap-2">
              {presentationTab === 'TABLE' && <button onClick={exportExcel} className="bg-green-600 text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-green-700 transition-all shadow-md"><FileSpreadsheet size={16} /> Excel</button>}
              <button onClick={() => window.print()} className="bg-black text-white px-5 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all shadow-md"><FileText size={16} /> Gerar PDF</button>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
            {presentationTab === 'SLIDES' ? (
              <div className="w-full max-w-6xl space-y-6">
                <div className="flex justify-between items-center px-4 no-print">
                  <button onClick={() => setIsGridView(!isGridView)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isGridView ? 'bg-red-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}><LayoutGrid size={16} /> {isGridView ? 'Fechar Visão Geral' : 'Visão Geral (Grid)'}</button>
                  {!isGridView && (
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1 bg-white p-1 rounded-xl border">
                        <button onClick={() => updateSlideConfig(presentationOrder[currentSlideIndex], 'reverse', !slideConfig[presentationOrder[currentSlideIndex]]?.reverse)} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-600" title="Inverter Layout"><Move size={16} /></button>
                        <button onClick={() => updateSlideConfig(presentationOrder[currentSlideIndex], 'fontSize', Math.max((slideConfig[presentationOrder[currentSlideIndex]]?.fontSize || 24) - 2, 12))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-600"><Minimize size={16} /></button>
                        <button onClick={() => updateSlideConfig(presentationOrder[currentSlideIndex], 'fontSize', Math.min((slideConfig[presentationOrder[currentSlideIndex]]?.fontSize || 24) + 2, 48))} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-red-600"><Maximize size={16} /></button>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Slide {currentSlideIndex + 1} de {presentationOrder.length}</span>
                    </div>
                  )}
                </div>

                {isGridView ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                    {presentationOrder.map((id, index) => {
                      const spec = [...INITIAL_SPECS, ...(presentationMode.diagnostic!.customSpecs || [])].find(s => s.id === id);
                      const item = presentationMode.diagnostic!.items[id];
                      return (
                        <div key={id} onClick={() => { setCurrentSlideIndex(index); setIsGridView(false); }} className="bg-white p-4 rounded-[32px] border-2 border-transparent hover:border-red-600 shadow-sm transition-all cursor-pointer active:scale-95 relative">
                          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-3">{item.photos[0] ? <img src={item.photos[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>}</div>
                          <h6 className="font-black uppercase text-[10px] tracking-tight truncate text-gray-900">{spec?.title}</h6>
                          <div className="absolute top-2 left-2 bg-black/60 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black">{index + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="relative flex items-center gap-6 group">
                    <button disabled={currentSlideIndex === 0} onClick={() => setCurrentSlideIndex(prev => prev - 1)} className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-2xl text-red-600 disabled:opacity-0 transition-all hover:scale-110 active:scale-90 no-print"><ArrowLeft size={32} strokeWidth={3} /></button>
                    {(() => {
                      const id = presentationOrder[currentSlideIndex];
                      const spec = [...INITIAL_SPECS, ...(presentationMode.diagnostic!.customSpecs || [])].find(s => s.id === id);
                      const item = presentationMode.diagnostic!.items[id];
                      const config = slideConfig[id] || { fontSize: 24, reverse: false };
                      if (!spec || !item) return null;
                      const dynamicObsSize = getDynamicFontSize(item.observations || '', config.fontSize);
                      return (
                        <div className={`flex-1 bg-white rounded-[60px] shadow-2xl p-16 min-h-[600px] flex flex-col text-left transition-all ${config.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 print:shadow-none print:m-0 print:rounded-none presentation-page`}>
                          <div className="flex-1 flex flex-col gap-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-8 border-l-8 border-red-600 pl-8">{spec.title}</h2>
                            {item.photos.length > 0 ? (
                              <div className={`grid gap-4 flex-1 ${item.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {item.photos.map((p, i) => (
                                  <div key={i} className="aspect-[4/3] rounded-[40px] overflow-hidden border-8 border-gray-50 shadow-inner bg-gray-50">
                                    <img src={p} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex-1 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
                                <ImageIcon size={100} strokeWidth={1} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col justify-center space-y-10">
                            <div className="bg-gray-50/50 p-8 rounded-[40px] border border-gray-100/50">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-6">Observações Detalhadas:</h4>
                              <p className="font-black text-gray-800 uppercase tracking-tight italic leading-tight break-words" style={{ fontSize: `${dynamicObsSize}px` }}>
                                {item.observations || 'Nenhuma observação técnica adicional.'}
                              </p>
                            </div>
                            <div className="px-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> O que deve ser feito:</h4>
                              <ul className="space-y-3">
                                {spec.requirements.map((req, i) => (
                                  <li key={i} className="text-sm font-bold text-gray-500 flex items-start gap-4">
                                    <div className="mt-1.5 w-1.5 h-1.5 bg-gray-200 rounded-full shrink-0" />
                                    {req}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mt-auto pt-8 flex items-end justify-between">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-2">Prazo Final:</span>
                                <span className="text-3xl font-black text-gray-900 uppercase tracking-tighter bg-red-50 px-6 py-2 rounded-2xl">
                                  {new Date((item.deadline || presentationMode.diagnostic!.info.goliveDate) + 'T12:00:00').toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                    <button disabled={currentSlideIndex === presentationOrder.length - 1} onClick={() => setCurrentSlideIndex(prev => prev + 1)} className="p-4 bg-white/80 backdrop-blur-md rounded-full shadow-2xl text-red-600 disabled:opacity-0 transition-all hover:scale-110 active:scale-90 no-print"><ArrowRight size={32} strokeWidth={3} /></button>
                  </div>
                )}

                {/* IMPRESSÃO DE TODOS OS SLIDES - FORMATO PDF */}
                <div className="hidden print:block">
                  {presentationOrder.map((id) => {
                    const spec = [...INITIAL_SPECS, ...(presentationMode.diagnostic!.customSpecs || [])].find(s => s.id === id);
                    const item = presentationMode.diagnostic!.items[id];
                    const config = slideConfig[id] || { fontSize: 24, reverse: false };
                    if (!spec || !item) return null;
                    const dynamicObsSize = getDynamicFontSize(item.observations || '', config.fontSize);
                    return (
                      <div key={`p-${id}`} className={`presentation-page flex flex-col lg:flex-row gap-16 ${config.reverse ? 'lg:flex-row-reverse' : ''} p-20 bg-white`}>
                        <div className="flex-1 flex flex-col gap-6">
                          <h2 className="text-3xl font-black uppercase text-gray-900 mb-8 border-l-8 border-red-600 pl-8">{spec.title}</h2>
                          {item.photos[0] && <img src={item.photos[0]} className="w-full rounded-[40px] aspect-video object-cover border-8 border-gray-50 shadow-sm" />}
                        </div>
                        <div className="flex-1 flex flex-col justify-center space-y-10">
                          <p className="font-black text-gray-800 uppercase italic leading-tight" style={{ fontSize: `${dynamicObsSize}px` }}>{item.observations}</p>
                          <div className="px-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 mb-4">Requisitos:</h4>
                            <ul className="space-y-2">
                              {spec.requirements.map((req, i) => (
                                <li key={i} className="text-sm font-bold text-gray-500">{req}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-auto">
                             <span className="text-[10px] font-black uppercase text-red-600">Prazo Final: {new Date((item.deadline || presentationMode.diagnostic!.info.goliveDate) + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-7xl bg-white rounded-[40px] shadow-xl flex flex-col h-[70vh] animate-in zoom-in-95">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
                      <tr className="border-b">
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Título</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Categoria</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Conformidade</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Risco</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Observações (Editável)</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Prazo (Editável)</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {presentationOrder.map((id) => {
                        const spec = [...INITIAL_SPECS, ...(presentationMode.diagnostic!.customSpecs || [])].find(s => s.id === id);
                        const item = presentationMode.diagnostic!.items[id];
                        if (!spec || !item) return null;
                        const deadline = item.deadline || presentationMode.diagnostic!.info.goliveDate;
                        const isPostGoLive = deadline > presentationMode.diagnostic!.info.goliveDate;
                        const statusLabel = deadline === presentationMode.diagnostic!.info.goliveDate ? "Go-Live" : isPostGoLive ? "pós Go-live" : "pré Go-Live";
                        const statusColor = deadline === presentationMode.diagnostic!.info.goliveDate ? "text-red-600 bg-red-50" : isPostGoLive ? "text-amber-600 bg-amber-50" : "text-green-600 bg-green-50";
                        return (
                          <tr key={id} className="border-b hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-black text-gray-900 uppercase text-xs">{spec.title}</td>
                            <td className="px-6 py-4"><span className="text-[10px] font-black uppercase bg-gray-100 px-3 py-1 rounded-full text-gray-600">{spec.category}</span></td>
                            <td className="px-6 py-4"><span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border border-current ${item.status === ComplianceStatus.CONFORME ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{item.status}</span></td>
                            <td className="px-6 py-4"><span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${item.risk === RiskLevel.ALTO ? 'bg-red-600 text-white' : item.risk === RiskLevel.MEDIO ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{item.risk}</span></td>
                            <td className="px-6 py-4"><textarea value={item.observations} onChange={(e) => handleItemUpdate(spec.id, { observations: e.target.value })} className="w-full bg-transparent border-b border-gray-100 focus:border-red-300 outline-none p-1 text-[11px] font-bold min-h-[40px] resize-none" /></td>
                            <td className="px-6 py-4"><input type="date" value={deadline} onChange={(e) => handleItemUpdate(spec.id, { deadline: e.target.value })} className="bg-gray-50 p-2 rounded-lg border-none text-[11px] font-black text-gray-700" /></td>
                            <td className="px-6 py-4"><span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border border-current whitespace-nowrap ${statusColor}`}>{statusLabel}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
