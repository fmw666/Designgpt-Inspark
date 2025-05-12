"""Model factory implementation."""

from typing import Dict, Type
from .base import ModelFactory, ModelType, ModelConfig, AIModel
from .openai_model import OpenAIModel
from .doubao_model import DoubaoModel

class DefaultModelFactory(ModelFactory):
    """Default implementation of the model factory."""
    
    def __init__(self):
        """Initialize the model factory."""
        self._model_classes: Dict[ModelType, Type[AIModel]] = {
            ModelType.OPENAI: OpenAIModel,
            ModelType.DOUBAO: DoubaoModel,
            # Add other model implementations here
        }
    
    def create_model(self, model_type: ModelType, config: ModelConfig) -> AIModel:
        """Create an AI model instance.
        
        Args:
            model_type: The type of model to create.
            config: The model configuration.
            
        Returns:
            An instance of the requested model.
            
        Raises:
            ValueError: If the model type is not supported.
        """
        model_class = self._model_classes.get(model_type)
        if not model_class:
            raise ValueError(f"Unsupported model type: {model_type}")
        
        return model_class(config)

# Create a singleton instance
model_factory = DefaultModelFactory() 