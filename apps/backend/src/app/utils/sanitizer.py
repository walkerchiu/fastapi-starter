"""Input sanitization utilities for XSS prevention.

Provides functions to sanitize user input by:
- Stripping HTML tags
- Encoding HTML special characters
- Trimming whitespace
"""

import html
import re
from typing import Any

# Allowed HTML tags for rich text content
ALLOWED_TAGS = frozenset(
    ["p", "br", "b", "i", "u", "strong", "em", "a", "ul", "ol", "li"]
)

# Allowed attributes for specific tags
ALLOWED_ATTRIBUTES: dict[str, frozenset[str]] = {
    "a": frozenset(["href", "title"]),
}

# XSS detection patterns
XSS_PATTERNS = [
    re.compile(r"<script\b", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),
    re.compile(r"<iframe\b", re.IGNORECASE),
    re.compile(r"<embed\b", re.IGNORECASE),
    re.compile(r"<object\b", re.IGNORECASE),
    re.compile(r"data:", re.IGNORECASE),
    re.compile(r"vbscript:", re.IGNORECASE),
]

# Pattern to match HTML tags
HTML_TAG_PATTERN = re.compile(r"<[^>]*>")

# Pattern to match script and style tags with content
SCRIPT_PATTERN = re.compile(r"<script\b[^>]*>[\s\S]*?</script>", re.IGNORECASE)
STYLE_PATTERN = re.compile(r"<style\b[^>]*>[\s\S]*?</style>", re.IGNORECASE)

# Pattern to match opening/closing tags
TAG_PATTERN = re.compile(r"</?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>", re.IGNORECASE)

# Pattern to match attributes
ATTR_PATTERN = re.compile(
    r'([a-zA-Z][a-zA-Z0-9-]*)(?:\s*=\s*(?:"([^"]*)"|\'([^\']*)\'|([^\s>]+)))?'
)

# Pattern to match event handlers
EVENT_HANDLER_PATTERN = re.compile(r"on\w+\s*=", re.IGNORECASE)


def encode_html_entities(input_str: str) -> str:
    """Encode HTML special characters to prevent XSS."""
    return html.escape(input_str, quote=True)


def strip_html_tags(input_str: str) -> str:
    """Strip all HTML tags from a string."""
    return HTML_TAG_PATTERN.sub("", input_str)


def sanitize_string(input_str: str | None) -> str:
    """Sanitize a string by stripping HTML tags and trimming whitespace.

    Use this for plain text fields like names, titles, etc.

    Args:
        input_str: The string to sanitize

    Returns:
        Sanitized string with HTML tags removed and whitespace trimmed
    """
    if input_str is None:
        return ""

    if not isinstance(input_str, str):
        return ""

    return strip_html_tags(input_str).strip()


def sanitize_and_encode(input_str: str | None) -> str:
    """Sanitize a string and encode HTML entities.

    Use this when the output will be rendered in HTML context.

    Args:
        input_str: The string to sanitize and encode

    Returns:
        Sanitized and HTML-encoded string
    """
    sanitized = sanitize_string(input_str)
    return encode_html_entities(sanitized)


def _process_tag(match: re.Match[str]) -> str:
    """Process a single HTML tag, keeping allowed ones and stripping others."""
    full_match = match.group(0)
    tag_name = match.group(1).lower()
    attributes = match.group(2)

    # Check if tag is allowed
    if tag_name not in ALLOWED_TAGS:
        return ""

    # For closing tags, just return the tag
    if full_match.startswith("</"):
        return f"</{tag_name}>"

    # For opening tags, filter attributes
    allowed_attrs = ALLOWED_ATTRIBUTES.get(tag_name)
    if not allowed_attrs:
        return f"<{tag_name}>"

    # Parse and filter attributes
    safe_attrs: list[str] = []
    for attr_match in ATTR_PATTERN.finditer(attributes):
        attr_name = attr_match.group(1)
        if not attr_name:
            continue

        attr_name = attr_name.lower()
        attr_value = (
            attr_match.group(2) or attr_match.group(3) or attr_match.group(4) or ""
        )

        if attr_name in allowed_attrs:
            # Sanitize href to prevent javascript: URLs
            if attr_name == "href":
                lower_value = attr_value.lower().strip()
                if any(
                    lower_value.startswith(proto)
                    for proto in ["javascript:", "data:", "vbscript:"]
                ):
                    continue
            safe_attrs.append(f'{attr_name}="{encode_html_entities(attr_value)}"')

    if safe_attrs:
        return f"<{tag_name} {' '.join(safe_attrs)}>"
    return f"<{tag_name}>"


def sanitize_html(input_str: str | None) -> str:
    """Sanitize HTML content, allowing only safe tags and attributes.

    Use this for rich text content from editors.

    Args:
        input_str: The HTML string to sanitize

    Returns:
        Sanitized HTML string with only allowed tags and attributes
    """
    if input_str is None:
        return ""

    if not isinstance(input_str, str):
        return ""

    result = input_str.strip()

    # First, remove script and style tags with their content
    result = SCRIPT_PATTERN.sub("", result)
    result = STYLE_PATTERN.sub("", result)

    # Process tags - keep allowed ones, strip others
    result = TAG_PATTERN.sub(_process_tag, result)

    # Remove any remaining event handlers
    result = EVENT_HANDLER_PATTERN.sub("", result)

    return result


def sanitize_object[T: dict[str, Any]](
    obj: T,
    exclude_fields: list[str] | None = None,
) -> T:
    """Sanitize an object's string properties.

    Useful for sanitizing Pydantic models or request bodies.

    Args:
        obj: The dictionary to sanitize
        exclude_fields: List of field names to exclude from sanitization

    Returns:
        New dictionary with sanitized string values
    """
    exclude_set = set(exclude_fields) if exclude_fields else set()
    result = dict(obj)

    for key, value in result.items():
        if key in exclude_set:
            continue

        if isinstance(value, str):
            result[key] = sanitize_string(value)

    return result  # type: ignore[return-value]


def contains_xss_patterns(input_str: str | None) -> bool:
    """Check if a string contains potential XSS patterns.

    Useful for logging/monitoring suspicious input.

    Args:
        input_str: The string to check

    Returns:
        True if the string contains potential XSS patterns
    """
    if not input_str or not isinstance(input_str, str):
        return False

    return any(pattern.search(input_str) for pattern in XSS_PATTERNS)
