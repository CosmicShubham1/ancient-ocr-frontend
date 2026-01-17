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
            console.error("HF_TOKEN is missing.");
            return res.status(500).json({ error: "Server configuration error: Missing API Token." });
        }

        // Read the request stream into a buffer
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', (err) => reject(err));
        });

        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": req.headers["content-type"] || "application/octet-stream"
                },
                method: "POST",
                body: buffer,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HF API Error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `AI Model Error: ${response.statusText}`, details: errorText });
        }

        const result = await response.json();
        return res.status(200).json(result);

    } catch (error) {
        console.error("API Route Error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}