#!/usr/bin/env python3
"""Generate JARVIS's 1024x1024 'arc reactor' icon as a PNG.

Pure standard library (no Pillow needed), so it runs on a stock Mac.
Usage: python3 make_icon.py [output.png]
"""
import math
import struct
import sys
import zlib

SIZE = 1024


def pixel(x, y):
    c = SIZE / 2
    dx, dy = x + 0.5 - c, y + 0.5 - c
    r = math.hypot(dx, dy) / c  # 0 at centre, 1 at edge
    ang = math.atan2(dy, dx)

    # Dark navy background with a soft vignette, inside a rounded square.
    m = 0.06 * SIZE  # macOS-style margin
    q = abs(dx) - (c - m - 180), abs(dy) - (c - m - 180)
    dist = math.hypot(max(q[0], 0), max(q[1], 0)) - 180
    alpha = max(0.0, min(1.0, 0.5 - dist))
    if alpha == 0:
        return 0, 0, 0, 0
    bg = 1 - 0.55 * r
    red, green, blue = 6 * bg, 12 * bg, 24 * bg

    def glow(radius, width, strength):
        return strength * math.exp(-((r - radius) / width) ** 2)

    # Main ring + halo, segmented inner ring, bright core.
    light = glow(0.62, 0.035, 1.0) + glow(0.62, 0.14, 0.45)
    seg = 0.5 + 0.5 * math.cos(ang * 10)
    light += glow(0.42, 0.03, 0.9) * (0.25 + 0.75 * (seg > 0.35))
    light += glow(0.0, 0.16, 1.1) + glow(0.0, 0.32, 0.35)
    light += glow(0.80, 0.008, 0.5)  # thin outer trim

    red += 60 * light
    green += 190 * light
    blue += 255 * light
    # Hot white centre where the light is strongest.
    white = max(0.0, light - 0.9) * 180
    return (min(255, int(red + white)), min(255, int(green + white)),
            min(255, int(blue + white)), int(255 * alpha))


def write_png(path):
    rows = bytearray()
    for y in range(SIZE):
        rows.append(0)
        for x in range(SIZE):
            rows.extend(pixel(x, y))

    def chunk(tag, data):
        return (struct.pack(">I", len(data)) + tag + data
                + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF))

    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n")
        f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, 8, 6, 0, 0, 0)))
        f.write(chunk(b"IDAT", zlib.compress(bytes(rows), 9)))
        f.write(chunk(b"IEND", b""))


if __name__ == "__main__":
    write_png(sys.argv[1] if len(sys.argv) > 1 else "jarvis_icon.png")
