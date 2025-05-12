# ImgModelPlatform - Technical Documentation

## 架构设计

### 1. 核心服务层

#### 1.1 模型服务 (modelService.ts)
- 职责：管理所有可用模型的定义和配置
- 关键接口：
  ```typescript
  interface ImageModel {
    id: string;
    name: string;
    description: string;
    maxImages: number;
    category: string;
    demo?: {
      prompt: string;
      images: string[];
    };
  }
  ```
- 设计模式：单例模式 + 工厂模式
- 扩展点：
  - 添加新模型：在 `IMAGE_MODELS` 数组中添加新模型定义
  - 自定义模型分类：修改 `category` 字段
  - 添加模型演示：扩展 `demo` 接口

#### 1.2 豆包服务 (doubaoService.ts)
- 职责：处理与豆包API的所有交互
- 关键特性：
  - 支持多种模型类型
  - 异步任务处理
  - 错误处理和重试机制
- 设计模式：适配器模式 + 策略模式
- 扩展点：
  - 添加新API端点：扩展 `makeRequest` 方法
  - 添加新模型支持：在 `DoubaoModel` 类型中添加新模型
  - 自定义请求处理：修改 `generateImage` 等方法

#### 1.3 队列服务 (queueService.ts)
- 职责：管理任务队列和并发控制
- 关键特性：
  - 通用队列实现
  - 类型安全
  - 线程安全操作
- 设计模式：队列模式
- 扩展点：
  - 添加新队列类型：继承 `Queue` 类
  - 自定义队列行为：重写队列方法

#### 1.4 速率限制服务 (rateLimiterService.ts)
- 职责：控制API调用频率
- 关键特性：
  - 令牌桶算法
  - 可配置的限制参数
  - 异步任务处理
- 设计模式：令牌桶模式
- 扩展点：
  - 自定义限制策略：修改 `RateLimiterConfig`
  - 添加新的限制规则：扩展 `RateLimiter` 类

### 2. 数据流设计

```
[用户界面] -> [服务层] -> [API层] -> [外部服务]
     ↑            ↑           ↑
     └────────────┴───────────┘
         状态管理和缓存
```

### 3. 扩展指南

#### 3.1 添加新模型
1. 在 `modelService.ts` 中定义新模型：
```typescript
{
  id: 'new-model-id',
  name: 'New Model Name',
  description: 'Model description',
  maxImages: 1,
  category: 'New Category',
  demo: {
    prompt: 'Example prompt',
    images: ['demo-image-url']
  }
}
```

2. 在 `doubaoService.ts` 中添加模型支持：
```typescript
type DoubaoModel = 
  | 'existing-model'
  | 'new-model-id';  // 添加新模型
```

#### 3.2 添加新API功能
1. 在 `doubaoService.ts` 中添加新方法：
```typescript
async newFeature(request: NewFeatureRequest): Promise<NewFeatureResponse> {
  return this.makeRequest('/v1/new-feature', request);
}
```

2. 更新类型定义：
```typescript
interface NewFeatureRequest {
  // 请求参数
}

interface NewFeatureResponse {
  // 响应数据
}
```

#### 3.3 自定义速率限制
1. 修改 `rateLimiterService.ts` 中的配置：
```typescript
export const customRateLimiter = new RateLimiter({
  maxTokens: 10,
  tokensPerSecond: 2,
  maxConcurrent: 5
});
```

### 4. 最佳实践

#### 4.1 错误处理
- 使用 try-catch 块处理异步操作
- 实现统一的错误处理机制
- 提供有意义的错误消息

#### 4.2 性能优化
- 实现请求缓存
- 使用批量处理
- 优化并发控制

#### 4.3 代码组织
- 遵循单一职责原则
- 使用接口定义契约
- 实现模块化设计

### 5. 测试策略

#### 5.1 单元测试
- 测试各个服务的核心功能
- 模拟API响应
- 验证错误处理

#### 5.2 集成测试
- 测试服务之间的交互
- 验证数据流
- 测试端到端功能

### 6. 部署考虑

#### 6.1 环境配置
- 使用环境变量管理配置
- 实现配置验证
- 支持多环境部署

#### 6.2 监控和日志
- 实现请求日志
- 添加性能监控
- 设置错误告警

## 未来扩展方向

1. 模型管理
   - 动态模型加载
   - 模型版本控制
   - 模型性能监控

2. 任务系统
   - 任务优先级
   - 任务重试机制
   - 任务状态追踪

3. 缓存系统
   - 结果缓存
   - 模型缓存
   - 配置缓存

4. 安全增强
   - API认证
   - 请求验证
   - 数据加密

## 贡献指南

1. 代码风格
   - 使用TypeScript
   - 遵循ESLint规则
   - 编写单元测试

2. 文档要求
   - 更新API文档
   - 添加代码注释
   - 更新README

3. 提交规范
   - 使用语义化提交
   - 提供测试用例
   - 说明变更原因 