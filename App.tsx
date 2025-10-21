
import React, { useState, useCallback, useMemo } from 'react';
import { AppStep, ImageData } from './types';
import { fileToImageData } from './utils/fileUtils';
import { generateMockup, placeLogoOnMockup, editImage } from './services/geminiService';

// --- Helper & Icon Components (defined outside App to prevent re-creation on re-renders) ---

const MagicWandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v1.121l1.17.585A1 1 0 0114 4.5v.025l1.496 2.992a1 1 0 01-.33 1.11l-1.789 1.789a1 1 0 01-1.414 0l-1.79-1.789a1 1 0 01-.33-1.11L11 4.525V4.5a1 1 0 01.17-.585L12 3.12V2a1 1 0 01-.7-.954zM5.3 5.046A1 1 0 016 6v1.121l1.17.585A1 1 0 018 8.5v.025l1.496 2.992a1 1 0 01-.33 1.11l-1.789 1.789a1 1 0 01-1.414 0l-1.79-1.789a1 1 0 01-.33-1.11L5 8.525V8.5a1 1 0 01.17-.585L6 7.12V6a1 1 0 01-.7-.954zM11.5 10a1 1 0 011 1v1.121l1.17.585A1 1 0 0114.5 13.5v.025l1.496 2.992a1 1 0 01-.33 1.11l-1.789 1.789a1 1 0 01-1.414 0l-1.79-1.789a1 1 0 01-.33-1.11L11.5 13.525V13.5a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const Spinner = () => (
  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg z-10">
    <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-600 rounded-full animate-spin"></div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);


// --- Step Components ---

interface GenerateStepProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}
const GenerateStep: React.FC<GenerateStepProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('A high-quality photo of a blank white t-shirt on a hanger against a clean wall');
  const examples = ["A black coffee mug on a rustic wooden table", "A canvas tote bag lying on a sandy beach", "A white baseball cap, front view"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onGenerate(prompt.trim());
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in">
      <h2 className="text-2xl font-bold text-center mb-1">Step 1: Create Your Mockup</h2>
      <p className="text-gray-400 text-center mb-6">Describe the product you want to create a mockup for.</p>
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg relative">
        {isLoading && <Spinner />}
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A high-quality photo of a blank white t-shirt..."
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 resize-none h-28"
            disabled={isLoading}
          />
          <div className="mt-4 text-sm text-gray-400">Examples:</div>
          <div className="flex flex-wrap gap-2 mt-2 mb-6">
            {examples.map(ex => (
              <button key={ex} type="button" onClick={() => setPrompt(ex)} className="bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 px-3 py-1 rounded-full transition" disabled={isLoading}>{ex}</button>
            ))}
          </div>
          <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed">
            <MagicWandIcon /> Generate Mockup
          </button>
        </form>
      </div>
    </div>
  );
};

