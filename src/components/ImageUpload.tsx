"use client";

import { useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Зураг",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload амжилтгүй");
      }

      onChange(data.url);
    } catch (err) {
      console.error(err);
      setError("Зураг upload хийхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {value && (
        <img
          src={value}
          alt="Урьдчилан харах"
          className="w-32 h-32 object-cover rounded-md border"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm border rounded-md p-2"
      />

      {uploading && (
        <p className="text-sm text-gray-500">Зураг upload хийж байна...</p>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
