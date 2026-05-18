import pathlib

wrong = "</motion>"
right = "</div>"

for path in pathlib.Path("src").rglob("*.tsx"):
    text = path.read_text(encoding="utf-8")
    if wrong in text:
        path.write_text(text.replace(wrong, right), encoding="utf-8")
        print(f"fixed {path}")
