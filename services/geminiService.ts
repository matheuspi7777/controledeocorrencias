import { GoogleGenAI } from "@google/genai";
import { Incident } from "../types.ts";

export const analyzeIncidents = async (incidents: Incident[]) => {
  // Always initialize GoogleGenAI inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

  const prompt = `
    Como um analista sênior de segurança pública, analise a seguinte lista de ocorrências policiais e forneça um relatório estruturado:
    
    Ocorrências:
    ${JSON.stringify(incidents.map(i => ({
    numero: i.incidentNumber,
    sigma: i.sigma,
    tipo: i.type,
    data: i.date,
    local: i.location.address,
    descricao: i.description
  })))}

    Seu relatório deve conter:
    1. Identificação de padrões (horários, locais recorrentes, tipos de crimes, correlação com códigos SIGMA).
    2. Nível de alerta atual da região.
    3. Recomendações estratégicas para policiamento preventivo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });

    // Access the .text getter
    return response.text || "Sem resposta da IA.";
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return "Não foi possível realizar a análise no momento. Verifique sua chave de API.";
  }
};

export const getSmartSummary = async (incident: Incident) => {
  // Always initialize GoogleGenAI inside the function to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "" });

  const prompt = `Resuma de forma técnica e concisa esta ocorrência policial (N° ${incident.incidentNumber}, SIGMA ${incident.sigma}) para um boletim rápido: ${incident.description}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt
    });
    // Access the .text getter
    return response.text || incident.description;
  } catch (error) {
    return incident.description;
  }
}