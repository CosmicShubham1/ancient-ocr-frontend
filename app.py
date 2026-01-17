import gradio as gr
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as T
import os

# --- Model Definition (Copied from inference.py) ---
class CRNN(nn.Module):
    """CRNN model for sequence recognition"""
    def __init__(self, num_classes, hidden_size=128, num_layers=2):
        super(CRNN, self).__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=(2, 2), stride=(2, 1), padding=(0, 1)),
            nn.Conv2d(256, 512, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, stride=1, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=(2, 2), stride=(2, 1), padding=(0, 1)),
        )
        self.rnn = nn.LSTM(
            input_size=512 * 4,
            hidden_size=hidden_size,
            num_layers=num_layers,
            bidirectional=True,
            batch_first=True,
            dropout=0.3 if num_layers > 1 else 0
        )
        self.fc = nn.Linear(hidden_size * 2, num_classes)
        
    def forward(self, x):
        conv = self.cnn(x)
        batch, channels, height, width = conv.size()
        conv = conv.permute(0, 3, 1, 2)
        conv = conv.reshape(batch, width, channels * height)
        rnn_out, _ = self.rnn(conv)
        output = self.fc(rnn_out)
        return output

def ctc_decode(predictions, idx_to_char, blank_idx=0):
    """Decode CTC predictions"""
    decoded_texts = []
    _, max_indices = torch.max(predictions, dim=2)
    for sequence in max_indices:
        decoded = []
        previous = None
        for idx in sequence:
            idx = idx.item()
            if idx != blank_idx and idx != previous:
                decoded.append(idx_to_char.get(idx, '<unk>'))
            previous = idx
        decoded_texts.append(''.join(decoded))
    return decoded_texts

# --- Inference Logic ---
def load_model_custom(checkpoint_path, device='cpu'):
    if not os.path.exists(checkpoint_path):
        # Fallback: Try to download dynamically if not present (optional, but good for Spaces)
        pass

    checkpoint = torch.load(checkpoint_path, map_location=device)
    num_classes = len(checkpoint['vocab'])
    model = CRNN(num_classes=num_classes, hidden_size=256, num_layers=2)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()
    return model, checkpoint['idx_to_char']

def predict(image):
    if image is None:
        return "No image provided"
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Ensure simplified loading for the Space
    MODEL_PATH = "best_model.pth"
    if not os.path.exists(MODEL_PATH):
        return "Error: best_model.pth not found. Please upload it to the Space."

    try:
        model, idx_to_char = load_model_custom(MODEL_PATH, device)
        
        transform = T.Compose([
            T.Resize((64, 256)),
            T.ToTensor(),
            T.Normalize(mean=[0.5], std=[0.5])
        ])
        
        # Convert to grayscale
        image = image.convert('L')
        # Transform
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            output = model(image_tensor)
            prediction = ctc_decode(output, idx_to_char)[0]
            
        return prediction
    except Exception as e:
        return f"Error during prediction: {str(e)}"

# --- Interface ---
iface = gr.Interface(
    fn=predict, 
    inputs=gr.Image(type="pil", label="Upload Manuscript"), 
    outputs="text",
    title="Ancient Manuscript OCR",
    description="Upload an image of an ancient manuscript to transcribe it."
)

if __name__ == "__main__":
    iface.launch()
