"use client";

import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return alert("Select a file first");

    // Get Pre-Signed URL from API
    const response = await fetch("/api/generate-presigned-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
      }),
    });

    const { url } = await response.json();
    setUploadUrl(url);

    // Upload file directly to S3
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (uploadResponse.ok) {
      alert("File uploaded successfully!");
    } else {
      alert("Upload failed!");
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-white mb-4">Upload a File</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-white bg-gray-700 border border-gray-600 rounded p-2 cursor-pointer"
      />
      <button
        onClick={uploadFile}
        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-all"
      >
        Upload to S3
      </button>
      {uploadUrl && <p className="text-green-400 mt-2">Uploaded Successfully!</p>}
    </div>
  );
}