interface UploadStepProps {
    mockupImage: ImageData;
    onPlaceLogo: (logoFile: File) => void;
    isLoading: boolean;
}
const UploadStep: React.FC<UploadStepProps> = ({ mockupImage, onPlaceLogo, isLoading }) => {
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const logoPreviewUrl = useMemo(() => logoFile ? URL.createObjectURL(logoFile) : null, [logoFile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (logoFile) onPlaceLogo(logoFile);
    };

    return (
        <div className="w-full max-w-4xl animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-1">Step 2: Add Your Logo</h2>
            <p className="text-gray-400 text-center mb-6">Upload a logo to place on your generated mockup.</p>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold mb-4 text-center">Your Mockup</h3>
                    <div className="aspect-square w-full bg-gray-900 rounded-lg overflow-hidden relative">
                        {isLoading && <Spinner />}
                        <img src={mockupImage.url} alt="Generated mockup" className="w-full h-full object-cover" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-center">Upload Logo</h3>
                        <label htmlFor="logo-upload" className="cursor-pointer w-full aspect-square bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 transition">
                            {logoPreviewUrl ? (
                                <img src={logoPreviewUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-4"/>
                            ) : (
                                <div className="text-center">
                                    <UploadIcon />
                                    <p className="mt-2 text-sm text-gray-400">Click to upload</p>
                                    <p className="text-xs text-gray-500">PNG with transparency recommended</p>
                                </div>
                            )}
                        </label>
                        <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
                    </div>
                     <button onClick={handleSubmit} disabled={isLoading || !logoFile} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        Place Logo on Mockup
                    </button>
                </div>
            </div>
        </div>
    );
};


interface EditStepProps {
    image: ImageData;
    onEdit: (prompt: string) => void;
    onReset: () => void;
    isLoading: boolean;
}
const EditStep: React.FC<EditStepProps> = ({ image, onEdit, onReset, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) onEdit(prompt.trim());
    };

    return (
        <div className="w-full max-w-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-1">Step 3: Final Edits</h2>
            <p className="text-gray-400 text-center mb-6">Use text to make final adjustments to your mockup.</p>
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="aspect-square w-full bg-gray-900 rounded-lg overflow-hidden mb-6 relative">
                    {isLoading && <Spinner />}
                    <img src={image.url} alt="Final mockup with logo" className="w-full h-full object-cover" />
                </div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Add a retro filter, Change the background to a sunny park"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed">
                        Apply Edit
                    </button>
                </form>
                <button onClick={onReset} disabled={isLoading} className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50">
                    Start Over
                </button>
            </div>
        </div>
    );
};


// --- Main App Component ---

const App = () => {
    const [step, setStep] = useState<AppStep>('GENERATE');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mockupPrompt, setMockupPrompt] = useState('');
    const [mockupImage, setMockupImage] = useState<ImageData | null>(null);
    const [logoImage, setLogoImage] = useState<ImageData | null>(null);
    const [finalImage, setFinalImage] = useState<ImageData | null>(null);

    const handleApiCall = async <T,>(apiCall: () => Promise<T>, onSuccess: (result: T) => void) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            onSuccess(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateMockup = useCallback(async (prompt: string) => {
        setMockupPrompt(prompt);
        await handleApiCall(
            () => generateMockup(prompt),
            (base64) => {
                setMockupImage({ base64, mimeType: 'image/jpeg', url: `data:image/jpeg;base64,${base64}` });
                setStep('UPLOAD');
            }
        );
    }, []);

    const handlePlaceLogo = useCallback(async (logoFile: File) => {
        if (!mockupImage) return;
        const logoData = await fileToImageData(logoFile);
        setLogoImage(logoData);

        await handleApiCall(
            () => placeLogoOnMockup(mockupImage.base64, logoData, mockupPrompt),
            (base64) => {
                setFinalImage({ base64, mimeType: 'image/jpeg', url: `data:image/jpeg;base64,${base64}` });
                setStep('EDIT');
            }
        );
    }, [mockupImage, mockupPrompt]);

    const handleEditImage = useCallback(async (prompt: string) => {
        const imageToEdit = finalImage;
        if (!imageToEdit) return;
        
        await handleApiCall(
            () => editImage(imageToEdit.base64, prompt),
            (base64) => {
                setFinalImage({ base64, mimeType: 'image/jpeg', url: `data:image/jpeg;base64,${base64}` });
            }
        );
    }, [finalImage]);

    const handleReset = useCallback(() => {
        setStep('GENERATE');
        setMockupPrompt('');
        setMockupImage(null);
        setLogoImage(null);
        setFinalImage(null);
        setError(null);
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Mockup Magic AI
                    </span>
                </h1>
                <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
                    Generate product mockups, place your logo, and perfect it with AI-powered editing.
                </p>
            </header>
            
            <main className="w-full flex-grow flex items-center justify-center">
                {error && <ErrorDisplay message={error} />}
                {step === 'GENERATE' && !error && <GenerateStep onGenerate={handleGenerateMockup} isLoading={isLoading} />}
                {step === 'UPLOAD' && mockupImage && !error && <UploadStep mockupImage={mockupImage} onPlaceLogo={handlePlaceLogo} isLoading={isLoading} />}
                {step === 'EDIT' && finalImage && !error && <EditStep image={finalImage} onEdit={handleEditImage} onReset={handleReset} isLoading={isLoading} />}
            </main>

            <footer className="text-center text-gray-500 text-sm mt-12 pb-4">
                <p>Powered by Google Gemini & Imagen. Created for demonstration purposes.</p>
            </footer>
        </div>
    );
};

export default App;
