import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const extractDataFromImage = async (imageFile: File): Promise<ExtractedData> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const imagePart = await fileToGenerativePart(imageFile);

  const prompt = `
    You are an expert OCR system specializing in handwritten Persian (Farsi) text within tabular formats.
    Analyze the provided image containing a table of handwritten data.
    Extract the data meticulously and return it as a structured JSON object.
    The JSON object must conform to the provided schema. It should have two keys: "headers" and "rows".
    "headers" should be an array of strings with the column headers translated to English.
    "rows" should be an array of arrays, where each inner array contains the cell values for a row in their original Persian script, ordered corresponding to the headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of strings representing the translated English column headers.",
            },
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: "An array of strings representing a row's data, in the same order as the headers."
              },
              description: "An array of arrays, where each inner array represents a row of data.",
            },
          },
          required: ["headers", "rows"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed data matches the expected structure.
    if (!parsedData.headers || !Array.isArray(parsedData.headers) || !parsedData.rows || !Array.isArray(parsedData.rows)) {
        throw new Error("The API returned data in an unexpected format.");
    }
    
    return parsedData as ExtractedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to extract data from image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while processing the image.");
  }
};