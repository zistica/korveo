"""Enable `python -m korveo` as an alias for the `korveo` console script."""

from .cli import main

if __name__ == "__main__":
    raise SystemExit(main())
