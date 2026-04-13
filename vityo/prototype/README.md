# Prototype Surface

当前目录是 `styio-view` 的高保真原型与本地开发壳，不依赖 Flutter 工具链。

这里同时也是当前仓库里“给人维护的 Web Editor 入口”。
`frontend/styio_view_app/build/web` 之类的 Flutter 生成物只用于构建验证，不作为人工维护页面。

## Files

1. `index.html`: 页面结构
2. `styles.css`: 视觉系统与布局
3. `app.js`: 编辑器、模块、runtime 与保存交互
4. `dev_server.py`: 本地开发服务，提供静态资源和工作区保存 API
5. `workspace/*.styio`: 原型编辑器真实加载和保存的本地文件
6. `CHANGELOG.md`: 每轮页面可见变化记录
7. `editor.html` / `editor.css` / `editor.js`: 当前人工维护的 focused Web Editor 页面

## Current Focus

1. 顶部壳与 workspace 状态
2. 编辑器区的 visual substitution 与 semantic block surface
3. 模块/特性注册表
4. runtime surface
5. AI surface
6. mobile 交互预览
7. workspace explorer 与 tabbed runtime workspace
8. module library 与 platform capability matrix
9. staged update restart banner
10. raw source buffer 与 render projection 双面板编辑器
11. disk-backed workspace save flow
12. focused inline editor page
13. focused editor drawer layout

## Interaction Notes

1. 点击 `Substitution` 可切换显示替换
2. 点击 `Desktop / Mobile` 可切换布局方向
3. 点击模块 pill 可模拟安装/卸载
4. 点击 `Ctrl+Enter` 可触发 runtime 状态变化
5. 点击 `Close Cloud Workspace` 可查看 hosted workspace 关闭提示
6. 点击 `Staged: 1` 可模拟 staged update 在本会话保留、下次重启生效的语义
7. 点击左侧文件树可切换当前文件上下文
8. 点击 `Graph / Console / Debug` 可切 runtime 工作区页签
9. 点击 `Preview Patch` / `Apply Preview` 可演示 AI patch suggestion 流程
10. 点击顶部 open tabs 可切换打开中的源码上下文
11. 点击 `macOS / Android / iOS / Web` 平台卡可切换当前 capability profile
12. 点击 `Module Library` 中的 `Install / Unmount` 可演示按平台挂载和卸载模块
13. 点击 `Staged: 1` 后会出现 restart banner，表达热更新在下次重启时切换新模块
14. 在左侧 `Raw Source Buffer` 里直接输入源码，右侧 `Render Projection` 会实时重绘符号和函数块表面
15. 当前 `Ctrl+Enter` 会先检查最小可编译单元；未闭合的函数块会直接给出 compile blocked
16. 点击 `Save` 或按 `Command/Ctrl+S` 会把当前文件写回 `prototype/workspace/<file>.styio`
17. 访问 `http://127.0.0.1:4173/editor.html` 可以打开只保留单一编辑面的 focused editor 版本
18. focused editor 右上角按钮会呼出右侧抽屉，里面分成 `目录树` 和 `设置` 两个 Tab
19. focused editor 当前固定只维护 `main.styio`，不再混入其它非主线示例文件
20. 当前 `Styio` 默认视觉基线为 `Graphite` 壳层，并以 `#FF8A57` 作为默认强调色和 symbol 高亮色

## Maintenance Rule

1. 后续需要人工调整网页版 IDE 时，优先修改 `editor.html` / `editor.css` / `editor.js`
2. `build/web/*` 不接受人工维护；它只是 Flutter 构建产物
3. 若 Flutter Web 行为需要回归到手写页，先在这里验证交互，再考虑是否同步回 Flutter 主壳
4. 任何内部组件都不得超过外部容器；若空间不足，优先收紧盒模型、加 `min-width: 0`、改成内部滚动或重排，而不是允许内容溢出父容器
