"""Base interfaces and types for AI models.

This module defines the core interfaces and types used across all AI model implementations.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from enum import Enum
from typing import Optional, List, Dict, Any, Union, Protocol, TypeVar, Generic

T = TypeVar('T')

class ModelType(Enum):
    """Enumeration of supported model types."""
    OPENAI = "openai"
    DOUBAO = "doubao"
    STABLE_DIFFUSION = "stable_diffusion"
    MIDJOURNEY = "midjourney"

class ContentType(Enum):
    """Enumeration of content types."""
    TEXT = "text"
    IMAGE = "image"

@dataclass
class ModelConfig:
    """Configuration for AI models.
    
    Attributes:
        api_key: The API key for authentication.
        api_secret: Optional API secret for additional security.
        endpoint: Optional custom API endpoint.
        region: Optional service region.
        service: Optional service name.
        host: Optional host name.
        default_model: Optional default model to use.
    """
    api_key: str
    api_secret: Optional[str] = None
    endpoint: Optional[str] = None
    region: Optional[str] = None
    service: Optional[str] = None
    host: Optional[str] = None
    default_model: Optional[str] = None

@dataclass
class GenerationRequest:
    """Request parameters for content generation.
    
    Attributes:
        prompt: The input prompt for generation.
        model: Optional model to use.
        negative_prompt: Optional negative prompt.
        width: Optional image width.
        height: Optional image height.
        steps: Optional number of generation steps.
        seed: Optional random seed.
        cfg_scale: Optional classifier-free guidance scale.
        image_url: Optional input image URL.
        mask_url: Optional mask image URL.
        strength: Optional strength parameter.
    """
    prompt: str
    model: Optional[str] = None
    negative_prompt: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    steps: Optional[int] = None
    seed: Optional[int] = None
    cfg_scale: Optional[float] = None
    image_url: Optional[str] = None
    mask_url: Optional[str] = None
    strength: Optional[float] = None

@dataclass
class ContentChunk:
    """A chunk of generated content.
    
    Attributes:
        type: The type of content (text or image).
        content: The actual content (text or image URL).
        metadata: Optional metadata about the chunk.
    """
    type: ContentType
    content: str
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class GenerationResponse:
    """Response from content generation.
    
    Attributes:
        success: Whether the generation was successful.
        chunks: List of generated content chunks.
        error: Optional error message.
        request_id: Optional request ID.
        metadata: Optional metadata about the generation.
    """
    success: bool
    chunks: List[ContentChunk]
    error: Optional[str] = None
    request_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ContentCallback(Protocol):
    """Protocol for content callbacks."""
    async def __call__(self, chunk: ContentChunk) -> None:
        """Handle a content chunk.
        
        Args:
            chunk: The content chunk to handle.
        """
        ...

class AIModel(ABC, Generic[T]):
    """Abstract base class for AI models.
    
    This class defines the interface that all AI models must implement.
    """
    
    @abstractmethod
    async def generate(
        self,
        request: GenerationRequest,
        callback: Optional[ContentCallback] = None
    ) -> GenerationResponse:
        """Generate content based on the request.
        
        Args:
            request: The generation request parameters.
            callback: Optional callback for streaming content.
            
        Returns:
            A GenerationResponse containing the generation results.
            
        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError("Subclasses must implement generate()")

    @abstractmethod
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available models.
        
        Returns:
            A list of dictionaries containing model information.
            
        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError("Subclasses must implement get_available_models()")

    @abstractmethod
    def supports_streaming(self, model: str) -> bool:
        """Check if the specified model supports streaming.
        
        Args:
            model: The model identifier.
            
        Returns:
            True if the model supports streaming, False otherwise.
            
        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError("Subclasses must implement supports_streaming()")

class ModelFactory(ABC):
    """Abstract factory for creating AI model instances."""
    
    @abstractmethod
    def create_model(self, model_type: ModelType, config: ModelConfig) -> AIModel:
        """Create an AI model instance.
        
        Args:
            model_type: The type of model to create.
            config: The model configuration.
            
        Returns:
            An instance of the requested model.
            
        Raises:
            NotImplementedError: If the method is not implemented.
        """
        raise NotImplementedError("Subclasses must implement create_model()") 