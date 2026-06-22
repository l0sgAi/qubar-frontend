export default {
  // 通用
  common: {
    appName: '趣吧 Qubar',
    search: '搜索',
    searchPlaceholder: '搜索兴趣圈、帖子...',
    searchPosts: '搜索帖子',
    searchCircles: '搜索圈子',
    searchUsers: '搜索用户',
    loading: '加载中...',
    loadMore: '加载更多',
    noMore: '没有更多了',
    noResults: '暂无结果',
    noData: '暂无数据',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    share: '分享',
    back: '返回',
    submit: '提交',
    logout: '退出登录',
    logoutConfirm: '确定要退出登录吗？',
    logoutSuccess: '已退出登录',
    operationSuccess: '操作成功',
    operationFailed: '操作失败',
    unknownError: '未知错误',
    unknown: '未知',
    featureInDevelopment: '功能开发中...',
    collapse: '收起',
    showMore: '点击查看更多',
    yes: '是',
    enabled: '已开启'
  },

  // 时间相关
  time: {
    justNow: '刚刚',
    minutesAgo: '{minutes} 分钟前',
    hoursAgo: '{hours} 小时前',
    daysAgo: '{days} 天前',
    monthsAgo: '{months} 个月前',
    yearsAgo: '{years} 年前',
    createdAt: '创建时间',
    updatedAt: '更新时间'
  },

  // 帖子相关
  post: {
    post: '帖子',
    createPost: '创建帖子',
    createPostSuccess: '创建成功',
    createPostFailed: '创建失败',
    title: '标题',
    titlePlaceholder: '请输入帖子标题',
    content: '正文',
    contentPlaceholder: '请输入帖子正文内容（支持 Markdown 格式）',
    summary: '摘要',
    summaryPlaceholder: '请输入摘要，用于检索和关键词匹配',
    belongToCircle: '所属圈子',
    selectCircle: '搜索并选择圈子',
    circleRules: '圈子规则',
    noCircleRules: '该圈子暂无规则',
    selectCircleToViewRules: '选择圈子后查看规则',
    detail: '帖子详情',
    status: {
      normal: '正常',
      draft: '草稿',
      reviewing: '审核中',
      rejected: '驳回',
      blocked: '屏蔽'
    },
    badges: {
      pinned: '置顶',
      essence: '精华',
      locked: '锁定'
    },
    stats: {
      views: '浏览',
      comments: '评论',
      likes: '点赞',
      favorites: '收藏'
    },
    actions: {
      like: '点赞',
      liked: '已赞',
      favorite: '收藏',
      share: '分享',
      comment: '评论'
    },
    recent: {
      title: '近期发布',
      subtitle: '最新发布的帖子',
      loadMore: '加载更多',
      empty: '暂无近期帖子'
    },
    noPosts: '暂无帖子',
    noPostResults: '暂无帖子结果',
    noFavorites: '暂无收藏',
    searching: '搜索中...',
    hottest:'近期热点',
    latest:'最新',
    highlights:'精华',
    postNotFound: '帖子不存在',
    viewDetail: '查看详情'
  },

  // 圈子相关
  circle: {
    circle: '兴趣圈',
    interestCircle: '兴趣圈',
    circles: '兴趣圈',
    myCircles: '我的圈子',
    joinCircle: '加入圈子',
    leaveCircle: '退出圈子',
    joined: '已加入',
    active: '近期活跃',
    myCircles: '我加入的',
    createCircle: '创建圈子',
    createCircleSuccess: '创建成功',
    joinSuccess: '加入成功',
    joinFailed: '加入失败',
    leaveSuccess: '已退出圈子',
    leaveFailed: '退出失败',
    disturb: '免打扰',
    disturbOn: '免打扰已开启',
    disturbOff: '免打扰',
    disturbEnabled: '已开启免打扰',
    disturbDisabled: '已关闭免打扰',
    createPost: '发帖',
    members: '成员',
    posts: '帖子',
    description: '简介',
    noCircles: '暂无圈子',
    noCircleResults: '暂无圈子结果',
    resultsMayBeIncomplete: '结果可能不全，请细化关键字',
    moreOptions: '更多选项',
    report: '举报',
    joinType: '加入方式',
    joinTypeDirect: '直接加入',
    joinTypeReview: '需要审核',
    joinTypePrivate: '私密圈子',
    memberInfo: '成员信息',
    roleMember: '普通成员',
    roleAdmin: '管理员',
    roleOwner: '圈主',
    statusMuted: '已禁言',
    rules: '圈子规则',
    aboutCircle: '关于圈子',
    hotness: '热度',
    noDescription: '暂无描述',
    yourMemberInfo: '你的成员信息',
    pinnedDisplay: '置顶显示',
    messageDisturb: '消息免打扰',
    shareCircle: '分享圈子',
    circleIdNotFound: '圈子ID不存在',
    statusNormal: '正常',
    form: {
      name: '圈子名称',
      namePlaceholder: '请输入兴趣圈名称',
      slug: '唯一标识',
      slugPlaceholder: '留空自动生成，或手动输入（仅限小写字母、数字、连字符）',
      description: '简介描述',
      descriptionPlaceholder: '简单介绍一下这个兴趣圈...',
      avatar: '圈子头像',
      avatarUpload: '点击上传',
      avatarTip: '建议尺寸 200x200px',
      cover: '背景封面',
      coverTip: '建议尺寸 1200x300px',
      rules: '圈内规则',
      rulesPlaceholder: '请输入圈子内的行为规范...',
      category: '圈子分类',
      categoryPlaceholder: '请选择分类',
      joinType: '加入方式',
      joinTypeDirect: '直接加入',
      joinTypeDirectDesc: '任何人都可以直接加入',
      joinTypeReview: '需要审核',
      joinTypeReviewDesc: '申请需要管理员审核',
      joinTypePrivate: '私密圈子',
      joinTypePrivateDesc: '仅限邀请加入',
      createButton: '创建兴趣圈',
      step1Title: '基本信息',
      step2Title: '图片与规则',
      step3Title: '分类与权限',
      step4Title: '确认预览',
      nextStep: '下一步',
      prevStep: '上一步',
      cropAvatarTitle: '裁剪头像',
      cropCoverTitle: '裁剪背景图',
      cropConfirm: '确认裁剪',
      cropReset: '重置',
      previewButton: '效果预览',
      previewTitle: '效果预览',
      previewHint: '拖动裁剪框，实时预览圈子头部的展示效果',
      previewNamePlaceholder: '圈子名称（示例）',
      validation: {
        nameRequired: '请输入圈子名称',
        nameLength: '名称长度应在 2-50 个字符之间',
        slugPattern: '只能包含小写字母、数字和连字符',
        slugMaxLength: '最多 60 个字符',
        descriptionRequired: '请输入简介描述',
        descriptionLength: '描述长度应在 10-2000 个字符之间',
        rulesRequired: '请输入圈内规则',
        rulesLength: '规则长度应在 10-2000 个字符之间',
        categoryRequired: '请选择圈子分类',
        pleaseComplete: '请完善带 * 的必填项后再提交'
      },
      messages: {
        avatarUploadSuccess: '头像上传成功',
        avatarUploadFailed: '头像上传失败',
        coverUploadSuccess: '封面上传成功',
        coverUploadFailed: '封面上传失败',
        uploadFailedRetry: '上传失败，请重试',
        createSuccess: '兴趣圈创建成功！',
        createFailed: '创建失败，请重试',
        loadCategoriesFailed: '加载分类列表失败',
        createNetworkError: '创建失败，请检查网络连接',
        cropFailed: '裁剪失败，请重试'
      }
    }
  },

  // 用户相关
  user: {
    user: '用户',
    username: '用户名',
    avatar: '头像',
    profile: '个人资料',
    editProfile: '编辑资料',
    myPosts: '我的帖子',
    posts: '帖子',
    myFavorites: '我的收藏',
    browseHistory: '浏览历史',
    myGroups: '兴趣圈',
    userInfo: '用户信息',
    basicInfo: '基本信息',
    email: '邮箱',
    phone: '手机号',
    gender: '性别',
    birthday: '生日',
    role: '角色',
    status: '状态',
    notSet: '未设置',
    notBound: '未绑定',
    normal: '正常',
    disabled: '禁用',
    userSearchInDevelopment: '用户搜索功能开发中...',
    anonymous: '匿名用户',
    admin: '管理员',
    noUserResults: '暂无用户结果',
    today: '今天',
    yesterday: '昨天',
    daysAgo: '{days} 天前',
    monthsAgo: '{months} 个月前',
    yearsAgo: '{years} 年前',
    genders: {
      notSet: '未设置',
      male: '男',
      female: '女',
      other: '其他'
    },
    roles: {
      user: '普通用户',
      admin: '管理员',
      superAdmin: '超级管理员'
    },
    editModal: {
      title: '编辑个人信息',
      usernamePlaceholder: '请输入用户名（1-50字符）',
      phonePlaceholder: '请输入手机号',
      genderPlaceholder: '请选择性别',
      birthdayPlaceholder: '请选择生日',
      clickUploadAvatar: '点击上传头像',
      cropAvatarTitle: '裁剪头像',
      previewTitle: '头像效果预览',
      previewHint: '拖动裁剪框，实时预览头像在不同位置的展示效果',
      avatarTip: '头像支持 JPG、JPEG、PNG、GIF、WebP、SVG 格式,文件大小 ≤ 10MB',
      saveChanges: '保存修改',
      usernameLengthError: '用户名长度为1-50个字符',
      phoneFormatError: '请输入正确的手机号',
      avatarTypeError: '只支持 JPG、JPEG、PNG、GIF、WebP、SVG 格式的图片',
      avatarSizeError: '图片大小不能超过10MB',
      avatarUploadSuccess: '头像上传成功',
      avatarUploadFailed: '头像上传失败',
      noChangesWarning: '请至少修改一项信息',
      updateSuccess: '个人信息更新成功',
      updateFailed: '更新个人信息失败',
      fetchFailed: '获取用户信息失败',
      clearHistory: '清空浏览历史'
    }
  },

  // 导航和菜单
  nav: {
    home: '主页',
    recommend: '推荐',
    following: '关注',
    hot: '热门',
    discover: '发现',
    create: '创建',
    messages: '消息',
    notifications: '通知',
    settings: '设置',
    profile: '个人中心',
    searchResults: '搜索结果',
    keyword: '关键词'
  },

  // 登录页
  login: {
    tagline: '连接多元兴趣，发现无限可能',
    googleLogin: '使用 Google 账号继续',
    githubLogin: '使用 GitHub 继续',
    microsoftLogin: '使用 Microsoft 继续',
    loginAgreement: '登录即代表您同意',
    userAgreement: '《用户协议》',
    privacyPolicy: '《隐私政策》',
    and: '与',

    tabs: {
      login: '登录',
      register: '注册'
    },

    email: {
      label: '邮箱地址',
      placeholder: '请输入邮箱地址'
    },
    password: {
      label: '密码',
      placeholder: '请输入密码'
    },
    submit: '登录',
    dividerText: '或通过以下方式继续',

    forgotPassword: '忘记密码？',

    register: {
      sendCode: '发送验证码',
      resendCode: '重新发送',
      resendIn: '{seconds}s 后重发',
      codeSent: '验证码已发送',
      codeSentTo: '验证码已发送至 {email}',
      codePlaceholder: '请输入6位验证码',
      verify: '验证',
      nextStep: '下一步',
      usernameLabel: '用户名',
      usernamePlaceholder: '请输入用户名',
      confirmPasswordLabel: '确认密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      submit: '完成注册',
      success: '注册成功！',
      emailExists: '该邮箱已被注册',
      rateLimit: '请求过于频繁，请稍后再试'
    },

    passwordStrength: {
      weak: '弱',
      medium: '中',
      strong: '强',
      hint: '密码至少8位，需包含字母和数字'
    },

    validation: {
      emailRequired: '请输入邮箱地址',
      passwordRequired: '请输入密码',
      passwordMinLength: '密码至少需要8个字符',
      passwordPattern: '密码需包含字母和数字',
      confirmPasswordRequired: '请再次输入密码',
      passwordMismatch: '两次输入的密码不一致',
      codeRequired: '请输入验证码',
      codeFormat: '验证码为6位数字',
      usernameRequired: '请输入用户名',
      usernameLength: '用户名长度应在2-30个字符之间',
      usernamePattern: '用户名只能包含字母、数字、下划线和中文'
    },

    messages: {
      loginSuccess: '登录成功！',
      loginFailed: '登录失败：{error}',
      registerFailed: '注册失败：{error}',
      codeVerified: '邮箱验证成功',
      codeInvalid: '验证码无效或已过期',
      sendCodeFailed: '发送验证码失败'
    }
  },

  // 表单验证
  validation: {
    required: '此项为必填项',
    invalidEmail: '请输入有效的邮箱地址',
    invalidPhone: '请输入有效的手机号',
    minLength: '最少需要 {min} 个字符',
    maxLength: '最多允许 {max} 个字符',
    tooShort: '内容太短',
    tooLong: '内容太长'
  },

  // 评论相关
  comment: {
    editor: {
      title: '发表评论',
      placeholder: '写下你的评论...（支持图文、表情）',
      submit: '发表评论',
      success: '评论成功',
      failed: '评论失败',
      uploadImage: '上传图片'
    },
    list: {
      title: '评论 ({count})',
      viewReplies: '点击查看 {count} 条回复',
      collapseReplies: '收起回复',
      loadMoreReplies: '加载更多回复',
      noMore: '没有更多评论了',
      empty: '暂无评论，快来发表第一条评论吧',
      pagination: {
        total: '共 {count} 条',
        page: '跳至',
        goto: '跳转'
      }
    },
    sort: {
      newest: '最新',
      hottest: '最热'
    },
    actions: {
      reply: '回复'
    },
    reply: {
      placeholder: '{name}',
      success: '回复成功',
      failed: '回复失败'
    }
  },

  // 图片上传
  upload: {
    uploading: '上传中',
    success: '上传成功',
    failed: '上传失败，请重试',
    maxImages: '最多上传 {max} 张图片',
    exceedLimit: '已超出上限，仅上传前 {remaining} 张'
  },

  // 消息提示
  messages: {
    loginRequired: '请先登录',
    pleaseLoginFirst: '请先登录',
    operationFailed: '操作失败：{error}',
    getDetailFailed: '获取详情失败：{error}',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败：{error}',
    updateSuccess: '更新成功',
    updateFailed: '更新失败：{error}',
    copySuccess: '复制成功',
    copyFailed: '复制失败',
    likeFeaturePending: '点赞功能待实现',
    favoriteFeaturePending: '收藏功能待实现',
    likeFailed: '点赞操作失败'
  }
}
