from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import pytesseract
import re
from pymongo import MongoClient
from PIL import Image

#Flask setup
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

#Tesseract setup
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

#MongoDB connection
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["KYCDB"]
    collection = db["extracted"]
    print("✅ MongoDB connection successful")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

#OCR extraction
def extract_aadhaar_details(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            print("Could not read image file.")
            return None

        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        text = pytesseract.image_to_string(img)
        print("OCR Extracted Text:\n", text)

        # Regex extraction
        name = re.search(r"Name[:\s]*([A-Za-z ]+)", text)
        dob = re.search(r"DOB[:\s]*(\d{2}/\d{2}/\d{4})", text)
        gender = re.search(r"Gender[:\s]*(Male|Female)", text, re.IGNORECASE)
        aadhaar = re.search(r"(\d{4}\s\d{4}\s\d{4})", text)
        address = re.search(r"Address[:\s]*([A-Za-z0-9, ]+)", text)

        data = {
            "Name": name.group(1).strip() if name else "Not Found",
            "DOB": dob.group(1).strip() if dob else "Not Found",
            "Gender": gender.group(1).strip().capitalize() if gender else "Not Found",
            "Aadhaar Number": aadhaar.group(1).strip() if aadhaar else "Not Found",
            "Address": address.group(1).strip() if address else "Not Found"
        }

        # Store clean JSON in MongoDB
        inserted = collection.insert_one(data)
        print(f"Inserted document with ID: {inserted.inserted_id}")

        return data

    except Exception as e:
        print("Error in extract_aadhaar_details:", str(e))
        return None


@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "Empty file name"}), 400

        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        print(f"File saved at: {file_path}")

        # Extracting Aadhaar details
        extracted_data = extract_aadhaar_details(file_path)
        if extracted_data:
            
            if "_id" in extracted_data:
                del extracted_data["_id"]

            # Insert new document into MongoDB
            result = collection.insert_one(extracted_data)
            extracted_data["_id"] = str(result.inserted_id)

            print(f"Inserted document with ID: {result.inserted_id}")
            return jsonify(extracted_data), 200

        else:
            return jsonify({"error": "Failed to process image"}), 500

    except Exception as e:
        print("Error in /upload route:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
