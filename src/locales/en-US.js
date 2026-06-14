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
    postNotFound: 'Post not found'
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
      cropAvatarTitle: 'Crop Avatar',
      cropCoverTitle: 'Crop Cover',
      cropConfirm: 'Confirm Crop',
      cropReset: 'Reset',
      validation: {
        nameRequired: 'Please enter circle name',
        nameLength: 'Name length should be between 2-50 characters',
        slugPattern: 'Can only contain lowercase letters, numbers and hyphens',
        slugMaxLength: 'Maximum 60 characters',
        descriptionRequired: 'Please enter description',
        descriptionLength: 'Description length should be between 10-2000 characters',
        rulesRequired: 'Please enter circle rules',
        rulesLength: 'Rules length should be between 10-2000 characters',
        categoryRequired: 'Please select a category'
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
      superAdmin: 'Super Admin'
    },
    editModal: {
      title: 'Edit Profile',
      usernamePlaceholder: 'Enter username (1-50 characters)',
      phonePlaceholder: 'Enter phone number',
      genderPlaceholder: 'Select gender',
      birthdayPlaceholder: 'Select birthday',
      clickUploadAvatar: 'Click to upload avatar',
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
    }
  },

  // 导航和菜单
  nav: {
    home: 'Home',
    recommend: 'Recommend',
    following: 'Following',
    hot: 'Hot',
    discover: 'Discover',
    create: 'Create',
    messages: 'Messages',
    notifications: 'Notifications',
    settings: 'Settings',
    profile: 'Profile',
    searchResults: 'Search Results',
    keyword: 'Keyword'
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
      uploadImage: 'Upload Image'
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
  }
}
