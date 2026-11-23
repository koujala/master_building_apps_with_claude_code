"""Anthropic client and model settings for the WorkBoard AI assistant.

The API key is read from .env on the server only. Never send it to the browser or log it.
"""

import os
from pathlib import Path
from typing import Optional

import anthropic
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MODEL = "claude-sonnet-5-5"
# Sonnet 5.5 thinks by default and thinking tokens count toward max_tokens.
# Low effort keeps chat replies quick. Pass this as output_config on every request.
OUTPUT_CONFIG = {"effort": "low"}
MAX_TOKENS = 3000

_client: Optional[anthropic.Anthropic] = None


def get_client() -> anthropic.Anthropic:
    """Return the shared Anthropic client, creating it on first use.

    Raises:
        RuntimeError: if ANTHROPIC_API_KEY is not set.
    """
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client
