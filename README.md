# 三维工坊 · GitHub Pages 静态版

蓝色主题的工程零件建模原型。所有 CAD 解析、三维渲染与导出都在浏览器执行，无需后台服务器、数据库或 API Key。上传文件不会发送到服务器。

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库，将本项目全部源码（包括 `.github` 文件夹）上传到 `main` 分支。
2. 打开仓库 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
3. 在 **Actions → Deploy GitHub Pages → Run workflow** 运行部署。后续推送 `main` 会自动部署。
4. 工作流完成后，在 Pages 页面打开网站地址。

工作流自动读取仓库路径，兼容 `用户名.github.io/仓库名/` 和根域名网站。GitHub Actions 只在构建时使用 Node.js；网站运行不需要 Node.js 或后端服务。

官方说明：https://docs.github.com/zh/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 本地开发与构建

安装 Node.js 22 和 pnpm 11.19.0 后：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

静态成品位于 `dist/client`。可以放在任意静态网站托管服务上。不要双击 HTML 使用 `file://` 打开，ES 模块需要 HTTP(S) 静态托管。

手动为仓库子路径构建：

```sh
PAGES_BASE_PATH=/你的仓库名 pnpm build
```

## 当前功能

- 双孔底板、矩形块、开口槽件参数化建模。
- 上传图片，手动描出简单闭合轮廓并拉伸。
- ASCII DXF 的闭合直线 LWPOLYLINE 和 CIRCLE 读取、内部孔识别、轮廓选择。附有可下载的 DXF 示例。
- 三维旋转、缩放、主视/俯视/右视、线框显示。
- 导出 STL 网格（毫米）及 JSON 模型参数。

## 当前边界

DWG 须在 CAD 软件中另存为 ASCII DXF。尚不支持复杂三视图自动匹配、OCR、带圆弧多段线、嵌套实体岛和 STEP 工程实体导出。DXF 不支持的实体会提示跳过；未指定单位按毫米处理并提示核对。图片描边应为无自交的简单轮廓；尺寸范围为 1–500 mm。

## 验证

已通过 TypeScript 检查、静态构建、DXF 尺寸与圆孔解析、无效输入拒绝、示例模型边界及 STL 导出检查。未执行浏览器交互 QA。WebMCP 提供 `create_sample_part`；当前环境无已确认支持的 WebMCP 验证上下文，未验证其注册与调用。
