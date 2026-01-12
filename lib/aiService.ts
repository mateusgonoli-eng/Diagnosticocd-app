
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateRequirements(title: string, category: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere uma lista de 3 a 4 requisitos técnicos de validação para um Centro de Distribuição da Coca-Cola.
      Título da Adequação: ${title}
      Categoria: ${category}
      
      Retorne apenas um array JSON de strings, curto e direto, focado em normas técnicas, segurança e padrão visual Solar Coca-Cola.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return ["Validar conforme normas vigentes", "Verificar integridade estrutural"];
  } catch (error) {
    console.error("Erro ao gerar requisitos com IA:", error);
    return ["Validar conforme normas vigentes", "Verificar integridade estrutural"];
  }
}
