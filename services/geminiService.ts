
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function to process the text-to-image response and extract image data
const processTextToImageResponse = (response: any): string[] => {
    if (!response.generatedImages || response.generatedImages.length === 0) {
        return [];
    }
    return response.generatedImages.map((img: any) => {
        const base64ImageBytes: string = img.image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    });
};

// Helper function to process the image-and-text-to-image response
const processImageEditingResponse = (response: any): string | null => {
    const parts = response?.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;
            return `data:${mimeType};base64,${base64ImageBytes}`;
        }
    }
    return null;
};

// Function to generate a single image using the multimodal model
const generateSingleImageWithProduct = async (prompt: string, mimeType: string, imageData: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageData,
                        mimeType: mimeType,
                    },
                },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const imageUrl = processImageEditingResponse(response);
    if (!imageUrl) {
        // It's possible the model just returns text if it can't fulfill the request.
        const textResponse = response.text?.trim();
        const errorMessage = textResponse
            ? `API returned text instead of an image: "${textResponse}"`
            : "API did not return an image from the editing model.";
        throw new Error(errorMessage);
    }
    return imageUrl;
};

// Main generation function
export const generateAffiliateImages = async (prompt: string, imageBase64: string | null): Promise<string[]> => {
  try {
    if (imageBase64) {
      // --- Case 1: Image is provided, use multimodal generation ---
      const match = imageBase64.match(/^data:(image\/.*?);base64,(.*)$/);
      if (!match) {
        throw new Error("Invalid base64 image format. Please upload a valid image.");
      }
      const [, mimeType, data] = match;

      // The image editing model generates one image at a time.
      // We run 6 requests in parallel to get 6 images.
      const generationPromises = Array(6).fill(0).map(() => 
        generateSingleImageWithProduct(prompt, mimeType, data)
      );
      
      const allGeneratedImages = await Promise.all(generationPromises);
      return allGeneratedImages.filter(img => img !== null) as string[];

    } else {
      // --- Case 2: No image provided, use text-to-image generation ---
      const commonConfig = {
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          aspectRatio: '9:16' as const,
          outputMimeType: 'image/jpeg' as const,
        },
      };
      
      // The API supports a maximum of 4 images per request.
      // To get 6 images, we make two parallel requests.
      const [response1, response2] = await Promise.all([
        ai.models.generateImages({
          ...commonConfig,
          config: { ...commonConfig.config, numberOfImages: 4 },
        }),
        ai.models.generateImages({
          ...commonConfig,
          config: { ...commonConfig.config, numberOfImages: 2 },
        }),
      ]);

      const images1 = processTextToImageResponse(response1);
      const images2 = processTextToImageResponse(response2);
      
      const allGeneratedImages = [...images1, ...images2];

      if (allGeneratedImages.length === 0) {
        throw new Error("The API did not return any images despite successful requests.");
      }
      return allGeneratedImages;
    }

  } catch (error) {
    console.error("Error generating images with Gemini API:", error);
    let errorMessage = "An unexpected error occurred while communicating with the Gemini API.";
    if (error instanceof Error) {
        // Attempt to parse a JSON error message from the API for better feedback
        try {
            const errorObj = JSON.parse(error.message);
            if (errorObj?.error?.message) {
                errorMessage = `API Error: ${errorObj.error.message}`;
            } else {
                 errorMessage = `Failed to generate images: ${error.message}`;
            }
        } catch (e) {
            errorMessage = `Failed to generate images: ${error.message}`;
        }
    }
    throw new Error(errorMessage);
  }
};
