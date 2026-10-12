#!/usr/bin/env python3
"""Fix private-project navigation inside existing public CV PDFs.

Preserves original pages, typography, illustrations, layout, and all other links.
Adds only a small overprint label and updates the matching Aigoritmo link target.
"""
from pathlib import Path
import os
import pymupdf as fitz

BASE = Path(__file__).resolve().parent.parent
BAD = "https://github.com/GracianB/aigoritmo"
GOOD = "https://gracianb.github.io/systems-lab/#aigoritmo"
DOCS = {
    "Gracian_Baena_CV_2026_ES.pdf": ("Ver código", "Ver caso"),
    "Gracian_Baena_CV_2026_EN.pdf": ("View source", "View case"),
}
BACK = (246/255, 245/255, 239/255)
FORE = (122/255, 88/255, 9/255)

for filename, (old_label, new_label) in DOCS.items():
    path = BASE / filename
    if not path.is_file():
        raise SystemExit(f"Required professional PDF missing: {filename}")
    doc = fitz.open(path)
    count = 0
    for page in doc:
        links = list(page.get_links())
        for link in links:
            uri = link.get("uri", "")
            if uri == GOOD:
                continue
            if not ("github.com" in uri.lower() and "/gracianb/aigoritmo" in uri.lower()):
                continue
            area = fitz.Rect(link["from"])
            matches = [r for r in page.search_for(old_label) if (r & area).get_area() > 0]
            if len(matches) != 1:
                raise SystemExit(f"Label location ambiguous in {filename}: {len(matches)}")
            rect = matches[0]
            replacement = dict(link)
            replacement["uri"] = GOOD
            page.update_link(replacement)
            # Opaque overprint hides the obsolete visible label without affecting
            # original photos, charts, or surrounding copy. We do not redact
            # the whole layout or alter any other annotations.
            page.draw_rect(
                rect + (-0.35, -0.35, 0.65, 0.35),
                color=None, fill=BACK, overlay=True
            )
            size = 7.2
            width = fitz.get_text_length(new_label, fontname="helv", fontsize=size)
            x = area.x1 - width - 0.4
            y = area.y1 - 3.2
            page.insert_text(
                fitz.Point(x, y), new_label, fontsize=size,
                fontname="helv", color=FORE, overlay=True
            )
            count += 1
    if count == 0:
        # Do not invent links. Files may contain different editorial destinations.
        existing = [link.get("uri", "") for pg in doc for link in pg.get_links() if "aigoritmo" in link.get("uri", "").lower()]
        print(f"NO PRIVATE LINK {filename}; existing Aigoritmo destinations: {existing}")
        doc.close()
        continue
    if count != 1:
        raise SystemExit(f"Expected exactly one private link in {filename}; got {count}")
    tmp = path.with_suffix(".tmp.pdf")
    doc.save(tmp, garbage=4, deflate=True)
    doc.close()
    check = fitz.open(tmp)
    all_links = [l.get("uri", "") for p in check for l in p.get_links()]
    if BAD in all_links or GOOD not in all_links:
        raise SystemExit(f"Failed to update hyperlink: {filename}")
    check.close()
    os.replace(tmp, path)
    print(f"UPDATED PRIVATE LINK {filename}")
