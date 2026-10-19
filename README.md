# 拾页 · 记录阅读，积累思想

这是可以直接发布到 GitHub Pages 的完整原文件，无需安装依赖或编译。

## 上传与发布

1. 在 GitHub 建立仓库，例如 `shiye`。如使用免费个人账户，可用公开仓库发布 Pages。
2. 解压文件包，将里面所有文件上传到仓库最外层。不要只上传 ZIP，也不要再套一层文件夹。进入仓库后应直接看到 `index.html`、`app.mjs`、`style.css` 等文件。
3. 打开仓库 Settings → Pages。
4. Build and deployment 下，Source 选择 Deploy from a branch。
5. Branch 选择 main，文件夹选择 / (root)，点击 Save。
6. 等待部署完成，使用 Pages 页面显示的 Visit site 链接。首次发布可能需要几分钟。
7. 在 iPhone Safari 打开该链接，使用分享菜单「添加到主屏幕」。首次联网打开后，进入「我的 → 数据与设置」确认离线资源已准备好。

`.nojekyll` 是空文件，作用是跳过 Jekyll 处理。部分电脑默认隐藏点开头的文件；如上传时未包含，可在 GitHub 的 Add file → Create new file 中创建名为 `.nojekyll` 的文件。

GitHub 官方发布说明：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 文件说明

- index.html：应用入口
- style.css：手机与桌面样式
- app.mjs：页面与交互
- core.mjs：数据校验、统计及复盘逻辑
- storage.mjs：本地数据库
- sw.js：离线缓存
- manifest.webmanifest：主屏幕应用配置
- icon-blue.png：你指定的蓝色书本图标（保留原图）

所有资源使用相对路径，适用于 GitHub Pages 的仓库子目录地址。

## 个人数据

阅读数据保存在当前浏览器的本地数据库，不写入 GitHub。这个包不含个人阅读数据、访问凭据或测试记录。请不要将自己导出的 JSON 备份上传到公开仓库。

从本机预览迁移到 GitHub Pages 后属于不同网址，本地数据不会自动迁移。请先在旧入口导出 JSON，再在新入口导入。

请定期导出 JSON 并保存到「文件」。书籍笔记和复盘可导出 Markdown；完整恢复需要 JSON。

## 后续更新

更新应用代码时，请同步更换 sw.js 中 CACHE 的版本名，以及 app.mjs 内对应的离线检查缓存名，便于设备获取新文件。升级前先备份，不要清空用户数据库。

## 验证边界

已完成主要浏览器交互、手机视口排版、备份恢复及模拟离线操作验证。真实 iPhone 主屏幕冷启动、系统分享与文件保存仍需真机确认。

## 图标更新

应用内标志、网页图标和主屏幕图标已改为提供的蓝色书本图片。上传此包中的文件，覆盖同名文件。旧版 icon.svg、icon-192.png 和 icon-512.png 已不再被引用。

如 iPhone 主屏幕仍显示旧图标，可移除旧入口后重新从 Safari 添加；操作前先导出 JSON 备份并确认文件已保存，重新添加后检查记录，必要时导入备份。
