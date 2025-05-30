export const en = {
  common: {
    loading: 'Loading...',
    generating: 'Generating...',
    failed: 'Generation Failed',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    system: 'System',
    save: 'Save',
    cancel: 'Cancel',
    change: 'Change',
  },
  chat: {
    placeholder: 'Type your prompt... (Ctrl + Enter for new line)',
    placeholderGenerating: 'Generating images, please wait...',
    placeholderLogin: 'Please sign in to start chatting',
    images: 'images',
    feedback: {
      helpful: 'Helpful',
      notHelpful: 'Not Helpful',
      report: 'Report',
    },
    input: {
      enterToSend: 'Enter to send',
      ctrlEnterToNewLine: 'Ctrl + Enter for new line',
      selectedModels: '{{count}} models selected',
      generating: 'Generating images...',
      characterCount: '{{count}} characters',
    },
    title: {
      edit: 'Edit title',
      placeholder: 'Enter new title...',
      characterCount: '{{count}}/13',
    },
    loading: {
      title: 'Loading conversation...',
      subtitle: 'Please wait a moment',
      loadingMessages: 'Loading messages...',
      refresh: 'Refresh',
    },
    generation: {
      generating: '🚀 Generating images...',
      success: '✅ Images generated successfully!',
      partialSuccess: '🚫 Some images failed to generate!',
      failed: '❌ All images failed to generate!',
      timeout: '⚠️ Task timeout! The task has been running for more than 10 minutes or the task status has been lost.',
      leaveWarning: 'Images are being generated. Refreshing the page will lose the generation progress. Are you sure you want to leave?',
    },
    guide: {
      title: 'Start a New Design Conversation',
      subtitle: 'Let\'s begin a creative journey and explore infinite possibilities',
      tips: {
        title: 'Usage Tips',
        examples: [
          'A cute panda playing in a bamboo forest, watercolor style',
          'A cherry blossom forest, watercolor style, soft pink and white',
          'A landscape painting, traditional Chinese style, with misty clouds'
        ],
        clickToCopy: 'Click to copy',
        copied: 'Copied to clipboard!',
        copyFailed: 'Failed to copy text'
      }
    },
  },
  model: {
    add: 'Add Model',
    search: 'Search Model',
    publishDate: 'Publish Date',
    all: 'All',
  },
  history: {
    today: 'Today',
    yesterday: 'Yesterday',
    inSevenDays: 'Last 7 Days',
    inThirtyDays: 'Last 30 Days',
    noChats: 'No chat history',
    noMessages: 'No messages',
    deleteTitle: 'Delete Chat',
    deleteMessage: 'Are you sure you want to delete this chat? This action cannot be undone.',
    delete: 'Delete',
    deleteSuccess: 'Chat deleted successfully',
    deleteError: 'Failed to delete chat',
  },
  profile: {
    title: 'Profile',
    displayName: {
      label: 'Display Name',
      placeholder: 'Enter display name...',
      empty: 'Display name cannot be empty',
      updated: 'Display name updated',
      updateFailed: 'Failed to update display name',
      set: 'Click to set display name',
      edit: 'Edit display name',
      save: 'Save',
      cancel: 'Cancel',
    },
    email: {
      label: 'Email',
    },
    createdAt: {
      label: 'Created At',
      noRecord: 'No record',
    },
    lastSignIn: {
      label: 'Last Sign In',
      noRecord: 'No record',
    },
  },
  auth: {
    logout: 'Logout',
    login: 'Login',
    notLogin: 'Not Login',
    signIn: {
      title: 'Welcome',
      subtitle: 'Welcome to AI Drawing Platform',
      description: 'Sign in with invite code + email verification',
      inviteCode: {
        label: 'Invite Code',
        placeholder: 'Enter invite code',
        verify: 'Verify',
        verified: 'Verified',
        invalid: 'Invalid invite code',
        required: 'Please verify invite code first',
      },
      email: {
        label: 'Email',
        placeholder: 'Enter email',
        invalid: 'Please enter a valid email address',
      },
      verificationCode: {
        label: 'Verification Code',
        placeholder: 'Enter verification code',
        send: 'Get Code',
        sending: 'Sending',
        countdown: 'Retry in {{count}}s',
        invalid: 'Invalid verification code',
        required: 'Please enter email and verification code',
        sendFailed: 'Failed to send verification code, please try again later',
      },
      submit: {
        default: 'Sign In',
        loading: 'Signing in...',
      },
      terms: {
        prefix: 'By signing in, you agree to our',
        terms: 'Terms of Service',
        and: 'and',
        privacy: 'Privacy Policy',
      },
      errors: {
        inviteRequired: 'Please verify invite code first',
        emailRequired: 'Please enter email and verification code',
      }
    }
  },
  settings: {
    title: 'Settings',
    language: {
      title: 'Language',
      en: 'English',
      zh: 'Chinese',
    },
    theme: {
      title: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
  errors: {
    generationFailed: 'Generation Failed',
    tryAgain: 'Please try again',
  },
  feedback: {
    title: 'Image Feedback',
    button: {
      title: 'Provide Feedback',
    },
    rating: {
      label: 'Rating',
      placeholder: 'Please select a rating',
      star: '{{count}} stars',
      halfStar: '{{count}} stars',
    },
    reasons: {
      label: 'Reasons (Multiple Choice)',
      options: {
        goodQuality: 'Good Image Quality',
        meetsExpectations: 'Meets Expectations',
        creative: 'Creative and Unique',
        detailed: 'Rich in Details',
        styleMatch: 'Appropriate Style',
        composition: 'Good Composition',
        other: 'Other',
      },
      other: {
        placeholder: 'Please enter other reasons...',
        characterCount: '{{count}}/8',
      },
    },
    comment: {
      label: 'Additional Comments',
      placeholder: 'Please enter your suggestions...',
    },
    submit: {
      button: 'Submit Feedback',
      disabled: 'Please select a rating first',
    },
    preview: {
      alt: 'Preview',
    },
  },
};
