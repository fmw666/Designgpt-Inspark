"""Doubao model implementation."""

import json
import logging
import hashlib
import hmac
import urllib.parse
import datetime
from typing import Optional, List, Dict, Any
import aiohttp
from base import (
    AIModel,
    ModelConfig,
    GenerationRequest,
    GenerationResponse,
    ContentChunk,
    ContentType,
    ContentCallback
)

logger = logging.getLogger(__name__)

# Doubao model definitions
DOUBAO_MODELS = [
    {
        "id": "high_aes_general_v21_L",
        "name": "通用2.1-文生图",
        "description": "最新的通用文生图模型，支持多种风格和场景",
        "max_images": 4,
        "category": "豆包",
        "demo": {
            "prompt": "一只可爱的熊猫在竹林中玩耍，水彩风格",
            "images": [
                "https://picsum.photos/seed/doubao1/512/512",
                "https://picsum.photos/seed/doubao2/512/512",
                "https://picsum.photos/seed/doubao3/512/512",
                "https://picsum.photos/seed/doubao4/512/512",
            ],
        },
    },
    {
        "id": "high_aes_general_v20_L",
        "name": "通用2.0Pro-文生图",
        "description": "专业版通用文生图模型，提供更高质量的输出",
        "max_images": 4,
        "category": "豆包",
        "demo": {
            "prompt": "一片樱花林，水彩风格，柔和的粉色和白色",
            "images": [
                "https://picsum.photos/seed/doubao-pro1/512/512",
                "https://picsum.photos/seed/doubao-pro2/512/512",
                "https://picsum.photos/seed/doubao-pro3/512/512",
                "https://picsum.photos/seed/doubao-pro4/512/512",
            ],
        },
    },
    {
        "id": "high_aes_general_v20",
        "name": "通用2.0-文生图",
        "description": "标准版通用文生图模型，适合日常使用",
        "max_images": 4,
        "category": "豆包",
        "demo": {
            "prompt": "一幅山水画，国画风格，云雾缭绕",
            "images": [
                "https://picsum.photos/seed/doubao-std1/512/512",
                "https://picsum.photos/seed/doubao-std2/512/512",
                "https://picsum.photos/seed/doubao-std3/512/512",
                "https://picsum.photos/seed/doubao-std4/512/512",
            ],
        },
    },
    {
        "id": "high_aes_general_v14",
        "name": "通用1.4-文生图",
        "description": "经典版通用文生图模型，稳定可靠",
        "max_images": 4,
        "category": "豆包",
        "demo": {
            "prompt": "一只可爱的猫咪，写实风格",
            "images": [
                "https://picsum.photos/seed/doubao-classic1/512/512",
                "https://picsum.photos/seed/doubao-classic2/512/512",
                "https://picsum.photos/seed/doubao-classic3/512/512",
                "https://picsum.photos/seed/doubao-classic4/512/512",
            ],
        },
    },
    {
        "id": "t2i_xl_sft",
        "name": "通用XL pro-文生图",
        "description": "超大模型，提供最高质量的图像生成",
        "max_images": 4,
        "category": "豆包",
        "demo": {
            "prompt": "一幅未来城市，赛博朋克风格",
            "images": [
                "https://picsum.photos/seed/doubao-xl1/512/512",
                "https://picsum.photos/seed/doubao-xl2/512/512",
                "https://picsum.photos/seed/doubao-xl3/512/512",
                "https://picsum.photos/seed/doubao-xl4/512/512",
            ],
        },
    },
]

