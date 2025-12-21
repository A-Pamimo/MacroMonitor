import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
// NOTE: process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface EconomicSummary {
  yieldCurve: number;
  cpi: number;
  unemployment: number;
  gdp: number;
  fedFunds: number;
}

export const analyzeEconomy = async (data: EconomicSummary, region: string): Promise<string> => {
  const regionName = region === 'CA' ? 'Canadian' : 'United States';
  const centralBank = region === 'CA' ? 'Bank of Canada (BoC)' : 'Federal Reserve';
  const yieldLabel = region === 'CA' ? '10-Year Bond Yield' : 'Yield Curve Spread (10Y-2Y)';

  try {
    const prompt = `
      You are a senior macro strategist. Analyze the following real-time ${regionName} economic data points:
      
      - ${yieldLabel}: ${data.yieldCurve.toFixed(2)}%
      - CPI Inflation (YoY): ${data.cpi.toFixed(2)}%
      - Unemployment Rate: ${data.unemployment.toFixed(2)}%
      - Real GDP Growth (YoY): ${data.gdp.toFixed(2)}%
      - Policy Rate (${centralBank}): ${data.fedFunds.toFixed(2)}%
      
      Provide a concise, 3-sentence executive summary of the current economic cycle position for ${regionName}.
      Discuss inflationary pressures relative to the ${centralBank}'s targets and growth outlook.
      Do not use bullet points. Write in a professional, financial news tone (like Bloomberg or WSJ).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response
        maxOutputTokens: 250,
        temperature: 0.4, 
      }
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI Analysis service is temporarily unavailable. Please try again later.";
  }
};