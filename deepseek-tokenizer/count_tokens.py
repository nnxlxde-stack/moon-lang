#!/usr/bin/env python3
"""Count tokens using HuggingFace tokenizers when available, else character estimate."""
import math
import sys
from pathlib import Path


def estimate_tokens(text: str) -> int:
    tokens = 0.0
    for char in text:
        if "\u4e00" <= char <= "\u9fff":
            tokens += 0.6
        else:
            tokens += 0.3
    return int(math.ceil(tokens))


def count_with_tokenizers(text: str, tokenizer_path: Path) -> int | None:
    try:
        from tokenizers import Tokenizer  # type: ignore
    except ImportError:
        return None
    try:
        tok = Tokenizer.from_file(str(tokenizer_path))
        return len(tok.encode(text).ids)
    except Exception:
        return None


def main() -> int:
    text = sys.stdin.read()
    tokenizer_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent
    tokenizer_json = tokenizer_dir / "tokenizer.json"
    if tokenizer_json.is_file():
        count = count_with_tokenizers(text, tokenizer_json)
        if count is not None:
            print(count)
            return 0
    print(estimate_tokens(text))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())