"""Tile stills into one contact sheet: sheet.py out.jpg cols img1 img2 ..."""
import sys
from PIL import Image, ImageDraw

out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
tw, th = 960, 540
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * th), "black")
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB").resize((tw, th))
    x, y = (i % cols) * tw, (i // cols) * th
    sheet.paste(im, (x, y))
    d.text((x + 8, y + 8), f.split("/")[-1], fill=(255, 255, 0))
sheet.save(out, quality=88)
