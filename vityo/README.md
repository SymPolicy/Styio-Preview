# Styio View

Styio View 是面向 `styio` 生态的专属编辑器与运行视窗项目。

当前仓库阶段为 `product-led integration bootstrap`：

1. `styio-view` 先冻结产品合同与 adapter 边界
2. Flutter 主壳与编辑器核心继续独立推进
3. 上游 `styio` / `spio` 按 `styio-view` 的合同补齐机器接口
4. 面向人维护的网页入口只保留手写的 `editor.html` 线；`frontend/styio_view_app/build/web` 这类 Flutter 生成物只用于构建验证，不作为人工维护页面

文档入口见 [docs/README.md](/Users/unka/DevSpace/styio-view/docs/README.md)。

可直接查看的高保真原型入口见 [prototype/index.html](/Users/unka/DevSpace/styio-view/prototype/index.html)。

人工维护的 Web Editor 入口见 [prototype/editor.html](/Users/unka/DevSpace/styio-view/prototype/editor.html)。

实际实现入口见 [frontend/styio_view_app/README.md](/Users/unka/DevSpace/styio-view/frontend/styio_view_app/README.md)。

## Repository Hygiene Gate

1. GitHub Actions workflow `Repository Hygiene Gate` 会在每次 `push` 和 `pull_request` 时执行 `python3 scripts/check_repo_hygiene.py`
2. 这道门禁会阻断生成目录、依赖目录、打包产物后缀，以及未被明确允许的二进制文件进入仓库
3. 合法的图片类资产需要放在当前允许的前端资源路径下；若确实需要新增二进制资产，应在脚本里补一条窄范围 allowlist，而不是放宽通用规则
