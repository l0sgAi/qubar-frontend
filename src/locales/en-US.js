export default {
  // 通用
  common: {
    appName: 'Qubar',
    search: 'Search',
    searchPlaceholder: 'Search circles, posts...',
    searchPosts: 'Search Posts',
    searchCircles: 'Search Circles',
    searchUsers: 'Search Users',
    loading: 'Loading...',
    loadMore: 'Load More',
    noMore: 'No more',
    noResults: 'No results',
    noData: 'No data',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    share: 'Share',
    back: 'Back',
    submit: 'Submit',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to logout?',
    logoutSuccess: 'Logged out successfully',
    operationSuccess: 'Operation successful',
    operationFailed: 'Operation failed',
    unknownError: 'Unknown error',
    unknown: 'Unknown',
    featureInDevelopment: 'Feature in development...',
    collapse: 'Collapse',
    showMore: 'Show more',
    yes: 'Yes',
    enabled: 'Enabled'
  },

  // 时间相关
  time: {
    justNow: 'Just now',
    minutesAgo: '{minutes}m ago',
    hoursAgo: '{hours}h ago',
    daysAgo: '{days}d ago',
    monthsAgo: '{months}mo ago',
    yearsAgo: '{years}y ago',
    createdAt: 'Created',
    updatedAt: 'Updated'
  },

  // 帖子相关
  post: {
    post: 'Post',
    createPost: 'Create Post',
    createPostSuccess: 'Created successfully',
    createPostFailed: 'Creation failed',
    title: 'Title',
    titlePlaceholder: 'Enter post title',
    content: 'Content',
    contentPlaceholder: 'Enter post content (Markdown supported)',
    summary: 'Summary',
    summaryPlaceholder: 'Enter summary for search and keyword matching',
    belongToCircle: 'Circle',
    selectCircle: 'Search and select a circle',
    circleRules: 'Circle Rules',
    noCircleRules: 'No rules for this circle',
    selectCircleToViewRules: 'Select a circle to view rules',
    detail: 'Post Detail',
    status: {
      normal: 'Normal',
      draft: 'Draft',
      reviewing: 'Reviewing',
      rejected: 'Rejected',
      blocked: 'Blocked'
    },
    badges: {
      pinned: 'Pinned',
      essence: 'Essence',
      locked: 'Locked'
    },
    stats: {
      views: 'Views',
      comments: 'Comments',
      likes: 'Likes',
      favorites: 'Favorites'
    },
    actions: {
      like: 'Like',
      liked: 'Liked',
      favorite: 'Favorite',
      favorited: 'Favorited',
      share: 'Share',
      comment: 'Comment'
    },
    recent: {
      title: 'Recent Posts',
      subtitle: 'Latest published posts',
      loadMore: 'Load More',
      empty: 'No recent posts yet'
    },
    noPosts: 'No posts yet',
    noPostResults: 'No post results',
    noFavorites: 'No favorites yet',
    searching: 'Searching...',
    hottest:'Trending',
    latest:'Latest',
    highlights:'Highlights',
    postNotFound: 'Post not found',
    viewDetail: 'View details'
  },

  // 圈子相关
  circle: {
    circle: 'Circle',
    interestCircle: 'Interest Circle',
    circles: 'Circles',
    myCircles: 'My Circles',
    joinCircle: 'Join Circle',
    leaveCircle: 'Leave Circle',
    joined: 'Joined',
    active: 'Active',
    viewAll: 'View All',
    myCircles: 'My Circles',
    createCircle: 'Create Circle',
    createCircleSuccess: 'Created successfully',
    joinSuccess: 'Joined successfully',
    joinFailed: 'Failed to join',
    leaveSuccess: 'Left circle',
    leaveFailed: 'Failed to leave',
    disturb: 'Mute',
    disturbOn: 'Mute On',
    disturbOff: 'Mute',
    disturbEnabled: 'Mute enabled',
    disturbDisabled: 'Mute disabled',
    createPost: 'Post',
    members: 'Members',
    posts: 'Posts',
    description: 'Description',
    noCircles: 'No circles yet',
    noCircleResults: 'No circle results',
    resultsMayBeIncomplete: 'Results may be incomplete, refine your keyword',
    moreOptions: 'More',
    report: 'Report',
    joinType: 'Join Type',
    joinTypeDirect: 'Direct Join',
    joinTypeReview: 'Review Required',
    joinTypePrivate: 'Private Circle',
    memberInfo: 'Member Info',
    roleMember: 'Member',
    roleAdmin: 'Admin',
    roleOwner: 'Owner',
    statusMuted: 'Muted',
    rules: 'Circle Rules',
    aboutCircle: 'About Circle',
    hotness: 'Hotness',
    noDescription: 'No description',
    yourMemberInfo: 'Your Member Info',
    pinnedDisplay: 'Pinned',
    messageDisturb: 'Notifications Muted',
    shareCircle: 'Share Circle',
    circleIdNotFound: 'Circle ID not found',
    statusNormal: 'Normal',
    form: {
      name: 'Circle Name',
      namePlaceholder: 'Enter circle name',
      slug: 'Unique Identifier',
      slugPlaceholder: 'Auto-generate or enter manually (lowercase letters, numbers, hyphens only)',
      description: 'Description',
      descriptionPlaceholder: 'Briefly describe this interest circle...',
      avatar: 'Avatar',
      avatarUpload: 'Click to Upload',
      avatarTip: 'Recommended size 200x200px',
      cover: 'Cover Image',
      coverTip: 'Recommended size 1200x300px',
      rules: 'Circle Rules',
      rulesPlaceholder: 'Enter behavioral guidelines for the circle...',
      category: 'Category',
      categoryPlaceholder: 'Select a category',
      joinType: 'Join Type',
      joinTypeDirect: 'Direct Join',
      joinTypeDirectDesc: 'Anyone can join directly',
      joinTypeReview: 'Review Required',
      joinTypeReviewDesc: 'Applications require admin review',
      joinTypePrivate: 'Private Circle',
      joinTypePrivateDesc: 'Invite only',
      createButton: 'Create Circle',
      step1Title: 'Basic Info',
      step2Title: 'Images & Rules',
      step3Title: 'Category & Access',
      step4Title: 'Review',
      nextStep: 'Next',
      prevStep: 'Previous',
      cropAvatarTitle: 'Crop Avatar',
      cropCoverTitle: 'Crop Cover',
      cropConfirm: 'Confirm Crop',
      cropReset: 'Reset',
      previewButton: 'Preview Effect',
      previewTitle: 'Effect Preview',
      previewHint: 'Drag the crop box to preview the header live',
      previewNamePlaceholder: 'Circle name (sample)',
      validation: {
        nameRequired: 'Please enter circle name',
        nameLength: 'Name length should be between 2-50 characters',
        slugPattern: 'Can only contain lowercase letters, numbers and hyphens',
        slugMaxLength: 'Maximum 60 characters',
        descriptionRequired: 'Please enter description',
        descriptionLength: 'Description length should be between 10-2000 characters',
        rulesRequired: 'Please enter circle rules',
        rulesLength: 'Rules length should be between 10-2000 characters',
        categoryRequired: 'Please select a category',
        pleaseComplete: 'Please complete the required fields before submitting'
      },
      messages: {
        avatarUploadSuccess: 'Avatar uploaded successfully',
        avatarUploadFailed: 'Avatar upload failed',
        coverUploadSuccess: 'Cover uploaded successfully',
        coverUploadFailed: 'Cover upload failed',
        uploadFailedRetry: 'Upload failed, please try again',
        createSuccess: 'Circle created successfully!',
        createFailed: 'Creation failed, please try again',
        loadCategoriesFailed: 'Failed to load categories',
        createNetworkError: 'Creation failed, please check network connection',
        cropFailed: 'Crop failed, please try again'
      }
    }
  },

  // 用户相关
  user: {
    user: 'User',
    username: 'Username',
    avatar: 'Avatar',
    profile: 'Profile',
    editProfile: 'Edit Profile',
    myPosts: 'My Posts',
    posts: 'Posts',
    myFavorites: 'My Favorites',
    browseHistory: 'History',
    myGroups: 'Circles',
    userInfo: 'User Info',
    basicInfo: 'Basic Info',
    email: 'Email',
    phone: 'Phone',
    gender: 'Gender',
    birthday: 'Birthday',
    role: 'Role',
    status: 'Status',
    notSet: 'Not set',
    notBound: 'Not bound',
    normal: 'Normal',
    disabled: 'Disabled',
    userSearchInDevelopment: 'User search in development...',
    anonymous: 'Anonymous',
    admin: 'Admin',
    noUserResults: 'No user results',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{days}d ago',
    monthsAgo: '{months}mo ago',
    yearsAgo: '{years}y ago',
    genders: {
      notSet: 'Not set',
      male: 'Male',
      female: 'Female',
      other: 'Other'
    },
    roles: {
      user: 'User',
      admin: 'Admin',
      superAdmin: 'Super Admin',
      agentBot: 'Agent Bot'
    },
    editModal: {
      title: 'Edit Profile',
      usernamePlaceholder: 'Enter username (1-50 characters)',
      phonePlaceholder: 'Enter phone number',
      genderPlaceholder: 'Select gender',
      birthdayPlaceholder: 'Select birthday',
      clickUploadAvatar: 'Click to upload avatar',
      cropAvatarTitle: 'Crop Avatar',
      previewTitle: 'Avatar Preview',
      previewHint: 'Drag the crop box to preview the avatar live',
      avatarTip: 'Avatar supports JPG, JPEG, PNG, GIF, WebP, SVG formats, max 10MB',
      saveChanges: 'Save Changes',
      usernameLengthError: 'Username must be 1-50 characters',
      phoneFormatError: 'Please enter a valid phone number',
      avatarTypeError: 'Only JPG, JPEG, PNG, GIF, WebP, SVG formats are supported',
      avatarSizeError: 'Image size cannot exceed 10MB',
      avatarUploadSuccess: 'Avatar uploaded successfully',
      avatarUploadFailed: 'Avatar upload failed',
      noChangesWarning: 'Please modify at least one field',
      updateSuccess: 'Profile updated successfully',
      updateFailed: 'Failed to update profile',
      fetchFailed: 'Failed to fetch user info',
      clearHistory: 'Clear browsing history'
    },
    passwordModal: {
      button: 'Change Password',
      title: 'Change Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      newPasswordPlaceholder: 'Enter new password (at least 6 characters)',
      confirmPasswordPlaceholder: 'Enter the new password again',
      lengthError: 'Password must be at least 6 characters',
      mismatchError: 'The two passwords do not match',
      updateSuccess: 'Password changed successfully',
      updateFailed: 'Failed to change password',
      sessionTip: 'Your current session stays valid after changing the password. No need to log in again.'
    }
  },

  // 导航和菜单
  nav: {
    home: 'Home',
    recommend: 'Recommend',
    following: 'Following',
    hot: 'Hot',
    latest: 'Latest',
    discover: 'Discover',
    create: 'Create',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
    searchResults: 'Search Results',
    keyword: 'Keyword'
  },

  // AI agent management (/admin/agents, admins only, role=1)
  agent: {
    title: 'Agent Management',
    navEntry: 'Agents',
    noPermission: 'Access denied: admins only',
    searchPlaceholder: 'Search agents by name',
    create: 'New Agent',
    edit: 'Edit Agent',
    unlimited: '∞',
    deleteSuccess: 'Deleted',
    deleteConfirm: 'Delete "{name}"? This cannot be undone (soft delete, no restore).',
    statusUpdateFailed: 'Failed to update status',
    triggerModes: {
      all: 'All new posts',
      keyword: 'Keywords',
      manual: 'Manual'
    },
    table: {
      name: 'Agent',
      protocol: 'Protocol',
      trigger: 'Trigger',
      rateLimit: 'Rate Limit',
      status: 'Status',
      createTime: 'Created At',
      actions: 'Actions'
    },
    form: {
      sectionBasic: 'Basic Info',
      sectionApi: 'Model Access',
      sectionTrigger: 'Trigger & Rate Limit',
      name: 'Name',
      namePlaceholder: '1-50 chars, globally unique',
      avatarUrl: 'Avatar',
      avatarUpload: 'Upload Avatar',
      avatarRemove: 'Remove',
      cropAvatarTitle: 'Crop Bot Avatar',
      avatarTypeError: 'Only JPEG / PNG / GIF / WebP / SVG are supported',
      avatarSizeError: 'Image must be under 10MB',
      avatarUploadFailed: 'Avatar upload failed, please retry',
      protocol: 'API Protocol',
      baseUrl: 'Custom API Base URL',
      baseUrlPlaceholder: 'Leave empty to use the official endpoint',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'sk-...',
      apiKeyCurrent: 'Configured: {mask}',
      apiKeyNone: 'No key configured',
      apiKeyNewPlaceholder: 'Enter a new key to replace; leave empty to keep',
      apiKeyClear: 'Clear the saved key',
      model: 'Model',
      modelPlaceholder: 'e.g. gpt-4o-mini / claude-sonnet-5',
      llmParams: 'LLM Params (replaced as a whole)',
      systemPrompt: 'System Prompt',
      systemPromptPlaceholder: 'Persona and reply requirements (optional)',
      keywords: 'Trigger Keywords',
      keywordsPlaceholder: 'Type a keyword and press Enter',
      keywordsRequired: 'At least one keyword is required in keyword mode',
      filterPrompt: 'Reply Filter (optional)',
      filterPromptPlaceholder: 'e.g. Only reply to programming questions. Leave empty to reply on any keyword hit',
      maxReplies: 'Max replies / hour',
      minInterval: 'Min interval',
      perHour: '/h',
      seconds: 's',
      noteTitle: 'Note',
      note: 'A comment containing any keyword triggers a reply. With a reply filter set, the LLM first decides whether to reply (rejected judgments don\'t consume rate-limit quota).',
      atLeastOne: 'Modify at least one field',
      createSuccess: 'Created',
      updateSuccess: 'Saved'
    }
  },

  // Trending page (/hot)
  trending: {
    title: 'Trending',
    window24h: '24h',
    window7d: '7d',
    posts: 'Trending Posts',
    circles: 'Trending Circles',
    users: 'Trending Users',
    refreshedJustNow: 'Updated just now',
    refreshedMinutesAgo: 'Updated {n} min ago',
    refreshedHoursAgo: 'Updated {n} h ago',
    refreshedNever: 'No data yet',
    empty: 'No trending data',
    loadFailed: 'Failed to load trending'
  },

  // Discover page (/discover): random circles + posts to expand your interests
  discover: {
    title: 'Discover',
    subtitle: 'Step out of your bubble and explore content you haven\'t seen',
    modeStream: 'Stream',
    modeSectioned: 'Lists',
    modeWall: 'Grid',
    circlesSection: 'Discover Circles',
    postsSection: 'Discover Posts',
    exploreHint: 'Explore',
    joinDirect: 'Open',
    joinReview: 'Review',
    refreshed: 'Fresh content just dropped in',
    refresh: 'Refresh',
    refreshing: 'Refreshing…',
    empty: 'Nothing to discover yet. Try Refresh.',
    loadFailed: 'Failed to load discover content',
    members: 'members',
    posts: 'posts'
  },

  // 登录页
  login: {
    tagline: 'Connect interests, discover possibilities',
    googleLogin: 'Continue with Google',
    githubLogin: 'Continue with GitHub',
    microsoftLogin: 'Continue with Microsoft',
    loginAgreement: 'By logging in, you agree to our',
    userAgreement: 'User Agreement',
    privacyPolicy: 'Privacy Policy',
    and: 'and',

    tabs: {
      login: 'Login',
      register: 'Register'
    },

    email: {
      label: 'Email Address',
      placeholder: 'Enter your email address'
    },
    password: {
      label: 'Password',
      placeholder: 'Enter your password'
    },
    submit: 'Login',
    dividerText: 'or continue with',
    browseAsGuest: 'Browse as guest',

    forgotPassword: 'Forgot password?',

    register: {
      sendCode: 'Send Code',
      resendCode: 'Resend',
      resendIn: 'Resend in {seconds}s',
      codeSent: 'Verification code sent',
      codeSentTo: 'Code sent to {email}',
      codePlaceholder: 'Enter 6-digit code',
      verify: 'Verify',
      nextStep: 'Next',
      usernameLabel: 'Username',
      usernamePlaceholder: 'Choose a username',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Re-enter your password',
      submit: 'Complete',
      success: 'Registration successful!',
      emailExists: 'This email is already registered',
      rateLimit: 'Too many requests, please try again later'
    },

    forgotPasswordModal: {
      title: 'Reset Password',
      stepSendCode: 'Send Code',
      stepVerify: 'Verify',
      stepReset: 'New Password',
      sendCode: 'Send Code',
      resetButton: 'Reset Password',
      emailNotFound: 'This email is not registered',
      accountDisabled: 'Account has been disabled, password cannot be reset',
      verificationExpired: 'Verification expired, please request a new code',
      resetSuccess: 'Password reset successful, please log in with your new password',
      resetFailed: 'Failed to reset password'
    },

    passwordStrength: {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      hint: 'At least 8 characters with letters and numbers'
    },

    validation: {
      emailRequired: 'Please enter your email',
      passwordRequired: 'Please enter your password',
      passwordMinLength: 'Password must be at least 8 characters',
      passwordPattern: 'Password must contain letters and numbers',
      confirmPasswordRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match',
      codeRequired: 'Please enter the code',
      codeFormat: 'Code must be 6 digits',
      usernameRequired: 'Please enter a username',
      usernameLength: 'Username must be 2-30 characters',
      usernamePattern: 'Only letters, numbers, underscores and Chinese characters'
    },

    messages: {
      loginSuccess: 'Login successful!',
      loginFailed: 'Login failed: {error}',
      registerFailed: 'Registration failed: {error}',
      codeVerified: 'Email verified successfully',
      codeInvalid: 'Invalid or expired code',
      sendCodeFailed: 'Failed to send verification code'
    },

    // Guest login prompt modal (shown when anonymous user clicks a write action)
    guestPrompt: {
      title: 'Login to continue',
      desc: 'Log in to unlock full features and track your browsing history.',
      descWithAction: 'Log in to {action}, save posts, and interact.',
      goLogin: 'Log in',
      goRegister: 'Create an account',
      continueGuest: 'Not now, keep browsing',
      actions: {
        like: 'like posts',
        collect: 'collect posts',
        comment: 'post comments',
        join: 'join circles'
      }
    }
  },

  // 表单验证
  validation: {
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
    invalidPhone: 'Please enter a valid phone number',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    tooShort: 'Content too short',
    tooLong: 'Content too long'
  },

  // 评论相关
  comment: {
    editor: {
      title: 'Post a Comment',
      placeholder: 'Write your comment... (supports images and emoji)',
      submit: 'Post Comment',
      success: 'Comment posted',
      failed: 'Comment failed',
      uploadImage: 'Upload Image',
      loginToComment: 'Log in to post a comment...'
    },
    list: {
      title: 'Comments ({count})',
      viewReplies: 'View {count} replies',
      collapseReplies: 'Collapse replies',
      loadMoreReplies: 'Load more replies',
      noMore: 'No more comments',
      empty: 'No comments yet. Be the first to comment!',
      pagination: {
        total: 'Total {count}',
        page: 'Goto',
        goto: 'Go'
      }
    },
    sort: {
      newest: 'Newest',
      hottest: 'Hottest'
    },
    actions: {
      reply: 'Reply'
    },
    reply: {
      placeholder: '{name}',
      success: 'Reply posted',
      failed: 'Reply failed'
    }
  },

  // 图片上传
  upload: {
    uploading: 'Uploading',
    success: 'Upload successful',
    failed: 'Upload failed, please try again',
    maxImages: 'Up to {max} images allowed',
    exceedLimit: 'Limit exceeded, uploading the first {remaining} only'
  },

  // Home feed
  feed: {
    refreshed: 'Recommendations refreshed',
    empty: 'No content yet',
    emptyFollowing: "You haven't joined any circles yet — explore circles you might like",
    loadFailed: 'Failed to load',
    loginRequiredTab: 'This content requires login to view'
  },

  // 消息提示
  messages: {
    loginRequired: 'Please login first',
    pleaseLoginFirst: 'Please login first',
    operationFailed: 'Operation failed: {error}',
    getDetailFailed: 'Failed to get details: {error}',
    deleteSuccess: 'Deleted successfully',
    deleteFailed: 'Delete failed: {error}',
    updateSuccess: 'Updated successfully',
    updateFailed: 'Update failed: {error}',
    copySuccess: 'Copied successfully',
    copyFailed: 'Copy failed',
    likeFeaturePending: 'Like feature pending',
    favoriteFeaturePending: 'Favorite feature pending',
    likeFailed: 'Like operation failed'
  },

  // Terms of Service
  terms: {
    title: 'User Agreement',
    lastUpdated: 'Last updated: January 2025',
    backToLogin: 'Back to Login',
    sections: [
      {
        title: '1. Acceptance of Terms',
        paragraphs: [
          'Welcome to Qubar (the "Service"). By accessing or using the Service, you confirm that you have read, understood, and agree to be bound by this User Agreement (the "Agreement"). If you do not agree to any of the terms of this Agreement, please do not use the Service.'
        ]
      },
      {
        title: '2. Service Description',
        paragraphs: [
          'Qubar is an interest-based social platform designed to help users discover and connect with various interest communities. The Service includes, but is not limited to:'
        ],
        lists: [
          [
            'User account creation and authentication',
            'Interest tags and community discovery',
            'Interaction and communication with other users',
            'Content sharing and discussion',
            'Personalized recommendations and matching'
          ]
        ]
      },
      {
        title: '3. User Accounts',
        subsections: [
          {
            title: '3.1 Account Registration',
            paragraphs: ['To use the Service, you need to create an account. You represent and warrant that:'],
            lists: [
              [
                'The registration information you provide is true, accurate, and complete',
                'You are at least 13 years old or meet the legal age in your region',
                'You are the sole person using your account',
                'You will maintain the security of your account information'
              ]
            ]
          },
          {
            title: '3.2 Account Security',
            paragraphs: [
              'You are responsible for all activities that occur under your account, whether authorized or not. If you become aware of any unauthorized use of your account, please notify us immediately.'
            ]
          }
        ]
      },
      {
        title: '4. User Conduct',
        paragraphs: ['When using the Service, you agree not to:'],
        lists: [
          [
            'Upload, post, or transmit any illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable content',
            'Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with any person or entity',
            'Upload, post, or transmit any content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party',
            'Interfere with or disrupt the Service or servers and networks connected to the Service',
            'Intentionally or unintentionally violate any applicable local, state, national, or international law',
            'Harass or otherwise harm another user',
            'Collect or store personal data of other users'
          ]
        ]
      },
      {
        title: '5. Intellectual Property',
        paragraphs: [
          'The Service and its original content, features, and design are the exclusive property of Qubar and its licensors, protected by copyright, trademark, and other intellectual property laws. You agree not to copy, modify, distribute, or otherwise use any part of the Service without our express written permission.'
        ]
      },
      {
        title: '6. Content Rights',
        paragraphs: [
          'You retain ownership of all content you submit, post, or display through the Service ("Your Content"). By submitting, posting, or displaying Your Content, you grant us a worldwide, royalty-free, non-exclusive license to use, copy, modify, distribute, and display Your Content in order to:'
        ],
        lists: [
          [
            'Provide, maintain, and improve the Service',
            'Develop and provide new services',
            'Prevent abuse and illegal activities',
            'Fulfill our legal obligations'
          ]
        ]
      },
      {
        title: '7. Termination',
        paragraphs: [
          'We may, at our sole discretion and at any time, with or without notice, suspend or terminate your account and right to access the Service, for reasons including but not limited to:'
        ],
        lists: [
          [
            'Violation of this Agreement',
            'Engaging in fraudulent or illegal activities',
            'Posing a security risk to other users or our service',
            'Prolonged inactivity'
          ]
        ]
      },
      {
        title: '8. Disclaimer',
        paragraphs: [
          'The Service is provided on an "as is" and "as available" basis, without any express or implied warranties. We are not liable for:'
        ],
        lists: [
          [
            'The continuous availability, timeliness, or security of the Service',
            'The accuracy, reliability, or content of any content, advertising, products, or other materials included in or linked from the Service',
            'Any direct, indirect, incidental, special, or consequential damages arising from the use of the Service'
          ]
        ]
      },
      {
        title: '9. Indemnification',
        paragraphs: [
          'You agree to indemnify and hold Qubar and its officers, directors, employees, agents, and licensors harmless from any claims, damages, obligations, losses, liabilities, costs, or expenses arising from your use of the Service or your breach of this Agreement.'
        ]
      },
      {
        title: '10. Changes to the Agreement',
        paragraphs: [
          'We reserve the right to modify or replace this Agreement at any time. If the revisions are material, we will provide notice before the new terms take effect. Continued use of the Service constitutes your acceptance of the revised Agreement.'
        ]
      },
      {
        title: '11. Governing Law',
        paragraphs: [
          'This Agreement is governed by and construed in accordance with the laws of the People\'s Republic of China. Any disputes arising from this Agreement shall be submitted to a court with jurisdiction for resolution.'
        ]
      },
      {
        title: '12. Contact Us',
        paragraphs: ['If you have any questions or concerns about this Agreement, please contact us at:'],
        lists: [['Email: legal@qubar.com', 'Address: Pudong New Area, Shanghai, China']]
      }
    ]
  },

  // Privacy Policy
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: January 2025',
    backToLogin: 'Back to Login',
    intro:
      'Qubar ("we", "us", or "the Service") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and protect your information. By using the Service, you agree to the practices described in this Privacy Policy.',
    sections: [
      {
        title: '1. Information We Collect',
        subsections: [
          {
            title: '1.1 Information You Provide',
            paragraphs: ['When you use the Service, we may collect the following information:'],
            lists: [
              [
                { strong: 'Account information: ', text: 'name, email address, profile picture, date of birth' },
                { strong: 'Authentication information: ', text: 'information provided when authenticating via third-party services (e.g., Google)' },
                { strong: 'Interest tags: ', text: 'your selected or generated interests and tags' },
                { strong: 'Content: ', text: 'posts, comments, images, videos, and other content you publish' },
                { strong: 'Communications: ', text: 'correspondence between you and us' }
              ]
            ]
          },
          {
            title: '1.2 Automatically Collected Information',
            paragraphs: ['When you access or use the Service, we automatically collect:'],
            lists: [
              [
                { strong: 'Device information: ', text: 'device type, operating system, browser type, unique device identifier' },
                { strong: 'Usage information: ', text: 'access time, pages viewed, features used, links clicked' },
                { strong: 'Location information: ', text: 'approximate geographic location based on IP address' },
                { strong: 'Log information: ', text: 'server logs, error reports, performance data' }
              ]
            ]
          },
          {
            title: '1.3 Cookies and Similar Technologies',
            paragraphs: [
              'We use cookies, web beacons, and similar technologies to collect and store information. Cookies are small text files stored on your device to remember your preferences, improve user experience, and analyze usage trends.'
            ]
          }
        ]
      },
      {
        title: '2. How We Use Your Information',
        paragraphs: ['We use the collected information to:'],
        lists: [
          [
            { strong: 'Provide, maintain, and improve the service: ', text: 'process your requests, personalize your experience, develop new features' },
            { strong: 'Authentication and security: ', text: 'verify your identity, prevent fraud and abuse, protect account security' },
            { strong: 'Personalized recommendations: ', text: 'recommend content, users, and communities based on your interests' },
            { strong: 'Communication: ', text: 'send service notifications, updates, security alerts, and marketing messages (optional)' },
            { strong: 'Analytics: ', text: 'analyze usage trends, improve service performance, understand user behavior' },
            { strong: 'Legal compliance: ', text: 'comply with legal obligations, respond to legal requests, protect our rights' }
          ]
        ]
      },
      {
        title: '3. Information Sharing',
        subsections: [
          {
            title: '3.1 We Do Not Sell Your Personal Information',
            paragraphs: ['We do not sell your personal information to third parties.']
          },
          {
            title: '3.2 Circumstances Under Which We May Share Information',
            lists: [
              [
                { strong: 'Service providers: ', text: 'sharing necessary information with third-party service providers that help us operate the Service (e.g., cloud storage, data analytics, payment processing)' },
                { strong: 'Business transfers: ', text: 'in the event of a merger, acquisition, or asset sale, your information may be transferred to the relevant party' },
                { strong: 'Legal requirements: ', text: 'disclosing information when we believe in good faith that the law requires it, to protect our rights, or to prevent illegal activities' },
                { strong: 'With your consent: ', text: 'sharing information in other ways with your explicit consent' }
              ]
            ]
          },
          {
            title: '3.3 Public Information',
            paragraphs: [
              'Your profile information (name, photo, interest tags) is visible to other users. You can control what information is public through your account settings.'
            ]
          }
        ]
      },
      {
        title: '4. Data Security',
        paragraphs: ['We take reasonable technical and organizational measures to protect your information from unauthorized access, use, or disclosure:'],
        lists: [
          [
            { strong: 'Encryption: ', text: 'SSL/TLS encryption during transmission' },
            { strong: 'Access control: ', text: 'restricting access to personal information' },
            { strong: 'Security audits: ', text: 'conducting regular security reviews and assessments' },
            { strong: 'Data retention: ', text: 'retaining information for the necessary period, then securely deleting it' }
          ]
        ],
        warning:
          'While we strive to protect your information, no method of internet transmission or electronic storage is 100% secure. Although we seek to protect your personal information with reasonable means, we cannot guarantee its absolute security.'
      },
      {
        title: '5. Your Privacy Rights',
        paragraphs: ['Under applicable law, you may have the following rights:'],
        lists: [
          [
            { strong: 'Right of access: ', text: 'request a copy of the personal information we hold about you' },
            { strong: 'Right to rectification: ', text: 'request correction of inaccurate or incomplete information' },
            { strong: 'Right to erasure: ', text: 'request deletion of your personal information' },
            { strong: 'Right to restrict processing: ', text: 'request that we limit how we use your information' },
            { strong: 'Right to data portability: ', text: 'request to receive your information in a structured format' },
            { strong: 'Right to object: ', text: 'object to our processing of your information' },
            { strong: 'Withdraw consent: ', text: 'withdraw consent previously given (without affecting legality prior to withdrawal)' }
          ]
        ],
        paragraphs2: ['To exercise these rights, please contact us using the contact details at the bottom of this Policy. We will respond to your request promptly.']
      },
      {
        title: '6. Third-Party Links',
        paragraphs: [
          'The Service may contain links to third-party websites or services. We are not responsible for the practices or content of third-party websites. We encourage you to read the privacy policies of these third parties when you leave our Service.'
        ]
      },
      {
        title: '7. Children\'s Privacy',
        paragraphs: [
          'The Service is not directed at children under 13. We do not knowingly collect personal information from children under 13. If we discover that we have collected such information, we will take steps to delete it.'
        ]
      },
      {
        title: '8. Cross-Border Data Transfer',
        paragraphs: [
          'Your information may be transferred to and processed in countries or regions outside your own. The data protection laws of these countries or regions may differ from those in your country or region.',
          'When we transfer your information across borders, we will take appropriate measures to ensure your information receives protection consistent with this Privacy Policy.'
        ]
      },
      {
        title: '9. Changes to the Privacy Policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time. After changes, we will post the new Privacy Policy on this page and update the "Last updated" date. We recommend that you review this Privacy Policy periodically.',
          'Material changes will be communicated via email or prominent notices within the Service. Continued use of the Service constitutes your acceptance of the updated Privacy Policy.'
        ]
      },
      {
        title: '10. Contact Us',
        paragraphs: ['If you have any questions, concerns, or requests regarding this Privacy Policy or our information practices, please contact us at:'],
        lists: [
          [
            { strong: 'Email: ', text: 'privacy@qubar.com' },
            { strong: 'Address: ', text: 'Zhangjiang Hi-Tech Park, Pudong New Area, Shanghai, China' },
            { strong: 'Phone: ', text: '+86 21-1234-5678' }
          ]
        ],
        paragraphs2: ['Data Protection Officer contact:', 'Email: dpo@qubar.com']
      },
      {
        title: '11. Governing Law',
        paragraphs: [
          'This Privacy Policy is governed by and construed in accordance with the laws of the People\'s Republic of China. We comply with applicable data protection laws, including the Personal Information Protection Law (PIPL) and the Cybersecurity Law of the People\'s Republic of China.'
        ]
      }
    ],
    summaryTitle: 'Summary of Privacy Principles',
    summary: [
      '✓ Transparency: We clearly explain how we use your data',
      '✓ Control: You have rights to control your personal information',
      '✓ Security: We implement strong security measures to protect your information',
      '✓ Compliance: We comply with global privacy regulations',
      '✓ Minimization: We only collect necessary information'
    ]
  }
}
