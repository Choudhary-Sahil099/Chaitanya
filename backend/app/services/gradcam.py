
import torch
import torch.nn.functional as F
import numpy as np
import cv2

from app.services.model_loader import model_loader


class GradCAM:
    """Generate Grad-CAM visualizations for EfficientNet-B0."""

    def __init__(self):
        self.model = model_loader.model
        self.device = model_loader.device

        # Last convolutional feature layer
        self.target_layer = self.model.features[-1]

        self.activations = None
        self.gradients = None

        self.target_layer.register_forward_hook(
            self._save_activation
        )

        self.target_layer.register_full_backward_hook(
            self._save_gradient
        )

    def _save_activation(self, module, input, output):
        self.activations = output

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate(self, image_tensor, target_class=None):
        """
        Generate a normalized Grad-CAM heatmap.

        image_tensor shape: [1, 3, 224, 224]
        """

        self.model.eval()
        image_tensor = image_tensor.to(self.device)

        self.activations = None
        self.gradients = None

        # Enable gradients even during inference
        with torch.enable_grad():
            self.model.zero_grad(set_to_none=True)

            logits = self.model(image_tensor)

            if target_class is None:
                target_class = logits.argmax(dim=1).item()

            score = logits[:, target_class].sum()

            if self.activations is None:
                raise RuntimeError("Grad-CAM activations unavailable.")

            gradients = torch.autograd.grad(
                outputs=score,
                inputs=self.activations,
                retain_graph=False,
                create_graph=False
            )[0]

        # Channel-wise gradient weights
        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        # Weighted combination of feature maps
        cam = torch.sum(
            weights * self.activations,
            dim=1,
            keepdim=True
        )

        cam = F.relu(cam)

        # Resize to input image dimensions
        cam = F.interpolate(
            cam,
            size=(224, 224),
            mode="bilinear",
            align_corners=False
        )

        cam = cam[0, 0].detach().cpu().numpy()

        # Normalize to [0, 1]
        cam_min = cam.min()
        cam_max = cam.max()

        if cam_max - cam_min > 1e-8:
            cam = (cam - cam_min) / (cam_max - cam_min)
        else:
            cam = np.zeros_like(cam)

        heatmap = np.uint8(255 * cam)

        heatmap_color = cv2.applyColorMap(
            heatmap,
            cv2.COLORMAP_JET
        )

        return heatmap_color, cam


# Shared Grad-CAM instance
gradcam_service = GradCAM()
