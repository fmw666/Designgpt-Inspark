# ImgModelPlatform

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
# 复制环境变量模板文件
cp .env.example .env

# 编辑 .env 文件，填入必要的环境变量
```

4. 启动开发服务器
```bash
npm run dev
```

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffmw666%2FDesigngpt-Inspark)

点击上方按钮，按照以下步骤部署：

1. 登录或注册 Vercel 账号
2. 导入 GitHub 仓库
3. 配置环境变量（见下方说明）
4. 点击部署

## 环境变量配置

### 本地开发环境

1. 复制 `.env.example` 文件为 `.env`
2. 在 `.env` 文件中填入实际的环境变量值

### Vercel 部署环境

在 Vercel 中配置环境变量有两种方式：

#### 方式一：通过 Vercel 仪表板

1. 登录 [Vercel 仪表板](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Settings" 标签
4. 在左侧菜单找到 "Environment Variables"
5. 点击 "Add New" 添加以下环境变量：

```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 配置（如果需要）
VITE_DOUBAO_API_KEY=your_doubao_api_key
VITE_DOUBAO_API_SECRET=your_doubao_api_secret
VITE_DOUBAO_API_ENDPOINT=https://api.doubao.com
```

#### 方式二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 添加环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_DOUBAO_API_KEY
vercel env add VITE_DOUBAO_API_SECRET
vercel env add VITE_DOUBAO_API_ENDPOINT
```

### 在项目中使用环境变量

在 React 组件中使用环境变量：

```typescript
// 使用环境变量
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 示例：初始化 Supabase 客户端
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

注意事项：
1. 所有环境变量必须以 `VITE_` 开头
2. 环境变量在构建时被注入
3. 修改环境变量后需要重新部署
4. 敏感信息不要提交到代码仓库

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