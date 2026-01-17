const MODEL_ID = "cosmicshubham/ancient-manuscript-ocr";
const API_TOKEN = process.env.HF_TOKEN; // Provided by user

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
    imageInput.value = ''; // Reset input
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
        resultSection.classList.add('hidden'); // Hide previous results
    };
    reader.readAsDataURL(file);
}

async function handleTranscribe() {
    if (!currentFile) return;

    // Show Loader
    resultSection.classList.remove('hidden');
    loader.classList.remove('hidden');
    outputContent.classList.add('hidden');
    outputContent.innerText = '';

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });

    try {
        const result = await transcribeManuscript(currentFile);

        loader.classList.add('hidden');
        outputContent.classList.remove('hidden');

        // Handle API output format
        if (Array.isArray(result) && result[0] && result[0].generated_text) {
            outputContent.innerText = result[0].generated_text;
        } else if (result.error) {
            outputContent.innerHTML = `<span style="color: #ef4444;">Error: ${result.error}</span>`;
        } else {
            // Fallback for some models that return just the text or different structure
            outputContent.innerText = JSON.stringify(result, null, 2);
        }

    } catch (error) {
        console.error(error);
        loader.classList.add('hidden');
        outputContent.classList.remove('hidden');
        outputContent.innerHTML = `<span style="color: #ef4444;">Connection Error. Please check your internet or try again later.</span>`;
    }
}

async function transcribeManuscript(imageFile) {
    const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL_ID}`,
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: imageFile,
        }
    );
    const result = await response.json();
    return result;
}
