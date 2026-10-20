"""Extract a small, flat plan from the independently decoded original Bursa DGN sheets.

Usage: python tools/generate_dgn_underlay.py PATH_TO_ULUCAMI_FLAT_MAP_EXPERIMENT
The published JSON contains only nearby roof outlines and survey linework.
"""

import hashlib
import json
import sys
from pathlib import Path

from shapely.geometry import LineString, Polygon, box
from shapely.ops import unary_union


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
OUTPUT = ROOT / "docs" / "dgn-underlay.json"
WINDOW = box(480, 275, 750, 475)
ROOF_LAYERS = {"B_Mesken", "B_Ticari", "B_Dini tesis", "B_Resmi", "B_Tarihi"}
LINE_KINDS = {"curb", "wall", "retaining_wall", "stairs"}


def rounded_ring(coords):
    return [[round(x, 2), round(y, 2)] for x, y in coords]


def polygons_of(shape):
    if shape.geom_type == "Polygon":
        return [shape]
    return [part for part in getattr(shape, "geoms", []) if part.geom_type == "Polygon"]


flat_path = SOURCE / "flat-data.json"
details_path = SOURCE / "cartographic-details.json"
flat = json.loads(flat_path.read_text(encoding="utf-8"))
details = json.loads(details_path.read_text(encoding="utf-8"))
vertices = flat["buildings"]["v"]
faces = flat["buildings"]["f"]

roofs = []
for item in flat["buildings"]["items"]:
    if item["layer"] not in ROOF_LAYERS:
        continue
    xmin, ymin, _, xmax, ymax, _ = item["bounds"]
    if not WINDOW.intersects(box(xmin, ymin, xmax, ymax)):
        continue
    triangles = []
    start = item["first_triangle"]
    for face in faces[start:start + item["triangle_count"]]:
        triangle = Polygon([(vertices[index][0], vertices[index][1]) for index in face])
        if triangle.area > 0.01:
            triangles.append(triangle)
    if not triangles:
        continue
    roof = unary_union(triangles).buffer(0).intersection(WINDOW).simplify(0.12, preserve_topology=True)
    for polygon in polygons_of(roof):
        if polygon.area < 5:
            continue
        roofs.append({
            "id": item["sourceId"],
            "layer": item["layer"],
            "outer": rounded_ring(polygon.exterior.coords),
            "holes": [rounded_ring(hole.coords) for hole in polygon.interiors],
        })

lines = []
for item in details["lines"]:
    if item["kind"] not in LINE_KINDS or len(item["points"]) < 2:
        continue
    xmin, ymin, xmax, ymax = item["bounds"]
    if not WINDOW.intersects(box(xmin, ymin, xmax, ymax)):
        continue
    shape = LineString([(p[0], p[1]) for p in item["points"]]).intersection(WINDOW)
    parts = [shape] if shape.geom_type == "LineString" else list(getattr(shape, "geoms", []))
    for part in parts:
        if part.geom_type != "LineString" or part.length < 1.5:
            continue
        lines.append({
            "id": item["sourceId"],
            "kind": item["kind"],
            "points": rounded_ring(part.simplify(0.1).coords),
        })

payload = {
    "schema": "bursa-dgn-underlay/v1",
    "coordinateFrame": "Original DGN projected XY in metres, minus source origin; Z flattened",
    "origin": flat["origin"],
    "bounds": [480, 275, 750, 475],
    "sourceSheets": [
        {"name": Path(source["path"]).name, "sha256": source["sha256"]}
        for source in flat["metadata"]["sources"]
    ],
    "sourceProducts": {
        "flat-data.json": hashlib.sha256(flat_path.read_bytes()).hexdigest(),
        "cartographic-details.json": hashlib.sha256(details_path.read_bytes()).hexdigest(),
    },
    "interpretation": "DGN roof projections and mapped curb, wall and stair lines; flattened and simplified for visual context, not a cadastral survey",
    "roofs": roofs,
    "lines": lines,
}
OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {OUTPUT}: {len(roofs)} roofs, {len(lines)} line segments, {OUTPUT.stat().st_size} bytes")
