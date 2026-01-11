import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createWorker } from 'tesseract.js';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

// Gemini Setup
const geminiApiKey = process.env.GEMINI_API_KEY;
let genAI;
let model;

if (geminiApiKey) {
    genAI = new GoogleGenerativeAI(geminiApiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Gemini AI initialized.");
} else {
    console.warn("WARNING: GEMINI_API_KEY not found in .env. Gemini features will be disabled.");
}

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Database setup
// We'll have a simple schema: { notes: [], captions: [], settings: {} }
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const defaultData = { notes: [], captions: [], settings: {} };
const db = new Low(adapter, defaultData);

// Initialize DB
await db.read();
db.data ||= defaultData;
await db.write();

// Load models
let objectDetectionModel;
(async () => {
    try {
        console.log('Loading TensorFlow model...');
        // Use the CPU backend
        await tf.setBackend('cpu');
        objectDetectionModel = await cocoSsd.load();
        console.log('TensorFlow model loaded.');
    } catch (e) {
        console.error('Failed to load TF model:', e);
    }
})();

// --- Endpoints ---

// 1. Image Analysis (Standard + Gemini)
// Helper to decode image
const decodeImage = (imagePath) => {
    const buffer = fs.readFileSync(imagePath);
    let pixels;
    let width, height;

    try {
        if (imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg')) {
            const decoded = jpeg.decode(buffer, { useTArray: true });
            pixels = decoded.data;
            width = decoded.width;
            height = decoded.height;
        } else if (imagePath.endsWith('.png')) {
            const png = PNG.sync.read(buffer);
            pixels = png.data;
            width = png.width;
            height = png.height;
        } else {
            // For simplicity, just return null and skip OD if unknown format
            return null;
        }

        // Convert to tensor (Height, Width, 3 channels) - drop Alpha if present
        const numChannels = 3;
        const values = new Int32Array(width * height * numChannels);

        for (let i = 0; i < width * height; i++) {
            values[i * numChannels + 0] = pixels[i * 4 + 0]; // R
            values[i * numChannels + 1] = pixels[i * 4 + 1]; // G
            values[i * numChannels + 2] = pixels[i * 4 + 2]; // B
            // Ignore Alpha
        }

        return tf.tensor3d(values, [height, width, numChannels]);
    } catch (e) {
        console.error("Error decoding image:", e);
        return null;
    }
};

// ...

// 1. Image Analysis
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const useGemini = req.body.useGemini === 'true'; // Check if client requests Gemini

    console.log(`Processing image: ${imagePath}, useGemini: ${useGemini}`);

    try {
        // Option A: Use Gemini if available and requested
        if (useGemini && model) {
            try {
                const imageData = fs.readFileSync(imagePath);
                const imageBase64 = imageData.toString('base64');

                const prompt = "Describe this image in detail for a visually impaired user. Focus on the main subjects, layout, colors, and any text present. Keep it concise but descriptive.";

                const result = await model.generateContent([
                    prompt,
                    {
                        inlineData: {
                            data: imageBase64,
                            mimeType: req.file.mimetype
                        }
                    }
                ]);
                const response = await result.response;
                const text = response.text();

                res.json({ description: text, source: 'gemini' });

                // Cleanup
                fs.unlinkSync(imagePath);
                return;

            } catch (geminiError) {
                console.error("Gemini Error:", geminiError);
                // Fallback to local analysis if Gemini fails
                console.log("Falling back to local TensorFlow/OCR analysis...");
            }
        }

        // Option B: Local Analysis (TensorFlow + Tesseract)
        let descriptionParts = [];

        // B1. Object Detection
        if (objectDetectionModel) {
            try {
                const tfImage = decodeImage(imagePath);

                if (tfImage) {
                    const predictions = await objectDetectionModel.detect(tfImage);
                    tfImage.dispose(); // Cleanup tensor

                    if (predictions.length > 0) {
                        const objects = [...new Set(predictions.map(p => p.class))].join(', ');
                        descriptionParts.push(`This image contains: ${objects}.`);
                    } else {
                        descriptionParts.push("No specific objects detected.");
                    }
                } else {
                    descriptionParts.push("Could not process image format for object detection.");
                }
            } catch (err) {
                console.error("Object detection error:", err);
            }
        } else {
            descriptionParts.push("Object detection model not ready.");
        }

        // B2. OCR (Text Recognition)
        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imagePath);
        await worker.terminate();

        if (text && text.trim().length > 0) {
            descriptionParts.push(`Text found in image: "${text.trim().replace(/\n/g, ' ')}".`);
        } else {
            descriptionParts.push("No text found.");
        }

        const fullDescription = descriptionParts.join(' ');
        res.json({ description: fullDescription, source: 'local' });

        // Cleanup uploaded file
        fs.unlinkSync(imagePath);

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// 1.5 Text Simplification (Gemini)
app.post('/api/simplify-text', async (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    if (!model) {
        return res.status(503).json({ error: 'Gemini service not available (API Key missing)' });
    }

    try {
        const prompt = `Simplify the following text for someone with cognitive learning difficulties (like Dyslexia or ADHD). 
        Make it easier to read, use simpler vocabulary, and break long sentences. 
        Keep the core meaning intact.
        
        Text to simplify:
        "${text}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const simplifiedText = response.text();

        res.json({ simplified: simplifiedText });
    } catch (error) {
        console.error("Simplification error:", error);
        res.status(500).json({ error: 'Failed to simplify text' });
    }
});

// 2. Speech Notes
app.get('/api/notes', async (req, res) => {
    await db.read();
    res.json(db.data.notes);
});

app.post('/api/notes', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });

    await db.read();
    const newNote = { id: Date.now().toString(), text, date: new Date().toISOString() };
    db.data.notes.push(newNote);
    await db.write();
    res.json(newNote);
});

// 3. Captions
app.get('/api/captions', async (req, res) => {
    await db.read();
    res.json(db.data.captions);
});

app.post('/api/captions', async (req, res) => {
    const { text, timestamp } = req.body;
    await db.read();
    const newCaption = { id: Date.now().toString(), text, timestamp: timestamp || new Date().toISOString() };
    db.data.captions.push(newCaption);
    await db.write();
    res.json(newCaption);
});

// 4. Settings
app.get('/api/settings', async (req, res) => {
    await db.read();
    res.json(db.data.settings);
});

app.post('/api/settings', async (req, res) => {
    const settings = req.body;
    await db.read();
    db.data.settings = { ...db.data.settings, ...settings };
    await db.write();
    res.json(db.data.settings);
});

// Serve the app just for testing if needed
// app.use(express.static('../app')); 

app.listen(port, () => {
    console.log(`Inclusive Backend running on http://localhost:${port}`);
    console.log(`Gemini integration: ${geminiApiKey ? 'ACTIVE' : 'INACTIVE (No API Key)'}`);
});
