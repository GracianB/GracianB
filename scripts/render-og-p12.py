#!/usr/bin/env python3
"""P12 original social cover: deterministic three-world constellation, 1200x630.
Run: python3 -m pip install pillow && python3 scripts/render-og-p12.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random

W,H=1200,630
im=Image.new("RGB",(W,H),"#02070b")
d=ImageDraw.Draw(im)
rng=random.Random(127)
for _ in range(530):
    x,y=rng.randrange(20,W-20),rng.randrange(15,H-15)
    if x<720 and 145<y<545: continue
    r=rng.choices([0,1,2],weights=[5,4,1])[0]
    tint=rng.choice(["#293b48","#4d6c7c","#6c8594","#7c9b9e","#447789","#6b7182"])
    d.ellipse((x-r,y-r,x+r,y+r),fill=tint)
for x,y,c in [(818,330,"#b0c4cd"),(1050,155,"#74b697"),(1040,448,"#6fbce0")]:
    d.ellipse((x-68,y-68,x+68,y+68),outline="#18303c",width=1)
    d.ellipse((x-46,y-46,x+46,y+46),outline="#20404b",width=1)
    d.ellipse((x-12,y-12,x+12,y+12),fill=c)
    d.ellipse((x-5,y-5,x+5,y+5),fill="#f0f4f3")
for a,b in [((740,270),(817,330)),((885,270),(817,330)),((775,394),(817,330))]:
    d.line([a,b],fill="#607f90",width=2)
for x,y in [(740,270),(885,270),(775,394)]:
    d.rounded_rectangle((x-8,y-8,x+8,y+8),radius=4,fill="#b0c4cd")
for off in [-21,0,21]:
    d.arc((1050-30+off//4,88,1080+off//4,184),off,176+off,fill="#6aab90",width=2)
for off in [-14,0,14]:
    d.line((1022+off,435,1022+off,461),fill="#6fbce0",width=2)
fonts="/usr/share/fonts/truetype/dejavu/"
def f(filename,size):
    return ImageFont.truetype(fonts+filename,size)
d.text((72,70),"GB  /  CONSTELLATION ATLAS",font=f("DejaVuSansMono.ttf",19),fill="#89a5b4")
d.text((70,165),"GRACIÁN BAENA",font=f("DejaVuSans.ttf",55),fill="#ecf1f3")
d.text((70,290),"Una misma curiosidad.",font=f("DejaVuSerif.ttf",51),fill="#dce6ec")
d.text((70,362),"Muchos mundos.",font=f("DejaVuSerif-Italic.ttf",56),fill="#b9d2de")
d.line((72,440,650,440),fill="#425965",width=2)
d.text((72,465),"PERSONAS   ·   PRÁCTICA   ·   TECNOLOGÍA",font=f("DejaVuSansMono.ttf",16),fill="#90aab4")
d.text((73,563),"MURCIA · GRAN CANARIA · MADRID · LISBOA · BÉRGAMO · VARSOVIA",font=f("DejaVuSansMono.ttf",12),fill="#819baa")
out=Path(__file__).resolve().parents[1]/"og-cover.png"
im.quantize(colors=54,dither=Image.Dither.NONE).save(out,optimize=True,compress_level=9)
print(f"Constellation social cover: {out}, {out.stat().st_size} bytes")
