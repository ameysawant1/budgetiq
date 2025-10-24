"use client";

import { useState } from "react";

interface ExtractedReceipt {
  extracted: {
    total: number;
    date: string;
    vendor: string;
  };
}

export default function ReceiptUploadPage() {
  const [uploadedReceipt, setUploadedReceipt] = useState<ExtractedReceipt | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload receipt
      const uploadRes = await fetch('/api/v1/receipts', {
        method: 'POST',
        body: formData
      });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        alert(uploadJson.error.message);
        return;
      }

      const receiptId = uploadJson.data.receipt.id;

      // Trigger OCR
      const ocrRes = await fetch('/api/v1/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId })
      });
      const ocrJson = await ocrRes.json();
      if (ocrJson.success) {
        setUploadedReceipt(ocrJson.data.receipt);
      } else {
        alert(ocrJson.error.message);
      }
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 p-8">
      <h1 className="text-2xl md:text-3xl font-semibold text-white mb-6">Receipt Upload</h1>

      <div className="bg-[#0f1114] rounded-lg p-12 border border-[#2a2730] flex flex-col items-center">
        <div className="text-4xl text-[#1e7f8c] mb-2">
          <i className="fas fa-cloud-upload-alt" />
        </div>
        <div className="text-gray-400 mb-2">Drop files here or click to browse</div>
        <div className="text-sm text-gray-500 mb-4">Supported formats: JPG, PNG, PDF</div>

        <label className="mt-2">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={loading}
          />
          <div className="px-4 py-2 bg-[#1e7f8c] text-white rounded cursor-pointer inline-flex items-center gap-2">
            <i className="fas fa-camera" />
            <span>{loading ? 'Processing...' : 'Upload Receipt'}</span>
          </div>
        </label>
      </div>

      {uploadedReceipt && (
        <div className="mt-6 bg-[#0f1114] rounded-lg p-6 border border-[#2a2730]">
          <h3 className="text-lg font-semibold text-white mb-4">Extracted Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-400">Total Amount</div>
              <div className="text-xl font-bold text-white">₹{uploadedReceipt.extracted.total.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Date</div>
              <div className="text-xl font-bold text-white">{uploadedReceipt.extracted.date}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Vendor</div>
              <div className="text-xl font-bold text-white">{uploadedReceipt.extracted.vendor}</div>
            </div>
          </div>
          <button
            onClick={() => {
              // Add to transactions
              const payload = {
                date: uploadedReceipt.extracted.date,
                amount: -uploadedReceipt.extracted.total,
                currency: 'INR',
                merchant: uploadedReceipt.extracted.vendor,
                category: '',
                notes: 'From receipt'
              };
              fetch('/api/v1/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              }).then(() => alert('Added to transactions'));
            }}
            className="mt-4 px-4 py-2 bg-[#1e7f8c] text-white rounded"
          >
            Add to Transactions
          </button>
        </div>
      )}
    </div>
  );
}
