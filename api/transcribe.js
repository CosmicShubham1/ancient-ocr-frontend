export const config = {
    api: {
        bodyParser: false, // Disabling bodyParser allows us to stream the raw image data
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const API_TOKEN = process.env.HF_TOKEN;
        const MODEL_ID = "cosmicshubham/ancient-manuscript-ocr";

        if (!API_TOKEN) {
            throw new Error("HF_TOKEN is not defined in Vercel environment variables.");
        }

        // Forward the image data exactly as received
        const response = await fetch(
            `https://api-inference.huggingface.co/models/${MODEL_ID}`,
            {
                headers: {
                    Authorization: `Bearer ${API_TOKEN}`,
                    "Content-Type": req.headers["content-type"] || "application/octet-stream"
                },
                method: "POST",
                body: req, // This passes the raw incoming stream to Hugging Face
            }
        );

        const result = await response.json();
        return res.status(response.status).json(result);
    } catch (error) {
        console.error("API Error:", error.message);
        return res.status(500).json({ error: error.message });
    }
}