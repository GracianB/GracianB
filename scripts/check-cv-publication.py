#!/usr/bin/env python3
"""Publication gate for the six CV PDFs; run before staging generated binaries."""
from pathlib import Path
import pymupdf as fitz

ROOT = Path(__file__).resolve().parent.parent
CV = {
    "Gracian_Baena_CV_TCP_ES.pdf": ("ESATUR", "Bodytone", "Minderest"),
    "Gracian_Baena_CV_TCP_EN.pdf": ("ESATUR", "Bodytone", "Minderest"),
    "Gracian_Baena_Carta_TCP_ES.pdf": ("ESATUR",),
    "Gracian_Baena_Cover_Letter_TCP_EN.pdf": ("ESATUR",),
}
for filename, keywords in CV.items():
    path = ROOT / filename
    if not path.is_file():
        raise SystemExit(f"Missing PDF: {filename}")
    if path.read_bytes()[:5] != b"%PDF-":
        raise SystemExit(f"Invalid PDF header: {filename}")
    with fitz.open(path) as pdf:
        if not 1 <= len(pdf) <= 3:
            raise SystemExit(f"Unexpected {len(pdf)} pages in {filename}")
        text = " ".join(page.get_text() for page in pdf)
        for word in keywords:
            if word not in text:
                raise SystemExit(f"{filename} missing {word}")
    print(f"PASS {filename}")

target = "https://gracianb.github.io/systems-lab/#aigoritmo"
for filename in ("Gracian_Baena_CV_2026_ES.pdf", "Gracian_Baena_CV_2026_EN.pdf"):
    with fitz.open(ROOT / filename) as pdf:
        if len(pdf) != 2:
            raise SystemExit(f"Professional CV pages changed: {filename}")
        links = [item.get("uri", "") for page in pdf for item in page.get_links()]
        if any("github.com" in link.lower() and "/gracianb/aigoritmo" in link.lower() for link in links):
            raise SystemExit(f"Private Aigoritmo repository linked in PDF: {filename}")
        if target not in links:
            print(f"INFO {filename}: no Aigoritmo annotation exists in this repository PDF; nothing to redirect")
    print(f"PASS {filename}")
print("PUBLICATION PDF GATE PASS 6/6")
