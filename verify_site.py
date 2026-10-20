"""Check internal HTML links in the static GitHub Pages bundle."""

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).parent / "docs"


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for name in ("href", "src"):
            if name in values:
                self.urls.append(values[name])


errors = []
checked = 0
for html in ROOT.rglob("*.html"):
    parser = Links()
    parser.feed(html.read_text(encoding="utf-8"))
    for url in parser.urls:
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path or parsed.path.startswith("/"):
            continue
        target = (html.parent / unquote(parsed.path)).resolve()
        if target.is_dir():
            target /= "index.html"
        checked += 1
        if not target.is_relative_to(ROOT.resolve()) or not target.is_file():
            errors.append(f"{html.relative_to(ROOT)} → {url}")

if (ROOT / "hayvanat-bahcesi").exists() or (ROOT / "ulucami" / "foto-kaynaklari").exists():
    errors.append("Separate or unlicensed media directory included in public bundle")

if errors:
    raise SystemExit("Broken or disallowed references:\n" + "\n".join(errors))
print(f"Checked {checked} local HTML links and assets across {len(list(ROOT.rglob('*.html')))} pages.")
