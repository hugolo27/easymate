import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage
import google.generativeai as genai

class LLMService:
    def __init__(self):
        """Initialize the LLM service with Gemini Flash using LangChain."""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        # Configure Google Generative AI
        genai.configure(api_key=self.api_key)
        
        # Initialize LangChain with Gemini Flash
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=self.api_key,
            temperature=0.3,
            max_tokens=1000,
            streaming=True
        )
    
    async def generate_summary(self, text: str, max_length: int = 150):
        """
        Generate a summary of the provided text using LangChain streaming.
        
        Args:
            text (str): The text to summarize
            max_length (int): Maximum length of the summary
            
        Yields:
            str: JSON-formatted streaming chunks
        """
        try:
            # Create the prompt for summarization
            system_prompt = f"You are a helpful assistant that creates concise summaries. Provide summaries in approximately {max_length} words or less. Focus on the main points and key insights. Make it clear and easy to understand."
            
            user_prompt = f"Please summarize the following text:\n\n{text}"
            
            # Create messages for LangChain
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            # Use LangChain's astream_log for proper streaming with JSON Patch
            async for patch in self.llm.astream_log(messages):
                for op in patch.ops:
                    if op["op"] == "add" and op["path"] == "/streamed_output/-":
                        content = op["value"] if isinstance(op["value"], str) else op["value"].content
                        if content:
                            json_dict = {"type": "summary_chunk", "content": content}
                            json_str = json.dumps(json_dict)
                            yield f"data: {json_str}\n\n"
                            
        except Exception as e:
            error_dict = {"type": "error", "content": f"Error generating summary: {str(e)}"}
            error_json = json.dumps(error_dict)
            yield f"data: {error_json}\n\n"
    
    def validate_text(self, text: str) -> bool:
        """Validate that the input text is not empty and within reasonable limits."""
        if not text or not text.strip():
            return False
        if len(text) > 10000:  # Limit to 10k characters
            return False
        return True 