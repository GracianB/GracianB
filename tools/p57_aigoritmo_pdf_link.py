#!/usr/bin/env python3
"""Single-use P57: edit only AiGoritmo link/label in two approved silver resumes."""
import hashlib
from pathlib import Path
import fitz

OLD_URL = "https://github.com/GracianB/aigoritmo"
NEW_URL = "https://gracianb.github.io/systems-lab/#aigoritmo"
DOCS = {
    "Gracian_Baena_CV_2026_ES.pdf": (
        "Ver código", "Ver proyecto",
        "95b9b1162d5a89f51141cbe081272a3d0ad8341e6224e961867b6c7e11008d6d",
    ),
    "Gracian_Baena_CV_2026_EN.pdf": (
        "View source", "View project",
        "e3bf0ddf9108545b13ab50c7e67dddc7e9b9893a2ad2a4bd77929e5eff0cddbf",
    ),
}

def fix_one(path, source_label, dest_label, sha256):
    original = path.read_bytes()
    assert hashlib.sha256(original).hexdigest() == sha256, "Unexpected source PDF: " + str(path)
    doc = fitz.open(stream=original, filetype="pdf")
    assert len(doc) == 2
    page = doc[1]
    original_links = page.get_links()
    priv = [link for link in original_links if link.get("uri") == OLD_URL]
    assert len(priv) == 1, "Expected exactly one private link"
    old_link = priv[0]
    linkrect = fitz.Rect(old_link["from"])
    candidates = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line["spans"]:
                if span["text"] == source_label and fitz.Rect(span["bbox"]).intersects(linkrect):
                    candidates.append(span)
    assert len(candidates) == 1, "Source label not uniquely found"
    span = candidates[0]
    assert span["font"] == "Inter-SemiBold" and abs(span["size"]-7.2) < .01
    assert span["color"] == 0x7a6542
    semixref = next(t[0] for t in page.get_fonts(full=True) if t[3].endswith("Inter-SemiBold"))
    _, _, _, semi_data = doc.extract_font(semixref)
    semi = fitz.Font(fontbuffer=semi_data)
    font_size = span["size"]
    if dest_label == "View project":
        regxref = next(t[0] for t in page.get_fonts(full=True) if t[3].endswith("Inter-Regular"))
        _, _, _, regular_data = doc.extract_font(regxref)
        regular = fitz.Font(fontbuffer=regular_data)
        # Embedded Inter SemiBold is subsetted and lacks only the 'j' glyph.
        fragments = [
            ("View pro", "SilverSemi", semi.text_length("View pro", fontsize=font_size)),
            ("j", "SilverRegular", regular.text_length("j", fontsize=font_size)),
            ("ect", "SilverSemi", semi.text_length("ect", fontsize=font_size)),
        ]
    else:
        regular_data = None
        fragments = [(dest_label, "SilverSemi", semi.text_length(dest_label, fontsize=font_size))]
    total_width = sum(t[2] for t in fragments)
    rect = fitz.Rect(span["bbox"])
    x = rect.x1 - total_width
    assert 505 < x < 528 and x + total_width < 565
    page.delete_link(old_link)
    page.add_redact_annot(rect + (-.5,-.6,.5,.6), fill=False, cross_out=False)
    page.apply_redactions(images=0, graphics=0, text=0)
    page.insert_font(fontname="SilverSemi",fontbuffer=semi_data)
    if regular_data:
        page.insert_font(fontname="SilverRegular",fontbuffer=regular_data)
    position = x
    for label, fontname, width in fragments:
        page.insert_text(
            (position, span["origin"][1]), label, fontname=fontname,
            fontsize=font_size, color=(122/255,101/255,66/255), overlay=True
        )
        position += width
    page.insert_link({
        "kind": fitz.LINK_URI,
        "from": fitz.Rect(x-.7,linkrect.y0,564.9,linkrect.y1),
        "uri": NEW_URL,
    })
    pdf_bytes = doc.tobytes(garbage=4,deflate=True,clean=True)
    doc.close()
    checked = fitz.open(stream=pdf_bytes,filetype="pdf")
    newlinks = checked[1].get_links()
    assert len(checked) == 2
    assert len(newlinks) == len(original_links)
    assert len([z for z in newlinks if z.get("uri") == NEW_URL]) == 1
    assert not any(z.get("uri") == OLD_URL for z in newlinks)
    assert len(checked[1].search_for(dest_label)) == 1
    assert len(checked[1].search_for(source_label)) == 2
    # Other page content stays invariant (same text and the same original PDF pages).
    assert checked[0].get_text() == fitz.open(stream=original,filetype="pdf")[0].get_text()
    checked.close()
    path.write_bytes(pdf_bytes)
    print("FIXED",path.name,hashlib.sha256(pdf_bytes).hexdigest())

if __name__ == "__main__":
    for name, settings in DOCS.items():
        fix_one(Path(name),*settings)
