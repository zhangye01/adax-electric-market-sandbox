# ADAX Release Process

日期：2026-06-10  
状态：当前生效。

## 1. 当前分享链接

同事可访问的在线页面：

```text
https://zhangye01.github.io/adax-electric-market-sandbox/
```

GitHub 仓库：

```text
https://github.com/zhangye01/adax-electric-market-sandbox
```

## 2. 分支职责

当前采用“源码分支 + 静态发布分支”的发布方式。

| 分支 | 内容 | 用途 |
| --- | --- | --- |
| `main` | React/Vite 源码、文档、测试、配置 | 长期开发与工程维护 |
| `gh-pages` | `dist` 构建后的静态文件 | GitHub Pages 在线预览 |

GitHub Pages 当前配置：

- source branch: `gh-pages`
- path: `/`
- status: `built`
- HTTPS: enabled

## 3. 本地目录职责

| 本地目录 | 作用 |
| --- | --- |
| `/Users/zhangye/Codex/electric-market-training-sandbox` | 源码仓库，对应远程 `main` |
| `/Users/zhangye/Codex/adax-static-release` | 静态发布仓库，对应远程 `gh-pages` |

不要在源码仓库提交 `dist/`。  
不要在静态发布仓库提交 `src/`、`docs/`、`tests/`、`node_modules/`。

## 4. 发布前检查

在源码仓库先执行 dry-run：

```bash
npm run publish:pages:dry
```

dry-run 会执行质量门禁并检查发布目录，但不会复制、提交或推送文件。

真实发布命令会自动执行：

- `npm run quality`
- 复制 `dist/` 到静态发布仓库
- 生成 `.nojekyll`
- 生成 `404.html`
- 提交静态发布仓库
- 推送到远程 `gh-pages`
- 验证公开预览链接

真实发布必须显式传入 `--yes`：

```bash
npm run publish:pages -- --yes
```

质量门禁包含：

- `npm run typecheck`
- `npm run test`
- `npm run build`

只有质量检查通过后，才能更新 `gh-pages`。

## 5. 发布步骤

推荐发布步骤：

```bash
npm run publish:pages:dry
npm run publish:pages -- --yes
```

脚本位置：

```text
scripts/publish-pages.mjs
```

脚本默认发布目录：

```text
/Users/zhangye/Codex/adax-static-release
```

如需改用其他静态发布目录，可临时设置：

```bash
ADAX_STATIC_RELEASE_DIR=/path/to/release npm run publish:pages:dry
```

脚本约束：

- `404.html` 用于支持 React 单页应用的子路径刷新。
- `.nojekyll` 必须保留，避免 GitHub Pages 对静态文件做 Jekyll 处理。
- 源码仓库必须是干净状态；dry-run 可通过 `--allow-dirty` 做本地预演。
- 发布目录不能指向源码仓库，也不能包含源码仓库。
- 静态发布仓库不得包含 `src/`、`docs/`、`tests/`、`node_modules/` 等源码目录。
- 若静态发布仓库无变化，脚本会跳过提交和推送。

## 6. 发布后验证

验证 Pages 配置：

```bash
/Users/zhangye/Codex/tools/gh-cli/gh_2.93.0_macOS_arm64/bin/gh api repos/zhangye01/adax-electric-market-sandbox/pages
```

验证页面可访问：

```bash
curl -I https://zhangye01.github.io/adax-electric-market-sandbox/
```

通过标准：

- GitHub Pages `status` 为 `built`。
- `curl -I` 返回 `HTTP/2 200` 或其他 2xx 成功状态。

## 7. GitHub CLI 状态

当前机器使用本地安装的 GitHub CLI：

```text
/Users/zhangye/Codex/tools/gh-cli/gh_2.93.0_macOS_arm64/bin/gh
```

当前授权账号：

```text
zhangye01
```

当前 token scope 包含：

- `repo`
- `read:org`
- `gist`

当前 token 不包含：

- `workflow`

因此当前不要向远程 `main` 推送 `.github/workflows/**` 文件。若未来需要 GitHub Actions 自动部署，应先刷新 GitHub CLI 授权并加入 `workflow` scope，再单独评估是否切换 Pages source 到 GitHub Actions。

## 8. 已知约束

- 当前 Pages 发布不依赖 GitHub Actions。
- 当前 Pages 发布依赖本地脚本更新 `gh-pages` 分支。
- `vite.config.ts` 中的 `base: "./"` 是 GitHub Pages 项目页路径可用的关键配置，不要随意移除。
- 浏览器端应用天然会向访问者提供构建后的 JS/CSS 文件；公开 Pages 链接不等于隐藏前端运行代码。
- 训练记录和复盘材料仍只存在访问者自己的浏览器 localStorage 中，不会被上传到 GitHub。

## 9. 回退方式

若一次发布出错：

1. 在 `adax-static-release` 中查看历史提交：

   ```bash
   git log --oneline
   ```

2. 将 `gh-pages` 推回上一个可用提交：

   ```bash
   git push origin <GOOD_COMMIT>:gh-pages --force-with-lease
   ```

3. 再次验证 Pages：

   ```bash
   curl -I https://zhangye01.github.io/adax-electric-market-sandbox/
   ```

只允许回退 `gh-pages` 静态发布分支。不要用 `git reset --hard` 回退源码仓库，除非已经明确确认影响范围。
