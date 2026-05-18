# 兔会计时器

适合会议、演讲、路演、活动流程的红黄绿牌计时器。它是一个纯静态网页应用，不需要后端，也不需要构建步骤。

## Features

- 红牌、黄牌、绿牌时间提示
- 会议议程导入与编辑
- 计时报告导出
- 中英文界面
- PWA 支持，可添加到桌面或手机主屏幕

## Run Locally

直接用任意静态服务器打开即可：

```bash
python3 -m http.server 8080
```

然后访问：

```text
http://localhost:8080/
```

## Deploy

这个仓库可以直接部署到 GitHub Pages：

1. 推送到 GitHub public repository。
2. 打开 repository 的 `Settings -> Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main`，目录选择 `/root`。

部署后访问 GitHub Pages 给出的地址即可。

## Files

```text
index.html
assets/
timer-manifest.webmanifest
timer-sw.js
```

## License

AGPL-3.0
