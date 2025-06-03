"""
DeepSeek V3 Integration Service
Provides integration with DeepSeek's latest API for AGENT_LAND_SAARLAND
"""

import aiohttp
import asyncio
from typing import Dict, List, Optional, Any, Union
import json
import logging
from datetime import datetime
import backoff

logger = logging.getLogger(__name__)


class DeepSeekService:
    """
    Service for interacting with DeepSeek V3 API
    Provides advanced language understanding and generation capabilities
    """
    
    def __init__(self, api_key: str, base_url: str = "https://api.deepseek.com/v3"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.session = None
        
        # Model configurations
        self.models = {
            "chat": "deepseek-chat",
            "coder": "deepseek-coder", 
            "reasoner": "deepseek-reasoner"
        }
        
        # Default parameters
        self.default_params = {
            "temperature": 0.7,
            "max_tokens": 1000,
            "top_p": 0.95,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        }
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
            
    @backoff.on_exception(
        backoff.expo,
        (aiohttp.ClientError, asyncio.TimeoutError),
        max_tries=3,
        max_time=30
    )
    async def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        context: Optional[str] = None,
        model: str = "chat",
        temperature: float = None,
        max_tokens: int = None,
        stream: bool = False,
        **kwargs
    ) -> Union[str, AsyncGenerator]:
        """
        Generate a response using DeepSeek V3
        
        Args:
            system_prompt: System instructions for the model
            user_prompt: User's query
            context: Additional context information
            model: Model type to use (chat, coder, reasoner)
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            **kwargs: Additional parameters
            
        Returns:
            Generated response text or async generator if streaming
        """
        
        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({
                "role": "system", 
                "content": f"Context:\n{context}"
            })
            
        messages.append({"role": "user", "content": user_prompt})
        
        # Prepare parameters
        params = self.default_params.copy()
        params.update({
            "model": self.models.get(model, self.models["chat"]),
            "messages": messages,
            "stream": stream
        })
        
        if temperature is not None:
            params["temperature"] = temperature
        if max_tokens is not None:
            params["max_tokens"] = max_tokens
            
        # Add any additional parameters
        params.update(kwargs)
        
        # Make request
        if not self.session:
            self.session = aiohttp.ClientSession()
            
        try:
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=params,
                timeout=aiohttp.ClientTimeout(total=60)
            ) as response:
                if response.status != 200:
                    error_data = await response.text()
                    logger.error(f"DeepSeek API error: {response.status} - {error_data}")
                    raise Exception(f"API error: {response.status}")
                    
                if stream:
                    return self._handle_stream(response)
                else:
                    data = await response.json()
                    return data["choices"][0]["message"]["content"]
                    
        except Exception as e:
            logger.error(f"Error calling DeepSeek API: {str(e)}")
            raise
            
    async def _handle_stream(self, response):
        """Handle streaming response"""
        async for line in response.content:
            line = line.decode('utf-8').strip()
            if line.startswith("data: "):
                data = line[6:]
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    if content := chunk["choices"][0]["delta"].get("content"):
                        yield content
                except json.JSONDecodeError:
                    continue
                    
    async def analyze_with_reasoning(
        self,
        query: str,
        context: Optional[str] = None,
        reasoning_steps: int = 3
    ) -> Dict[str, Any]:
        """
        Use DeepSeek's reasoning model for complex analysis
        
        Args:
            query: The question or problem to analyze
            context: Additional context
            reasoning_steps: Number of reasoning steps to perform
            
        Returns:
            Dict with reasoning steps and final answer
        """
        
        system_prompt = f"""You are an expert AI assistant with advanced reasoning capabilities.
        Analyze the query step by step, showing your reasoning process.
        Provide {reasoning_steps} clear reasoning steps before giving your final answer.
        
        Format your response as:
        STEP 1: [First reasoning step]
        STEP 2: [Second reasoning step]
        ...
        FINAL ANSWER: [Your conclusion]
        """
        
        response = await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=query,
            context=context,
            model="reasoner",
            temperature=0.3,  # Lower temperature for reasoning
            max_tokens=2000
        )
        
        # Parse the response
        return self._parse_reasoning_response(response)
        
    def _parse_reasoning_response(self, response: str) -> Dict[str, Any]:
        """Parse reasoning response into structured format"""
        lines = response.split('\n')
        steps = []
        final_answer = ""
        
        for line in lines:
            if line.startswith("STEP"):
                steps.append(line.split(":", 1)[1].strip() if ":" in line else line)
            elif line.startswith("FINAL ANSWER"):
                final_answer = line.split(":", 1)[1].strip() if ":" in line else line
                
        return {
            "reasoning_steps": steps,
            "final_answer": final_answer,
            "full_response": response
        }
        
    async def generate_code(
        self,
        description: str,
        language: str = "python",
        context: Optional[str] = None,
        requirements: Optional[List[str]] = None
    ) -> str:
        """
        Generate code using DeepSeek Coder model
        
        Args:
            description: What the code should do
            language: Programming language
            context: Additional context or existing code
            requirements: Specific requirements or constraints
            
        Returns:
            Generated code
        """
        
        system_prompt = f"""You are an expert {language} programmer.
        Generate clean, efficient, and well-documented code.
        Follow best practices and include error handling.
        """
        
        user_prompt = f"Generate {language} code for: {description}"
        
        if requirements:
            user_prompt += f"\n\nRequirements:\n" + "\n".join(f"- {req}" for req in requirements)
            
        response = await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            context=context,
            model="coder",
            temperature=0.2,  # Lower temperature for code generation
            max_tokens=2000
        )
        
        return self._extract_code(response, language)
        
    def _extract_code(self, response: str, language: str) -> str:
        """Extract code block from response"""
        # Look for code blocks
        import re
        
        # Try to find code block with language marker
        pattern = rf"```{language}\n(.*?)```"
        match = re.search(pattern, response, re.DOTALL)
        
        if match:
            return match.group(1).strip()
            
        # Try generic code block
        pattern = r"```\n(.*?)```"
        match = re.search(pattern, response, re.DOTALL)
        
        if match:
            return match.group(1).strip()
            
        # Return full response if no code block found
        return response
        
    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str = "auto",
        style: str = "formal",
        context: Optional[str] = None
    ) -> str:
        """
        Translate text using DeepSeek
        
        Args:
            text: Text to translate
            target_language: Target language
            source_language: Source language or "auto" for detection
            style: Translation style (formal, casual, technical)
            context: Additional context for better translation
            
        Returns:
            Translated text
        """
        
        language_names = {
            "de": "German",
            "fr": "French", 
            "en": "English",
            "saar": "Saarländisch dialect"
        }
        
        target_lang_name = language_names.get(target_language, target_language)
        
        system_prompt = f"""You are a professional translator specializing in {target_lang_name}.
        Translate the text accurately while maintaining the {style} style.
        Preserve the meaning and nuance of the original text.
        """
        
        if target_language == "saar":
            system_prompt += """
            For Saarländisch dialect:
            - Use typical Saarland expressions and vocabulary
            - Maintain the warm, friendly tone characteristic of the region
            - Include common dialect features like 'unn' (und), 'isch' (ich), 'han' (habe)
            """
            
        user_prompt = f"Translate the following text to {target_lang_name}:\n\n{text}"
        
        if source_language != "auto":
            source_lang_name = language_names.get(source_language, source_language)
            user_prompt = f"Translate from {source_lang_name} to {target_lang_name}:\n\n{text}"
            
        return await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            context=context,
            temperature=0.3,
            max_tokens=len(text) * 2  # Rough estimate for translation length
        )
        
    async def summarize(
        self,
        text: str,
        max_length: int = 200,
        style: str = "concise",
        focus: Optional[str] = None
    ) -> str:
        """
        Summarize text using DeepSeek
        
        Args:
            text: Text to summarize
            max_length: Maximum length of summary in words
            style: Summary style (concise, detailed, bullet_points)
            focus: Specific aspect to focus on
            
        Returns:
            Summarized text
        """
        
        system_prompt = f"""You are an expert at creating {style} summaries.
        Summarize the text in approximately {max_length} words.
        Capture the key points while maintaining clarity.
        """
        
        if focus:
            system_prompt += f"\nFocus particularly on: {focus}"
            
        if style == "bullet_points":
            system_prompt += "\nFormat the summary as bullet points."
            
        user_prompt = f"Summarize the following text:\n\n{text}"
        
        return await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.5,
            max_tokens=max_length * 2  # Tokens != words, so we give some buffer
        )
        
    async def extract_entities(
        self,
        text: str,
        entity_types: Optional[List[str]] = None
    ) -> Dict[str, List[str]]:
        """
        Extract named entities from text
        
        Args:
            text: Text to analyze
            entity_types: Specific entity types to extract
            
        Returns:
            Dict mapping entity types to lists of entities
        """
        
        default_types = ["PERSON", "LOCATION", "ORGANIZATION", "DATE", "EVENT"]
        entity_types = entity_types or default_types
        
        system_prompt = f"""You are an expert at named entity recognition.
        Extract the following entity types from the text: {', '.join(entity_types)}
        
        Return the results in JSON format:
        {{
            "ENTITY_TYPE": ["entity1", "entity2", ...],
            ...
        }}
        """
        
        response = await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=f"Extract entities from:\n\n{text}",
            temperature=0.1,  # Very low temperature for consistency
            max_tokens=500
        )
        
        try:
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                logger.warning("Could not parse entity extraction response")
                return {}
        except json.JSONDecodeError:
            logger.error("Failed to parse entity extraction JSON")
            return {}
            
    async def sentiment_analysis(
        self,
        text: str,
        aspects: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Analyze sentiment of text
        
        Args:
            text: Text to analyze
            aspects: Specific aspects to analyze sentiment for
            
        Returns:
            Sentiment analysis results
        """
        
        system_prompt = """You are an expert at sentiment analysis.
        Analyze the overall sentiment and any specific aspects mentioned.
        
        Return results in JSON format:
        {
            "overall_sentiment": "positive/negative/neutral",
            "confidence": 0.0-1.0,
            "aspects": {
                "aspect": {"sentiment": "...", "confidence": 0.0-1.0},
                ...
            },
            "summary": "Brief explanation"
        }
        """
        
        user_prompt = f"Analyze sentiment of:\n\n{text}"
        
        if aspects:
            user_prompt += f"\n\nPay special attention to these aspects: {', '.join(aspects)}"
            
        response = await self.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=500
        )
        
        try:
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    "overall_sentiment": "unknown",
                    "confidence": 0.0,
                    "summary": response
                }
        except json.JSONDecodeError:
            return {
                "overall_sentiment": "unknown",
                "confidence": 0.0,
                "summary": response
            }


# Singleton instance management
_deepseek_service = None


def get_deepseek_service(api_key: str) -> DeepSeekService:
    """Get or create DeepSeek service instance"""
    global _deepseek_service
    if _deepseek_service is None:
        _deepseek_service = DeepSeekService(api_key)
    return _deepseek_service
