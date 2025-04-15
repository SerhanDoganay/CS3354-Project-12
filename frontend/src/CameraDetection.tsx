import React, { useState, useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

interface CameraDetectionProps {
  onIngredientsDetected: (ingredients: string[]) => void;
}

const CameraDetection: React.FC<CameraDetectionProps> = ({ onIngredientsDetected }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLabels, setDetectedLabels] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expanded ingredients list with categories
  const knownIngredients = {
    fruits: new Set([
      'orange', 'apple', 'banana', 'lemon', 'grape', 'strawberry',
      'blueberry', 'raspberry', 'mango', 'pineapple', 'pear', 'avocado'
    ]),
    vegetables: new Set([
      'tomato', 'onion', 'garlic', 'lettuce', 'carrot', 'potato', 'cucumber',
      'bell pepper', 'broccoli', 'spinach', 'celery', 'mushroom', 'zucchini', 'cabbage', 'cauliflower'
    ]),
    proteins: new Set([
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'egg',
      'tofu', 'meat', 'protein', 'poultry'
    ]),
    pantry: new Set([
      'rice', 'pasta', 'bread', 'flour', 'sugar', 'salt', 'pepper', 'oil',
      'vinegar', 'sauce', 'spice', 'herb', 'grain'
    ])
  };

  // More comprehensive synonym mapping
  const ingredientSynonyms = {
    'orange': ['citrus', 'citrus fruit', 'mandarin', 'tangerine', 'clementine'],
    'bell pepper': ['pepper', 'capsicum', 'sweet pepper'],
    'onion': ['green onion', 'scallion', 'spring onion', 'red onion', 'white onion'],
    'potato': ['potatoes', 'spud', 'sweet potato', 'yam'],
    'tomato': ['tomatoes', 'cherry tomato', 'roma tomato'],
    'carrot': ['carrots', 'baby carrot'],
    'apple': ['green apple', 'red apple', 'fruit']
  };

  const findIngredient = (label: string): string | null => {
    label = label.toLowerCase();
    
    // Check direct matches in all categories
    for (const [category, ingredients] of Object.entries(knownIngredients)) {
      if (ingredients.has(label)) {
        return label;
      }
    }

    // Check synonyms
    for (const [mainIngredient, synonyms] of Object.entries(ingredientSynonyms)) {
      if (synonyms.includes(label)) {
        return mainIngredient;
      }
    }

    return null;
  };

  const analyzeImageWithGoogleVision = async (imageFile: File) => {
    const apiKey = process.env.REACT_APP_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud API key not found');
    }

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const requestBody = {
        requests: [{
          image: { content: base64Image },
          features: [
            { 
              type: 'OBJECT_LOCALIZATION', 
              maxResults: 50  // Increased for multiple objects
            },
            { 
              type: 'LABEL_DETECTION', 
              maxResults: 50
            }
          ]
        }]
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const detectedItems = new Set<string>();
      const allDetectedLabels: string[] = [];

      // Process labels with special handling for fruits
      data.responses[0].labelAnnotations?.forEach((label: { description: string, score: number }) => {
        const name = label.description.toLowerCase();
        allDetectedLabels.push(`${name} (${(label.score * 100).toFixed(1)}%)`);
        
        // Special handling for fruits - lower threshold
        if (knownIngredients.fruits.has(name) && label.score > 0.4) {
          detectedItems.add(name);
        } else if (label.score > 0.5) { // Standard threshold for non-fruits
          const ingredient = findIngredient(name);
          if (ingredient) {
            detectedItems.add(ingredient);
          }
        }
      });

      // Process objects with special handling for fruits
      data.responses[0].localizedObjectAnnotations?.forEach((obj: { name: string, score: number }) => {
        const name = obj.name.toLowerCase();
        allDetectedLabels.push(`${name} (${(obj.score * 100).toFixed(1)}%)`);
        
        // Special handling for fruits - lower threshold
        if (knownIngredients.fruits.has(name) && obj.score > 0.4) {
          detectedItems.add(name);
        } else if (obj.score > 0.5) { // Standard threshold for non-fruits
          const ingredient = findIngredient(name);
          if (ingredient) {
            detectedItems.add(ingredient);
          }
        }
      });

      // Update detected labels for display
      setDetectedLabels(allDetectedLabels);

      console.log('Detected items:', Array.from(detectedItems)); // Debug log
      return Array.from(detectedItems);

    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
};

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setDetectedLabels([]);
    
    if (!file) return;

    setProcessing(true);
    try {
      const detectedIngredients = await analyzeImageWithGoogleVision(file);
      onIngredientsDetected(detectedIngredients);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error processing image:', errorMessage);
      setError(errorMessage);
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
        id="camera-input"
      />
      
      <div className="flex gap-2">
        <label
          htmlFor="camera-input"
          className="flex-1 flex items-center justify-center p-3 rounded-lg space-x-2 transition-all hover:scale-105 cursor-pointer"
          style={{ backgroundColor: '#B7B7A4' }}
        >
          <Camera className="w-6 h-6" />
          <span>Take Photo</span>
        </label>

        <label
          htmlFor="camera-input"
          className="flex-1 flex items-center justify-center p-3 rounded-lg space-x-2 transition-all hover:scale-105 cursor-pointer"
          style={{ backgroundColor: '#B7B7A4' }}
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
              fileInputRef.current.setAttribute('capture', 'environment');
            }
          }}
        >
          <Upload className="w-6 h-6" />
          <span>Upload Photo</span>
        </label>
      </div>

      {processing && (
        <div className="mt-4 flex items-center justify-center space-x-2 p-4 rounded-lg" 
             style={{ backgroundColor: '#FFE8D6' }}>
          <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse"></div>
          <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse delay-100"></div>
          <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse delay-200"></div>
          <span className="ml-2 text-gray-800">Processing image...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <p className="font-bold">Error Details:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CameraDetection;