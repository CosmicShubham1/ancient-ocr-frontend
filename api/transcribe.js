// api/transcribe.js
export const config = {
    api: {
        bodyParser: false, // Keep this false to handle the raw image stream
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const API_TOKEN = process.env.HF_TOKEN;
        const MODEL_ID = "cosmicshubham/ancient-manuscript-ocr";

        if (!API_TOKEN) {
            throw new Error("HF_TOKEN is missing in Vercel settings.");
        }

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": req.headers["content-type"] || "application/octet-stream"
                },
                method: "POST",
                body: req, // The incoming stream
                duplex: 'half' // <--- ADD THIS LINE TO FIX THE ERROR
            }
        );

        const result = await response.json();
        return res.status(response.status).json(result);
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}