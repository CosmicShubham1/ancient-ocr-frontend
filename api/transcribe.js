// api/transcribe.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Vercel handles the API_TOKEN securely on the server side
        const MODEL_ID = "cosmicshubham/ancient-manuscript-ocr";
        const API_TOKEN = process.env.HF_TOKEN;

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: { Authorization: `Bearer ${API_TOKEN}` },
                method: "POST",
                body: req.body, // The image data sent from your script.js
            }
        );

        const result = await response.json();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}