from enum import Enum
import dataclasses


class CodeBase(Enum):
    @property
    def code(self):
        return self.value[0]

    @property
    def message(self):
        return self.value[1]


class CustomResponseCode(CodeBase):
    """
    HTTP codes

        Hypertext Transfer Protocol (HTTP) Status Code Registry
        https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
    """

    HTTP_100 = (100, "Continue")
    HTTP_101 = (101, "Switching Protocols")
    HTTP_102 = (102, "Processing")
    HTTP_103 = (103, "Early Hints")
    HTTP_200 = (200, "OK")
    HTTP_201 = (201, "Created")
    HTTP_202 = (202, "Accepted")
    HTTP_203 = (203, "Non-Authoritative Information")
    HTTP_204 = (204, "No Content")
    HTTP_205 = (205, "Reset Content")
    HTTP_206 = (206, "Partial Content")
    HTTP_207 = (207, "Multi-Status")
    HTTP_208 = (208, "Already Reported")
    HTTP_226 = (226, "IM Used")
    HTTP_300 = (300, "Multiple Choices")
    HTTP_301 = (301, "Moved Permanently")
    HTTP_302 = (302, "Found")
    HTTP_303 = (303, "See Other")
    HTTP_304 = (304, "Not Modified")
    HTTP_305 = (305, "Use Proxy")
    HTTP_307 = (307, "Temporary Redirect")
    HTTP_308 = (308, "Permanent Redirect")
    HTTP_400 = (400, "Bad Request")
    HTTP_401 = (401, "Unauthorized")
    HTTP_402 = (402, "Payment Required")
    HTTP_403 = (403, "Forbidden")
    HTTP_404 = (404, "Not Found")
    HTTP_405 = (405, "Method Not Allowed")
    HTTP_406 = (406, "Not Acceptable")
    HTTP_407 = (407, "Proxy Authentication Required")
    HTTP_408 = (408, "Request Timeout")
    HTTP_409 = (409, "Conflict")
    HTTP_410 = (410, "Gone")
    HTTP_411 = (411, "Length Required")
    HTTP_412 = (412, "Precondition Failed")
    HTTP_413 = (413, "Content Too Large")
    HTTP_414 = (414, "URI Too Long")
    HTTP_415 = (415, "Unsupported Media Type")
    HTTP_416 = (416, "Range Not Satisfiable")
    HTTP_417 = (417, "Expectation Failed")
    HTTP_421 = (421, "Misdirected Request")
    HTTP_422 = (422, "Unprocessable Content")
    HTTP_423 = (423, "Locked")
    HTTP_424 = (424, "Failed Dependency")
    HTTP_425 = (425, "Too Early")
    HTTP_426 = (426, "Upgrade Required")
    HTTP_428 = (428, "Precondition Required")
    HTTP_429 = (429, "Too Many Requests")
    HTTP_431 = (431, "Request Header Fields Too Large")
    HTTP_451 = (451, "Unavailable For Legal Reasons")
    HTTP_500 = (500, "Internal Server Error")
    HTTP_501 = (501, "Not Implemented")
    HTTP_502 = (502, "Bad Gateway")
    HTTP_503 = (503, "Service Unavailable")
    HTTP_504 = (504, "Gateway Timeout")
    HTTP_505 = (505, "HTTP Version Not Supported")
    HTTP_506 = (506, "Variant Also Negotiates")
    HTTP_507 = (507, "Insufficient Storage")
    HTTP_508 = (508, "Loop Detected")
    HTTP_510 = (510, "Not Extended (OBSOLETED)")
    HTTP_511 = (511, "Network Authentication Required")

    """
    WebSocket codes

        CloseEvent: code property
        https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
    """

    WS_1000 = (1000, "Normal Closure")
    WS_1001 = (1001, "Going Away")
    WS_1002 = (1002, "Protocol error")
    WS_1003 = (1003, "Unsupported Data")
    WS_1004 = (1004, "Reserved")
    WS_1005 = (1005, "No Status Rcvd")
    WS_1006 = (1006, "Abnormal Closure")
    WS_1007 = (1007, "Invalid frame payload data")
    WS_1008 = (1008, "Policy Violation")
    WS_1009 = (1009, "Message Too Big")
    WS_1010 = (1010, "Mandatory Ext.")
    WS_1011 = (1011, "Internal Error")
    WS_1012 = (1012, "Service Restart")
    WS_1013 = (1013, "Try Again Later")
    WS_1014 = (1014, "Bad Gateway")
    WS_1015 = (1015, "TLS handshake")


@dataclasses.dataclass
class CustomResponse:
    code: int
    message: str