class DoubaoModel(AIModel):
    """Doubao model implementation."""
    
    def __init__(self, config: ModelConfig):
        """Initialize Doubao model.
        
        Args:
            config: The model configuration.
        """
        self.config = config
        self.endpoint = "https://visual.volcengineapi.com"
        self.default_model = config.default_model or "high_aes_general_v21_L"
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self) -> "DoubaoModel":
        """Create aiohttp session when entering context."""
        self._session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Close aiohttp session when exiting context."""
        if self._session:
            await self._session.close()

    def _sign_string_encoder(self, source: str) -> str:
        """Encode string for signing."""
        return urllib.parse.quote(source, safe="").replace("*", "%2A")

    async def _hash_sha256(self, content: str) -> str:
        """Calculate SHA-256 hash of content."""
        return hashlib.sha256(content.encode()).hexdigest()

    async def _hmac_sha256(self, key: bytes, content: str) -> bytes:
        """Calculate HMAC-SHA256 of content."""
        return hmac.new(key, content.encode(), hashlib.sha256).digest()

    async def _gen_signing_secret_key_v4(
        self,
        secret_key: str,
        date: str,
        region: str,
        service: str,
    ) -> bytes:
        """Generate signing secret key for AWS V4 signature."""
        k_date = await self._hmac_sha256(secret_key.encode(), date)
        k_region = await self._hmac_sha256(k_date, region)
        k_service = await self._hmac_sha256(k_region, service)
        return await self._hmac_sha256(k_service, "request")

    async def _make_request(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Make request to Doubao API."""
        method = "POST"
        action = "CVProcess"
        version = "2022-08-31"
        url = f"{self.endpoint}?Action={action}&Version={version}"

        body = json.dumps(payload)
        x_content_sha256 = await self._hash_sha256(body)
        x_date = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        short_x_date = x_date[:8]
        credential_scope = f"{short_x_date}/{self.config.region}/{self.config.service}/request"
        sign_header = "host;x-date;x-content-sha256;content-type"
        content_type = "application/json"

        query_string = "&".join([
            f"{self._sign_string_encoder(k)}={self._sign_string_encoder(v)}"
            for k, v in [("Action", action), ("Version", version)]
        ])

        canonical_string = "\n".join([
            method,
            "/",
            query_string,
            f"host:{self.config.host}",
            f"x-date:{x_date}",
            f"x-content-sha256:{x_content_sha256}",
            f"content-type:{content_type}",
            "",
            sign_header,
            x_content_sha256,
        ])

        hash_canonical_string = await self._hash_sha256(canonical_string)
        string_to_sign = "\n".join([
            "HMAC-SHA256",
            x_date,
            credential_scope,
            hash_canonical_string,
        ])

        sign_key = await self._gen_signing_secret_key_v4(
            self.config.api_secret,
            short_x_date,
            self.config.region,
            self.config.service,
        )

        signature = hmac.new(sign_key, string_to_sign.encode(), hashlib.sha256).hexdigest()

        try:
            if not self._session:
                self._session = aiohttp.ClientSession()

            async with self._session.post(
                url,
                headers={
                    "Host": self.config.host,
                    "X-Date": x_date,
                    "X-Content-Sha256": x_content_sha256,
                    "Content-Type": content_type,
                    "Authorization": (
                        f"HMAC-SHA256 Credential={self.config.api_key}/{credential_scope}, "
                        f"SignedHeaders={sign_header}, Signature={signature}"
                    ),
                },
                data=body,
            ) as response:
                if not response.ok:
                    error_data = await response.json()
                    raise Exception(
                        error_data.get("message") or 
                        f"Doubao API error: {response.status} {response.status_text}"
                    )

                result = await response.json()
                if result.get("error"):
                    raise Exception(result["error"])

                return result

        except Exception as e:
            logger.error("Doubao API request failed: %s", str(e))
            raise

    async def generate(
        self,
        request: GenerationRequest,
        callback: Optional[ContentCallback] = None
    ) -> GenerationResponse:
        """Generate content using Doubao.
        
        Args:
            request: The generation request parameters.
            callback: Optional callback for streaming content.
            
        Returns:
            A GenerationResponse containing the generation results.
        """
        try:
            model = request.model or self.default_model
            payload = {
                "req_key": model,
                "prompt": request.prompt,
                "return_url": True,
            }

            result = await self._make_request(payload)
            
            if result.get("message") == "Success" and result.get("data", {}).get("image_urls"):
                chunks = [
                    ContentChunk(
                        type=ContentType.IMAGE,
                        content=url,
                        metadata={"request_id": result.get("request_id")}
                    )
                    for url in result["data"]["image_urls"]
                ]
                
                if callback:
                    for chunk in chunks:
                        await callback(chunk)
                
                return GenerationResponse(
                    success=True,
                    chunks=chunks,
                    request_id=result.get("request_id")
                )
            
            return GenerationResponse(
                success=False,
                chunks=[],
                error=result.get("message", "Unknown error")
            )

        except Exception as e:
            logger.exception("Error in Doubao generation")
            return GenerationResponse(
                success=False,
                chunks=[],
                error=str(e)
            )

    @staticmethod
    def get_available_models() -> List[Dict[str, Any]]:
        """Get list of available Doubao models.
        
        Returns:
            A list of dictionaries containing model information.
        """
        return DOUBAO_MODELS

    @staticmethod
    def supports_streaming(model: str) -> bool:
        """Check if the specified model supports streaming.
        
        Args:
            model: The model identifier.
            
        Returns:
            True if the model supports streaming, False otherwise.
        """
        return False 

if __name__ == "__main__":
    print(DoubaoModel.get_available_models())

