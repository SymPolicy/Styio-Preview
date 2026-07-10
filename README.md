# Styio All-in-One

**Monorepo home for Styio and its client-side modules.**
Part of the [Styio](https://styio.io) ecosystem.

---

This repository provides a single checkout that includes Styio, Pafio, and
Styio View as co-located modules with a unified CMake build.

## Modules

| Path | Role |
|---|---|
| [`styio/`](styio/) | Styio language, compiler, runtime, tests, docs, and benchmarks |
| [`styio-pafio/`](styio-pafio/) | Local-first package manager and project workflow client |
| [`vityo/`](vityo/) | Styio View — editor and runtime viewport |

## Build

The root CMake project builds `styio/` and includes sibling modules when they
provide their own `CMakeLists.txt`.

```bash
cmake -S . -B build
cmake --build build --target styio
cmake --build build --target pafio
```

## License

Apache-2.0. See [LICENSE](LICENSE).
