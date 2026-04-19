# Styio View Flutter Shell

这是 `styio-view` 的 Flutter 主实现入口，负责承载：

1. `web / windows / linux / android / macos / ios` 六端共享 GUI 壳
2. `app / editor / runtime / agent / theme / module_host / platform` 模块边界
3. 模块 manifest、platform capability matrix 与启动时装载骨架
4. `ProjectGraphAdapter / ExecutionAdapter / RuntimeEventAdapter` 的产品级消费面
5. `CLI / FFI / Cloud` 三类 adapter route 的统一能力快照

仓库级 bootstrap、共享工具链和常用构建命令见 [../../docs/BUILD-AND-DEV-ENV.md](../../docs/BUILD-AND-DEV-ENV.md)；本页只负责 Flutter 主壳自身的实现和平台 runner 细节。

## 当前状态

当前目录已经具备可运行的 Flutter 工程，当前本机验证状态：

1. `lib/` 共享壳代码
2. `assets/` 模块 manifest 与 capability matrix
3. `scripts/bootstrap_flutter_platforms.sh` 平台 runner 生成脚本
4. 六端 runner 已生成
5. `flutter test`、`flutter analyze`、`flutter build web`、`flutter build macos --debug` 已通过
6. 编辑器已具备桌面键盘输入、基础光标移动、inline glyph 预览与函数 block surface
7. 当前 `Save` 已接入 `WorkspaceDocumentStore`：本地端优先落文件系统，`web` 端走 `shared_preferences`
8. 编辑器已具备鼠标拖拽选区和基础选区高亮
9. 统一视窗族已经接入：`Windows/Linux/macOS` 与宽屏 `Web` 对齐桌面布局，`Android/iOS` 与窄屏 `Web` 对齐移动布局
10. 底部 `runtime / agent / debug` surface 已接入桌面/移动两套排版，并由同一状态模型驱动
11. 编辑器内部的 language inspector 也已接入统一视窗族；即使是宽屏 `iOS/Android` 也保持 mobile 交互和面板布局
12. language inspector 现已分化为 `desktop card stack / mobile section tabs` 两种形态，diagnostics、blocks、hover、completion、formatting 不再在窄屏里硬塞
13. active line 现在会在源码流里直接显示 inline language feedback，展示 diagnostics、hover、completion、formatting 或 caret context
14. inline language feedback 与 language inspector 都已支持直接应用 completion / formatting action，不再只是只读预览
15. diagnostics 已接入最小 quick-fix 回路，当前可直接修复 `missing assignment / stray brace / unclosed block`
16. 光标所在 token 现在会在正文中高亮，inline feedback 与 language inspector 也会显示该 token 的 lexeme / kind / semantic 上下文
17. 工作区已从 seed workspace 切到 canonical project graph 模型，围绕 `spio.toml / spio.lock / spio-toolchain.toml / .spio / styio.toml` 组织 UI
18. 主线已消费 `ProjectGraphAdapter` 与 `ExecutionAdapter`，并把 `CLI / FFI / Cloud` route 统一折叠为 `AdapterCapabilitySnapshot`
19. 工作区侧栏现在会显式展示 `Project Workflow` 与 `Compiler Handshake`，把 project preview 限制、toolchain 来源、compiler contracts 和当前主路由直接做成卡片
20. `Runtime Surface` 已复用同一份 execution route summary，并能显示最近一次执行的 `unit range / stdout / stderr / diagnostics` 统计
21. 工作区侧栏新增 `Required Handoffs` 卡，只表达 `styio-view` 还需要 `styio` / `spio` 提供哪些 machine contract，不替上游做内部实现规划
22. `Project Graph` 现在已细化到 `workspace members / packages / dependencies / targets` 四层展示，并继续保持 canonical file inference 与正式 machine payload 解耦

## 生成六端 runner

在一台新的 Debian/Ubuntu 容器或虚拟机上，可先从仓库根目录运行：

```bash
./scripts/bootstrap-dev-env.sh
```

在安装 Flutter SDK 之后执行：

```bash
cd frontend/styio_view_app
./scripts/bootstrap_flutter_platforms.sh
flutter pub get
flutter run -d macos
```

脚本会为以下平台生成 runner：

1. `web`
2. `windows`
3. `linux`
4. `android`
5. `macos`
6. `ios`

## 当前目录结构

```text
lib/src/app
lib/src/editor
lib/src/integration
lib/src/language
lib/src/runtime
lib/src/agent
lib/src/theme
lib/src/module_host
lib/src/platform
assets/module_manifests
assets/capability_matrices
```
