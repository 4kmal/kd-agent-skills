"""Contact sheet of still frames for a quick visual check -> one JPEG
usage: python tools/sheet.py snaps sheet.jpg [cols=4] [width=480]"""
import sys, os
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
w = int(sys.argv[4]) if len(sys.argv) > 4 else 480
files = sorted((f for f in os.listdir(src) if f.lower().endswith(('.png', '.jpg'))), key=lambda f: float(f[1:].rsplit('.', 1)[0]) if f[1:].rsplit('.', 1)[0].replace('.', '', 1).isdigit() else 0)
ims = [Image.open(os.path.join(src, f)).convert('RGB') for f in files]
if not ims: sys.exit('no frames in ' + src)
h = round(w * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 22)), '#111')
d = ImageDraw.Draw(sheet)
for k, (f, im) in enumerate(zip(files, ims)):
    x, y = (k % cols) * w, (k // cols) * (h + 22)
    sheet.paste(im.resize((w, h)), (x, y + 22)); d.text((x + 6, y + 5), f, fill='#ddd')
sheet.save(out, quality=88); print(f"{len(ims)} frames -> {out}")
