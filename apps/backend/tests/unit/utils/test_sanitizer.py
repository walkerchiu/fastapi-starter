"""Tests for input sanitization utilities."""


from app.utils.sanitizer import (
    contains_xss_patterns,
    encode_html_entities,
    sanitize_and_encode,
    sanitize_html,
    sanitize_object,
    sanitize_string,
    strip_html_tags,
)


class TestEncodeHtmlEntities:
    """Tests for encode_html_entities function."""

    def test_encode_special_characters(self) -> None:
        """Should encode HTML special characters."""
        assert encode_html_entities("<script>") == "&lt;script&gt;"
        assert encode_html_entities('"test"') == "&quot;test&quot;"
        assert encode_html_entities("it's") == "it&#x27;s"
        assert encode_html_entities("Tom & Jerry") == "Tom &amp; Jerry"

    def test_handle_empty_string(self) -> None:
        """Should handle empty string."""
        assert encode_html_entities("") == ""

    def test_not_modify_safe_strings(self) -> None:
        """Should not modify safe strings."""
        assert encode_html_entities("Hello World") == "Hello World"


class TestStripHtmlTags:
    """Tests for strip_html_tags function."""

    def test_remove_html_tags(self) -> None:
        """Should remove HTML tags."""
        assert strip_html_tags('<script>alert("xss")</script>') == 'alert("xss")'
        assert strip_html_tags("<div>Hello</div>") == "Hello"
        assert strip_html_tags('<img src="x" onerror="alert(1)">') == ""

    def test_handle_nested_tags(self) -> None:
        """Should handle nested tags."""
        assert strip_html_tags("<div><p>Text</p></div>") == "Text"

    def test_handle_empty_string(self) -> None:
        """Should handle empty string."""
        assert strip_html_tags("") == ""


class TestSanitizeString:
    """Tests for sanitize_string function."""

    def test_strip_html_and_trim(self) -> None:
        """Should strip HTML and trim whitespace."""
        assert sanitize_string('  <script>alert("xss")</script>  ') == 'alert("xss")'
        assert sanitize_string("  Hello World  ") == "Hello World"

    def test_handle_none(self) -> None:
        """Should handle None."""
        assert sanitize_string(None) == ""

    def test_handle_non_string(self) -> None:
        """Should handle non-string input."""
        assert sanitize_string(123) == ""  # type: ignore[arg-type]
        assert sanitize_string({}) == ""  # type: ignore[arg-type]

    def test_handle_xss_payloads(self) -> None:
        """Should handle XSS payloads."""
        assert sanitize_string('<img src=x onerror=alert("xss")>') == ""
        assert sanitize_string('<svg onload=alert("xss")>') == ""


class TestSanitizeAndEncode:
    """Tests for sanitize_and_encode function."""

    def test_strip_html_and_encode(self) -> None:
        """Should strip HTML and encode remaining special chars."""
        assert sanitize_and_encode("Tom & Jerry") == "Tom &amp; Jerry"
        assert sanitize_and_encode("<b>Hello</b> & World") == "Hello &amp; World"

    def test_handle_complex_xss(self) -> None:
        """Should handle complex XSS payloads."""
        result = sanitize_and_encode('<script>alert("xss")</script>')
        assert result == "alert(&quot;xss&quot;)"


class TestSanitizeHtml:
    """Tests for sanitize_html function."""

    def test_allow_safe_tags(self) -> None:
        """Should allow safe tags."""
        assert sanitize_html("<p>Hello</p>") == "<p>Hello</p>"
        assert sanitize_html("<b>Bold</b>") == "<b>Bold</b>"
        assert sanitize_html("<i>Italic</i>") == "<i>Italic</i>"

    def test_remove_unsafe_tags(self) -> None:
        """Should remove unsafe tags."""
        assert sanitize_html('<script>alert("xss")</script>') == ""
        assert sanitize_html('<iframe src="evil.com"></iframe>') == ""
        assert sanitize_html("<style>body{display:none}</style>") == ""

    def test_allow_safe_attributes(self) -> None:
        """Should allow safe attributes on anchor tags."""
        result = sanitize_html('<a href="https://example.com" title="Link">Click</a>')
        assert result == '<a href="https://example.com" title="Link">Click</a>'

    def test_remove_javascript_urls(self) -> None:
        """Should remove javascript: URLs."""
        assert (
            sanitize_html('<a href="javascript:alert(1)">Click</a>') == "<a>Click</a>"
        )

    def test_remove_event_handlers(self) -> None:
        """Should remove event handlers."""
        result = sanitize_html('<p onclick="alert(1)">Text</p>')
        assert "onclick" not in result

    def test_handle_none(self) -> None:
        """Should handle None."""
        assert sanitize_html(None) == ""


class TestSanitizeObject:
    """Tests for sanitize_object function."""

    def test_sanitize_string_properties(self) -> None:
        """Should sanitize string properties."""
        input_obj = {
            "name": '<script>alert("xss")</script>',
            "age": 25,
            "active": True,
        }
        result = sanitize_object(input_obj)
        assert result["name"] == 'alert("xss")'
        assert result["age"] == 25
        assert result["active"] is True

    def test_exclude_fields(self) -> None:
        """Should exclude specified fields."""
        input_obj = {
            "name": "<b>John</b>",
            "password": "<secret>",
        }
        result = sanitize_object(input_obj, exclude_fields=["password"])
        assert result["name"] == "John"
        assert result["password"] == "<secret>"

    def test_not_modify_original(self) -> None:
        """Should not modify original object."""
        input_obj = {"name": "<b>John</b>"}
        sanitize_object(input_obj)
        assert input_obj["name"] == "<b>John</b>"


class TestContainsXssPatterns:
    """Tests for contains_xss_patterns function."""

    def test_detect_script_tags(self) -> None:
        """Should detect script tags."""
        assert contains_xss_patterns("<script>alert(1)</script>") is True
        assert contains_xss_patterns("<SCRIPT>alert(1)</SCRIPT>") is True

    def test_detect_javascript_protocol(self) -> None:
        """Should detect javascript: protocol."""
        assert contains_xss_patterns("javascript:alert(1)") is True

    def test_detect_event_handlers(self) -> None:
        """Should detect event handlers."""
        assert contains_xss_patterns("onclick=alert(1)") is True
        assert contains_xss_patterns("onerror=alert(1)") is True

    def test_detect_iframe_and_embed(self) -> None:
        """Should detect iframe and embed tags."""
        assert contains_xss_patterns('<iframe src="evil.com">') is True
        assert contains_xss_patterns('<embed src="evil.swf">') is True

    def test_return_false_for_safe_strings(self) -> None:
        """Should return false for safe strings."""
        assert contains_xss_patterns("Hello World") is False
        assert contains_xss_patterns("Tom & Jerry") is False

    def test_handle_none(self) -> None:
        """Should handle None."""
        assert contains_xss_patterns(None) is False  # type: ignore[arg-type]
