import React, { useState } from 'react';
import ImageKit from 'imagekit-javascript';
import { Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  maxFiles?: number;
}

export default function ImageUpload({ onUploadSuccess, maxFiles = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ik = new ImageKit({
    publicKey: (import.meta as any).env.VITE_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: (import.meta as any).env.VITE_IMAGEKIT_ENDPOINT,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Max 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Fetch auth params from our backend
      const authResponse = await fetch('/api/imagekit/auth');
      const authData = await authResponse.json();

      if (!authResponse.ok) throw new Error("Authentication failed");

      // 2. Perform upload with auth params
      ik.upload({
        file: file,
        fileName: `business_${Date.now()}_${file.name.replace(/\s+/g, '_')}`,
        folder: "/businesses",
        useUniqueFileName: true,
        signature: authData.signature,
        token: authData.token,
        expire: authData.expire,
      }, (err: any, result: any) => {
        setUploading(false);
        if (err) {
          setError("Upload failed. Please try again.");
          console.error(err);
        } else {
          onUploadSuccess(result.url);
        }
      });
    } catch (err) {
      setUploading(false);
      setError("Upload failed. please try again.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-widest text-stone-400">Business Photos (Max {maxFiles})</label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="w-24 h-24 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition-colors">
          {uploading ? (
            <Loader2 className="animate-spin text-emerald-600" size={24} />
          ) : (
            <>
              <Camera className="text-stone-300" size={24} />
              <span className="text-[10px] font-bold text-stone-400 mt-1">Add Photo</span>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        </label>
      </div>

      {error && <p className="text-red-500 text-[10px] font-bold">{error}</p>}
    </div>
  );
}
