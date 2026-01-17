// api/transcribe.js
export const config = {
    api: {
        bodyParser: false, // Keep this false to handle the raw image stream
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const SPACE_URL = "https://cosmicshubham-ancient-document-digitizer.hf.space/call/predict";

        // Read the request stream (image data) into a buffer
        const buffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', (err) => reject(err));
        });

        // Convert buffer condition to base64 data URI
        const mimeType = req.headers["content-type"] || "image/jpeg";
        const base64Image = `data:${mimeType};base64,${buffer.toString('base64')}`;

        // Call the Gradio Space API
        const response = await fetch(SPACE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [base64Image]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gradio API Error: ${response.status} - ${errorText}`);
            return res.status(response.status).json({ error: `AI Space Error: ${response.statusText}`, details: errorText });
        }

        const result = await response.json();

        // Gradio returns { event_id: "...", data: ["Result Text"] }
        if (result.data && result.data.length > 0) {
            return res.status(200).json([{ generated_text: result.data[0] }]);
        } else {
            return res.status(200).json([{ generated_text: "No text recognized." }]);
        }

    } catch (error) {
        console.error("API Route Error:", error);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
}