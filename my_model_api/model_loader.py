import torch
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from torchvision.models.detection.faster_rcnn import FastRCNNPredictor

def load_model(model_path):
    # Define the model architecture
    model = fasterrcnn_resnet50_fpn(pretrained=False)
    num_classes = 3  # 'without_mask', 'with_mask', 'mask_worn_incorrectly'
    in_features = model.roi_heads.box_predictor.cls_score.in_features
    model.roi_heads.box_predictor = FastRCNNPredictor(in_features, num_classes)

    # Load trained weights
    model.load_state_dict(torch.load(model_path, map_location='cpu'))
    model.eval()  # Set model to evaluation mode
    return model