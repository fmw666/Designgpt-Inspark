"""OpenAI model implementation."""

import json
import logging
from typing import Optional, List, Dict, Any
import aiohttp
from .base import (
    AIModel,
    ModelConfig,
    GenerationRequest,
    GenerationResponse,
    ContentChunk,
    ContentType,
    ContentCallback
)

logger = logging.getLogger(__name__)

class OpenAIModel(AIModel):
    """OpenAI model implementation."""
    
    def __init__(self, config: ModelConfig):
        """Initialize OpenAI model.
        
        Args:
            config: The model configuration.
        """
        self.config = config
        self.endpoint = config.endpoint or "https://api.piapi.ai/v1/chat/completions"
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self) -> "OpenAIModel":
        """Create aiohttp session when entering context."""
        self._session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Close aiohttp session when exiting context."""
        if self._session:
            await self._session.close()

    async def generate(
        self,
        request: GenerationRequest,
        callback: Optional[ContentCallback] = None
    ) -> GenerationResponse:
        """Generate content using OpenAI.
        
        Args:
            request: The generation request parameters.
            callback: Optional callback for streaming content.
            
        Returns:
            A GenerationResponse containing the generation results.
        """
        try:
            if not self._session:
                self._session = aiohttp.ClientSession()

            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.config.api_key}"
            }
            
            payload = {
                "model": request.model or "gpt-4o-image",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": request.prompt
                            }
                        ]
                    }
                ],
                "stream": callback is not None
            }

            async with self._session.post(self.endpoint, headers=headers, json=payload) as response:
                if not response.ok:
                    error_data = await response.json()
                    logger.error(f"OpenAI API error: {error_data}")
                    return GenerationResponse(
                        success=False,
                        chunks=[],
                        error=error_data.get("message", f"API error: {response.status}")
                    )

                if callback:
                    return await self._handle_stream(response, callback)
                else:
                    data = await response.json()
                    return self._process_response(data)

        except Exception as e:
            logger.exception("Error in OpenAI generation")
            return GenerationResponse(
                success=False,
                chunks=[],
                error=str(e)
            )

    async def _handle_stream(
        self,
        response: aiohttp.ClientResponse,
        callback: ContentCallback
    ) -> GenerationResponse:
        """Handle streaming response from OpenAI.
        
        Args:
            response: The HTTP response.
            callback: The callback for streaming content.
            
        Returns:
            A GenerationResponse containing the generation results.
        """
        chunks: List[ContentChunk] = []
        
        async for line in response.content:
            if line.startswith(b"data: "):
                data = line[6:].decode()
                if data == "[DONE]":
                    break
                
                try:
                    parsed = json.loads(data)
                    if parsed["choices"][0]["delta"]["content"]:
                        content = parsed["choices"][0]["delta"]["content"]
                        
                        if "https://storage.theapi.app/image/" in content:
                            image_match = content.match(r"https://storage\.theapi\.app/image/[^)]+")
                            if image_match:
                                chunk = ContentChunk(
                                    type=ContentType.IMAGE,
                                    content=image_match[0]
                                )
                                chunks.append(chunk)
                                await callback(chunk)
                        else:
                            chunk = ContentChunk(
                                type=ContentType.TEXT,
                                content=content
                            )
                            chunks.append(chunk)
                            await callback(chunk)
                except Exception as e:
                    logger.error(f"Error parsing chunk: {e}")

        return GenerationResponse(
            success=True,
            chunks=chunks
        )

    def _process_response(self, data: Dict[str, Any]) -> GenerationResponse:
        """Process non-streaming response from OpenAI.
        
        Args:
            data: The response data.
            
        Returns:
            A GenerationResponse containing the generation results.
        """
        if "choices" in data and len(data["choices"]) > 0:
            content = data["choices"][0]["message"]["content"]
            return GenerationResponse(
                success=True,
                chunks=[
                    ContentChunk(
                        type=ContentType.TEXT,
                        content=content
                    )
                ]
            )
        return GenerationResponse(
            success=False,
            chunks=[],
            error="Invalid response format"
        )

    def get_available_models(self) -> List[Dict[str, Any]]:
        """Get list of available OpenAI models.
        
        Returns:
            A list of dictionaries containing model information.
        """
        return [
            {
                "id": "gpt-4o-image",
                "name": "GPT-4 with Image Generation",
                "description": "Advanced model with image generation capabilities",
                "max_images": 1,
                "category": "OpenAI"
            }
        ]

    def supports_streaming(self, model: str) -> bool:
        """Check if the specified model supports streaming.
        
        Args:
            model: The model identifier.
            
        Returns:
            True if the model supports streaming, False otherwise.
        """
        # OpenAI models always support streaming
        return True 