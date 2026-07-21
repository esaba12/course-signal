#!/usr/bin/env python3
"""Prepare static assets and the configured read-only dataset for Vercel."""

from __future__ import annotations

import shutil

from ingest import build_database, download_source
from institutions import ROOT, load_institution


def main() -> None:
    config = load_institution()
    download_source(config, force=False)
    build_database(config)
    public = ROOT / "public"
    if public.exists():
        shutil.rmtree(public)
    shutil.copytree(ROOT / "app", public)
    print(f"Prepared Vercel assets for {config['id']}.")


if __name__ == "__main__":
    main()
