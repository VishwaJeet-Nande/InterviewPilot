from io import BytesIO

from pypdf import PdfReader


def extract_pdf_text(file_bytes: bytes) -> str:
    """
    Extract readable text from a PDF resume.

    Raises:
        ValueError: If the PDF contains no extractable text.
    """

    if not file_bytes:
        raise ValueError("Resume file is empty.")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except Exception as exc:
        raise ValueError(
            "Unable to read the uploaded PDF."
        ) from exc

    pages = []

    for page in reader.pages:
        try:
            text = page.extract_text() or ""

            if text.strip():
                pages.append(text.strip())

        except Exception:
            continue

    extracted_text = "\n\n".join(pages).strip()

    if not extracted_text:
        raise ValueError(
            "No readable text could be extracted from this PDF. "
            "The resume may be scanned or image-based."
        )

    return extracted_text