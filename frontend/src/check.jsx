import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const Check = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setResult(null);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("⚠️ Please upload an image first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.error) {
        alert(`❌ ${response.data.error}`);
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("❌ Failed to process image. Please check the backend console for errors.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-page">
      <h1>KYC Document Verification</h1>
      <p>Upload an Aadhaar, PAN, or ID image to extract its details.</p>

      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </div>

      {result && !result.error && (
        <div className="result-box">
          <h2>✅ Extracted Details</h2>
          <p><b>Name:</b> {result.Name}</p>
          <p><b>DOB:</b> {result.DOB}</p>
          <p><b>Gender:</b> {result.Gender}</p>
          <p><b>Aadhaar Number:</b> {result["Aadhaar Number"]}</p>
          <p><b>Address:</b> {result.Address}</p>
        </div>
      )}
    </div>
  );
};

export default Check;
