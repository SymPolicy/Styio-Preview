# styio-all-in-one

This repository is the monorepo home for Styio and its client-side modules.

## Modules

| Path | Role |
| --- | --- |
| [`styio/`](styio/) | Styio language, compiler, runtime, tests, docs, and benchmarks |
| [`styio-spio/`](styio-spio/) | Local-first package manager and project workflow client |
| [`vityo/`](vityo/) | Vityo IDE, editor, and runtime window |

The root CMake project builds `styio/` and includes sibling modules when they provide their own `CMakeLists.txt`.

```bash
cmake -S . -B build
cmake --build build --target styio
cmake --build build --target spio
```
