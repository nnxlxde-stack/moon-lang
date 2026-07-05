# Moon Package Registry (Git Tags)

Moon packages are distributed via **GitHub Releases** and **semver git tags** (`vX.Y.Z`).

## Package layout

```
my-package/
  Moonfile              # package "my-package"
  moon.pkg.json         # exports + moon version constraint
  src/
    lib.moon
```

## moon.pkg.json

```json
{
  "name": "my-package",
  "version": "0.1.0",
  "moon": ">=0.3.0",
  "exports": ["src/lib.moon"]
}
```

## Moonfile dependency syntax

```moonfile
dependencies:
  Core.FS
  github.com/moon-lang/moon-review-kit: "0.1.0"
```

## CLI (planned)

- `moon add github.com/org/lib@0.2.0`
- `moon vendor`
- `moon publish` (validate + create local tag)

Vendored cache: `.moon/packages/<owner>/<repo>/<version>/` (gitignored).