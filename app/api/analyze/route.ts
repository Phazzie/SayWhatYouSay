import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from 'openai';

import { Transcript, AnalysisResult, AnalysisModelId, ServiceId, ChunkAnalysis, Word } from '@/types';
import { chunkTranscripts } from '@/utils/chunking';

// Define the expected JSON schema for the AI's response.
// This makes the output much more reliable than just asking in the prompt.
const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        preferredServiceId: { 
            type: Type.STRING,
            enum: [...Object.values(ServiceId), 'UNCLEAR'],
            description: 'The service ID that is most accurate for this chunk.'
        },
        reasoning: { 
            type: Type.STRING,
            description: 'A brief, one-sentence explanation for the choice.'
        },
        discrepancies: {
            type: Type.OBJECT,
            description: 'Object where keys are service IDs and values are arrays of word indices that are part of a discrepancy.',
            properties: {
                [ServiceId.Whisper]: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                [ServiceId.Google]: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                [ServiceId.AssemblyAI]: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                [ServiceId.ElevenLabs]: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            }
        },
    },
    required: ['preferredServiceId', 'reasoning', 'discrepancies']
};


const createAnalysisPrompt = (chunk: any): string => {
    let prompt = `Analyze the following transcriptions of the same audio segment. Your task is to act as a linguistic expert, compare them meticulously, and determine the most accurate version.

    **Analysis Instructions:**
    1.  **Compare:** Examine the text from each service. Note any differences in wording, spelling, or grammar.
    2.  **Identify Discrepancies:** Pinpoint the exact words that differ.
    3.  **Determine Preferred Service:** Based on context, grammar, and common phrasing, decide which service's transcript is the most plausible and accurate for this specific segment. If all are equally plausible or all seem incorrect, choose "UNCLEAR".
    4.  **Provide Reasoning:** Write a concise, one-sentence explanation for your choice. For example, "'jumps' is more likely than 'jumped' in the context of the sentence."
    5.  **Output Indices:** For every service, list the absolute word indices (relative to the start of the entire transcript, using the 'wordIndexStart' value) of ALL words involved in any discrepancy you found.

    **Input Data:**
    - The starting word index for this chunk is: ${chunk.wordIndexStart}
    - Transcripts:
    `;

    for (const serviceId in chunk) {
        if (serviceId !== 'wordIndexStart' && chunk[serviceId]) {
            const text = (chunk[serviceId] as Word[]).map((word: any) => word.text).join(' ');
            prompt += `\n- ${serviceId}: "${text}"`;
        }
    }
    
    prompt += `
    
    Now, provide your analysis in the required JSON format.`;

    return prompt;
};

// --- API ROUTE HANDLER ---

export async function POST(req: NextRequest) {
  try {
    const { transcripts, provider } = (await req.json()) as { transcripts: Transcript[], provider: AnalysisModelId };

    if (!transcripts || !provider) {
      return NextResponse.json({ error: 'Missing transcripts or provider.' }, { status: 400 });
    }
    
    const chunks = chunkTranscripts(transcripts, 25);
    const analyses: ChunkAnalysis[] = [];

    for (const [index, chunk] of chunks.entries()) {
        const prompt = createAnalysisPrompt(chunk);
        let analysisJson: Omit<ChunkAnalysis, 'chunkIndex'>;
        
        // Only process chunks that have content
        const hasContent = Object.keys(chunk).some(key => key !== 'wordIndexStart' && Array.isArray(chunk[key as ServiceId]) && chunk[key as ServiceId]!.length > 0);
        if (!hasContent) continue;

        if (provider === AnalysisModelId.OpenAI) {
            // NOTE: Keep OpenAI implementation as a placeholder/example
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const response = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                response_format: { type: "json_object" }
            });
            const content = response.choices[0].message.content;
            analysisJson = JSON.parse(content || '{}');
        } else { // Gemini
            if (!process.env.GEMINI_API_KEY) {
                throw new Error("GEMINI_API_KEY environment variable is not set.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: analysisResponseSchema,
                    temperature: 0.1,
                },
            });
            
            const jsonText = response.text.trim();
            try {
                analysisJson = JSON.parse(jsonText);
            } catch (e) {
                console.error("Failed to parse Gemini JSON response:", jsonText);
                throw new Error("AI returned invalid JSON.");
            }
        }

        analyses.push({ ...analysisJson, chunkIndex: index });
    }
    
    const finalResult: AnalysisResult = {
        provider,
        chunkAnalyses: analyses,
    };

    return NextResponse.json(finalResult, { status: 200 });

  } catch (error) {
    console.error('Analysis API error:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to process analysis request: ${message}` }, { status: 500 });
  }
}