// script.js
import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/+esm";

// DOM Elements
const dropArea = document.getElementById('dropArea');
const imageInput = document.getElementById('imageInput');
const previewArea = document.getElementById('previewArea');
const imagePreview = document.getElementById('imagePreview');
const removeBtn = document.getElementById('removeBtn');
const transcribeBtn = document.getElementById('transcribeBtn');
const resultSection = document.getElementById('resultSection');
const loader = document.getElementById('loader');
const outputContent = document.getElementById('outputContent');
const copyBtn = document.getElementById('copyBtn');

let currentFile = null;

// Event Listeners
dropArea.addEventListener('click', () => imageInput.click());

imageInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
});

dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

removeBtn.addEventListener('click', () => {
    currentFile = null;
    imageInput.value = '';
    dropArea.classList.remove('hidden');
    previewArea.classList.add('hidden');
    resultSection.classList.add('hidden');
});

transcribeBtn.addEventListener('click', handleTranscribe);

copyBtn.addEventListener('click', () => {
    const text = outputContent.innerText;
    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        });
    }
});

// Functions
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        alert("Please upload a valid image file.");
        return;
    }

    currentFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        dropArea.classList.add('hidden');
        previewArea.classList.remove('hidden');
        resultSection.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

async function handleTranscribe() {
    if (!currentFile) return;

    resultSection.classList.remove('hidden');
    loader.classList.remove('hidden');
    outputContent.classList.add('hidden');
    outputContent.innerText = '';
    resultSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const result = await transcribeManuscript(currentFile);

        loader.classList.add('hidden');
        outputContent.classList.remove('hidden');

        outputContent.innerText = result ? result : "No text count be recognized.";

    } catch (error) {
        console.error(error);
        loader.classList.add('hidden');
        outputContent.classList.remove('hidden');
        outputContent.innerHTML = `<span style="color: #ef4444;">${error.message || "An error occurred during transcription."}</span>`;
    }
}

async function transcribeManuscript(imageFile) {
    // Connect directly to the Space
    const app = await Client.connect("cosmicshubham/ancient-document-digitizer");

    // The predict function takes a generic blob/file object
    const result = await app.predict("/predict", [
        imageFile,
    ]);

    // Gradio client returns { data: [result] }
    return result.data[0];
}