from fastapi import APIRouter, Response

router = APIRouter()


# Endpoint for retrieving legacy data in XML format
# When you return a Response directly its data is not validated, converted (serialized), nor documented automatically.
# https://fastapi.tiangolo.com/advanced/response-directly/#returning-a-custom-response.
# https://en.wikipedia.org/wiki/XML.
@router.get("/legacy/")
def get_legacy_data():
    # Sample XML data
    data = """<?xml version="1.0"?>
    <shampoo>
    <Header>
        Apply shampoo here.
    </Header>
    <Body>
        You'll have to use soap here.
    </Body>
    </shampoo>
    """
    # Return the XML data as a response with the appropriate media type
    return Response(content=data, media_type="application/xml")
