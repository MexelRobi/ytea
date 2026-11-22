#!/usr/bin/env python3
import argparse
import shutil
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(
        description="Add a new #Y// syntax rule and autocomplete entry to app.js"
    )
    parser.add_argument(
        "--name",
        required=True,
        help="Internal identifier (e.g. setBg)",
    )
    parser.add_argument(
        "--regex",
        required=True,
        help="JS regex pattern without delimiters (e.g. ^set\\s+bg\\s+to\\s+(.+)$)",
    )
    parser.add_argument(
        "--js",
        required=True,
        help="Compiled JS template (m and expandRefs() are available)",
    )
    parser.add_argument(
        "--block",
        help="Optional block closer (e.g. '}' or '});') for indented block keywords",
    )
    parser.add_argument(
        "--label",
        help="Autocomplete menu label (e.g. 'set bg to color')",
    )
    parser.add_argument(
        "--insert",
        help="Autocomplete inserted text (e.g. 'set bg to ')",
    )
    parser.add_argument(
        "--detail",
        default="Custom ytea keyword",
        help="Autocomplete description",
    )
    parser.add_argument(
        "--file",
        default="app.js",
        help="Path to app.js (default: app.js)",
    )
    args = parser.parse_args()

    app_path = Path(args.file)
    if not app_path.exists():
        print(f"Error: {app_path} not found.", file=sys.stderr)
        sys.exit(1)

    content = app_path.read_text(encoding="utf-8")

    # Create a backup before modifying app.js
    backup_path = app_path.with_suffix(".js.bak")
    shutil.copy2(app_path, backup_path)

    var_name = f"{args.name}Match"
    if var_name in content:
        print(f"Error: '{var_name}' already exists in {app_path}.", file=sys.stderr)
        sys.exit(1)

    # 1. Build compiler rule for restructureYToJS
    if args.block:
        snippet = (
            f"    const {var_name} = text.match(/{args.regex}/);\n"
            f"    if ({var_name}) {{\n"
            f"      const m = {var_name};\n"
            f"      output.push(`${{pad}}{args.js}`);\n"
            f"      blockStack.push({{ indent, closer: {repr(args.block)} }});\n"
            f"      continue;\n"
            f"    }}\n\n"
        )
    else:
        snippet = (
            f"    const {var_name} = text.match(/{args.regex}/);\n"
            f"    if ({var_name}) {{\n"
            f"      const m = {var_name};\n"
            f"      output.push(`${{pad}}{args.js}`);\n"
            f"      continue;\n"
            f"    }}\n\n"
        )

    compiler_anchor = "    const tryMatch = text.match(/^try$/);"
    if compiler_anchor not in content:
        print("Error: Anchor 'tryMatch' not found in restructureYToJS.", file=sys.stderr)
        sys.exit(1)

    content = content.replace(compiler_anchor, snippet + compiler_anchor, 1)

    # 2. Optional: Register autocomplete suggestion in Y_LANGUAGE_SUGGESTIONS
    if args.label and args.insert:
        ac_anchor = "const Y_LANGUAGE_SUGGESTIONS = ["
        if ac_anchor in content:
            ac_entry = (
                f"{ac_anchor}\n"
                f"  {{ label: {repr(args.label)}, insert: {repr(args.insert)}, "
                f"kind: 'keyword', detail: {repr(args.detail)} }},"
            )
            content = content.replace(ac_anchor, ac_entry, 1)

    app_path.write_text(content, encoding="utf-8")
    print(f"Added syntax '{args.name}' to {app_path} (backup saved to {backup_path}).")


if __name__ == "__main__":
    main()
