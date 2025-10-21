
import { GoogleGenAI, Modality } from "@google/genai";
import { ImageData } from "./types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is provided.
  console.warn("API_KEY environment variable is not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates a mockup image using Imagen 2.
 * @param prompt The text prompt describing the mockup.
 * @returns A base64 encoded string of the generated JPEG image.
 */
export const generateMockup = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error("Image generation failed. The response was empty.");
  }

  return response.generatedImages[0].image.imageBytes;
};

/**
 * Places a logo onto a mockup image using Gemini 2.5 Flash Image.
 * @param mockupBase64 The base64 string of the mockup JPEG.
 * @param logo The ImageData object for the logo.
 * @param mockupDescription The original prompt for the mockup.
 * @returns A base64 encoded string of the resulting JPEG image.
 */
export const placeLogoOnMockup = async (
  mockupBase64: string,
  logo: ImageData,
  mockupDescription: string
): Promise<string> => {
  const promptText = `Seamlessly place the logo from the second image onto the ${mockupDescription} in the first image. The logo should look natural and follow the contours and lighting of the object. Preserve the background of the first image. Do not add any text or annotations.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: mockupBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          inlineData: {
            data: logo.base64,
            mimeType: logo.mimeType,
          },
        },
        {
          text: promptText,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }

  throw new Error("Failed to place logo on mockup. The model did not return an image.");
};

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * @param imageBase64 The base64 string of the image to edit.
 * @param prompt The text prompt describing the edit.
 * @returns A base64 encoded string of the edited JPEG image.
 */
export const editImage = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg',
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
    return firstPart.inlineData.data;
  }

  throw new Error("Failed to edit image. The model did not return an image.");
};
