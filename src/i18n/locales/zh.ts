export const zh = {
  common: {
    loading: '加载中...',
    generating: '生成中...',
    failed: '生成失败',
    settings: '设置',
    language: '语言',
    theme: '主题',
    darkMode: '深色模式',
    lightMode: '浅色模式',
    system: '跟随系统',
    save: '保存',
    cancel: '取消',
    change: '切换',
  },
  chat: {
    placeholder: '输入提示词...（Ctrl + Enter 换行）',
    placeholderGenerating: '正在生成图片，请稍候...',
    placeholderLogin: '请先登录后再开始对话',
    images: '张图片',
    feedback: {
      helpful: '有帮助',
      notHelpful: '没帮助',
      report: '举报',
    },
    input: {
      enterToSend: 'Enter 发送',
      ctrlEnterToNewLine: 'Ctrl + Enter 换行',
      selectedModels: '已选择 {{count}} 个模型',
      generating: '正在生成图片...',
      characterCount: '{{count}} 字符',
    },
    title: {
      edit: '编辑标题',
      placeholder: '输入新标题...',
      characterCount: '{{count}}/13',
    },
    loading: {
      title: '正在加载对话...',
      subtitle: '请稍候片刻',
      loadingMessages: '正在加载消息...',
      refresh: '刷新',
    },
    generation: {
      generating: '🚀 正在生成图片...',
      success: '✅ 图片生成完成！',
      partialSuccess: '🚫 部分生成失败！',
      failed: '❌ 全部生成失败！',
      timeout: '⚠️ 任务超时！任务已运行超过10分钟或任务状态已丢失。',
      leaveWarning: '图片正在生成中，刷新页面将丢失生成进度，确定要离开吗？',
    },
    guide: {
      title: '开始新的设计对话',
      subtitle: '让我们开始一段创意之旅，探索无限可能',
      tips: {
        title: '使用提示',
        examples: [
          '一只可爱的熊猫在竹林中玩耍，水彩风格',
          '一片樱花林，水彩风格，柔和的粉色和白色',
          '一幅山水画，国画风格，云雾缭绕'
        ],
        clickToCopy: '点击复制',
        copied: '已复制到剪贴板！',
        copyFailed: '复制失败'
      }
    },
  },
  model: {
    add: '添加模型',
    search: '搜索模型',
    publishDate: '发布日期',
    all: '全部',
  },
  history: {
    today: '今天',
    yesterday: '昨天',
    inSevenDays: '最近7天',
    inThirtyDays: '最近30天',
    noChats: '暂无聊天记录',
    noMessages: '暂无消息',
    deleteTitle: '删除聊天',
    deleteMessage: '确定要删除这个聊天吗？此操作无法撤销。',
    delete: '删除',
    deleteSuccess: '聊天已成功删除',
    deleteError: '删除聊天失败',
  },
  profile: {
    title: '个人信息',
    displayName: {
      label: '用户名',
      placeholder: '输入用户名...',
      empty: '用户名不能为空',
      updated: '用户名已更新',
      updateFailed: '更新用户名失败',
      set: '点击设置用户名',
      edit: '编辑用户名',
      save: '保存',
      cancel: '取消',
    },
    email: {
      label: '邮箱',
    },
    createdAt: {
      label: '创建时间',
      noRecord: '暂无记录',
    },
    lastSignIn: {
      label: '最后登录时间',
      noRecord: '暂无记录',
    },
  },
  auth: {
    logout: '退出登录',
    login: '登录',
    notLogin: '未登录',
    signIn: {
      title: '欢迎登录',
      subtitle: '欢迎使用 AI 绘图平台',
      description: '邀请码+邮箱验证码 登录',
      inviteCode: {
        label: '邀请码',
        placeholder: '请输入邀请码',
        verify: '验证',
        verified: '已验证',
        invalid: '邀请码无效',
        required: '请先验证邀请码',
      },
      email: {
        label: '邮箱',
        placeholder: '请输入邮箱',
        invalid: '请输入有效的邮箱地址',
      },
      verificationCode: {
        label: '验证码',
        placeholder: '请输入验证码',
        send: '获取验证码',
        sending: '发送中',
        countdown: '{{count}}秒后重试',
        invalid: '验证码错误，请重试',
        required: '请输入邮箱和验证码',
        sendFailed: '发送验证码失败，请稍后重试',
      },
      submit: {
        default: '登录',
        loading: '登录中...',
      },
      terms: {
        prefix: '登录即表示您同意我们的',
        terms: '服务条款',
        and: '和',
        privacy: '隐私政策',
      },
      errors: {
        inviteRequired: '请先验证邀请码',
        emailRequired: '请输入邮箱和验证码',
      }
    }
  },
  settings: {
    title: '设置',
    language: {
      title: '语言',
      en: '英文',
      zh: '中文',
    },
    theme: {
      title: '主题',
      light: '浅色',
      dark: '深色',
      system: '跟随系统',
    },
  },
  errors: {
    generationFailed: '生成失败',
    tryAgain: '请重试',
  },
  feedback: {
    title: '图片反馈',
    button: {
      title: '提供反馈',
    },
    rating: {
      label: '评分',
      placeholder: '请选择评分',
      star: '{{count}} 星',
      halfStar: '{{count}} 星',
    },
    reasons: {
      label: '原因（可多选）',
      options: {
        goodQuality: '图片质量好',
        meetsExpectations: '符合预期',
        creative: '创意独特',
        detailed: '细节丰富',
        styleMatch: '风格合适',
        composition: '构图合理',
        other: '其他',
      },
      other: {
        placeholder: '请输入其他原因...',
        characterCount: '{{count}}/8',
      },
    },
    comment: {
      label: '其他建议',
      placeholder: '请输入您的建议...',
    },
    submit: {
      button: '提交反馈',
      disabled: '请先选择评分',
    },
    preview: {
      alt: '预览',
    },
  },
  assets: {
    title: '素材库',
    backToChat: '返回聊天',
    todo: '素材库功能即将推出...',
  },
};
