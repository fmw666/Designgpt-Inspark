# DesignGPT AI

一个强大的 AI 图像生成平台，支持多种模型和自定义提示词。

| Node.js | NPM |
| :-----  | :-- |
| v22.11.0 | v10.9.0 |

## 功能特点

- 🎨 支持多种 AI 图像生成模型
- 💡 智能提示词建议
- 🔄 实时生成预览
- 📱 响应式设计，支持移动端
- 🔒 用户认证和授权
- 💾 历史记录保存

## 快速开始

### 本地开发

1. 克隆仓库
```bash
git clone https://github.com/yourusername/ImgModelPlatform.git
cd ImgModelPlatform
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的环境变量
```

4. 启动开发服务器
```bash
npm run dev
```

### 一键部署

[![Deploy with Vercel by clone](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesigngpt-Inspark)

[![Deploy with Vercel by import](https://vercel.com/button)](https://vercel.com/new/import?s=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesigngpt-Inspark&teamSlug=maovos-projects)

点击上方按钮，按照以下步骤部署：

1. 登录或注册 Vercel 账号
2. 导入 GitHub 仓库
3. 配置环境变量
4. 点击部署

## 环境变量

部署时需要配置以下环境变量：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 技术栈

- React
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件 