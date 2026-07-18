export default {
  // 通用
  common: {
    appName: '趣吧',
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
      favorited: '已收藏',
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
    viewAll: '查看全部',
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
    },
    passwordModal: {
      button: '修改密码',
      title: '修改密码',
      newPassword: '新密码',
      confirmPassword: '确认密码',
      newPasswordPlaceholder: '请输入新密码（至少 6 位）',
      confirmPasswordPlaceholder: '请再次输入新密码',
      lengthError: '密码至少 6 位',
      mismatchError: '两次输入的密码不一致',
      updateSuccess: '密码修改成功',
      updateFailed: '密码修改失败',
      sessionTip: '修改成功后当前登录保持有效，无需重新登录'
    }
  },

  // 导航和菜单
  nav: {
    home: '主页',
    recommend: '推荐',
    following: '关注',
    hot: '热门',
    latest: '最新',
    discover: '发现',
    create: '创建',
    messages: '消息',
    notifications: '通知',
    settings: '设置',
    profile: '个人中心',
    searchResults: '搜索结果',
    keyword: '关键词'
  },

  // 热点页（/hot）
  trending: {
    title: '热点',
    window24h: '24 小时',
    window7d: '7 天',
    posts: '热门帖子',
    circles: '热门圈子',
    users: '热门用户',
    refreshedJustNow: '刚刚更新',
    refreshedMinutesAgo: '{n} 分钟前更新',
    refreshedHoursAgo: '{n} 小时前更新',
    refreshedNever: '暂无数据',
    empty: '暂无热点数据',
    loadFailed: '加载热点失败'
  },

  // 发现页（/discover）：随机推送圈子 + 帖子，鼓励探索兴趣边界
  discover: {
    title: '发现',
    subtitle: '跳出信息气泡，探索你还没看过的新内容',
    modeStream: '探索流',
    modeSectioned: '分类',
    modeWall: '卡片墙',
    circlesSection: '发现新圈子',
    postsSection: '发现新帖子',
    exploreHint: '探索',
    joinDirect: '直接加入',
    joinReview: '需审核',
    refreshed: '已为你换一批新内容',
    refresh: '换一批',
    refreshing: '换一批中…',
    empty: '暂无发现内容，点「换一批」试试',
    loadFailed: '加载发现内容失败',
    members: '成员',
    posts: '帖子'
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
    browseAsGuest: '先逛逛',

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

    forgotPasswordModal: {
      title: '找回密码',
      stepSendCode: '发送验证码',
      stepVerify: '验证',
      stepReset: '设置新密码',
      sendCode: '发送验证码',
      resetButton: '重置密码',
      emailNotFound: '该邮箱未注册，请检查或先注册',
      accountDisabled: '账号已被禁用，无法重置密码',
      verificationExpired: '验证已过期，请重新获取验证码',
      resetSuccess: '密码重置成功，请使用新密码登录',
      resetFailed: '重置密码失败'
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
    },

    // 访客点击写操作时的登录引导 Modal
    guestPrompt: {
      title: '登录后继续',
      desc: '登录后即可使用完整功能，还能记录你的浏览历史。',
      descWithAction: '登录后即可{action}，还能收藏与互动。',
      goLogin: '去登录',
      goRegister: '注册新账号',
      continueGuest: '暂不登录，继续浏览',
      actions: {
        like: '点赞',
        collect: '收藏',
        comment: '发表评论',
        join: '加入圈子'
      }
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
      uploadImage: '上传图片',
      loginToComment: '登录后发表评论...'
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

  // 首页信息流
  feed: {
    refreshed: '推荐已刷新',
    empty: '暂无内容',
    emptyFollowing: '还没有加入圈子，去发现感兴趣的圈子吧',
    loadFailed: '加载失败',
    loginRequiredTab: '此内容需要登录后查看'
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
  },

  // 用户协议
  terms: {
    title: '用户协议',
    lastUpdated: '最后更新日期：2025年1月',
    backToLogin: '返回登录',
    sections: [
      {
        title: '1. 接受条款',
        paragraphs: [
          '欢迎使用趣吧（以下简称"本服务"）。通过访问或使用本服务，您确认您已阅读、理解并同意受本用户协议（以下简称"协议"）的约束。如果您不同意本协议的任何条款，请不要使用本服务。'
        ]
      },
      {
        title: '2. 服务说明',
        paragraphs: [
          '趣吧是一个兴趣社交平台，旨在帮助用户发现和连接各种兴趣社区。本服务包括但不限于：'
        ],
        lists: [
          [
            '用户账户创建和身份验证',
            '兴趣标签和社区发现',
            '与其他用户的互动和交流',
            '内容分享和讨论',
            '个性化推荐和匹配'
          ]
        ]
      },
      {
        title: '3. 用户账户',
        subsections: [
          {
            title: '3.1 账户注册',
            paragraphs: ['在使用本服务时，您需要创建一个账户。您声明并保证：'],
            lists: [
              [
                '您提供的注册信息真实、准确、完整',
                '您年满13周岁或达到所在地区的法定年龄',
                '您是使用您账户的唯一人员',
                '您将维护您的账户信息的安全性'
              ]
            ]
          },
          {
            title: '3.2 账户安全',
            paragraphs: [
              '您对您的账户下发生的所有活动负责，无论该活动是否经过您授权。如果您发现任何未经授权使用您账户的情况，请立即通知我们。'
            ]
          }
        ]
      },
      {
        title: '4. 用户行为准则',
        paragraphs: ['使用本服务时，您同意不会：'],
        lists: [
          [
            '上传、发布或传输任何非法、有害、威胁性、辱骂性、骚扰性、诽谤性、粗俗、淫秽或其他令人反感的内容',
            '冒充任何个人或实体，或虚假陈述或以其他方式歪曲您与任何个人或实体的从属关系',
            '上传、发布或传输任何侵犯任何方专利、商标、商业秘密、版权或其他专有权利的内容',
            '干扰或破坏本服务或连接到本服务的服务器或网络',
            '故意或无意地违反任何适用的地方法、州、国家或国际法律',
            '骚扰或以其他方式伤害另一个用户',
            '收集或存储其他用户的个人数据'
          ]
        ]
      },
      {
        title: '5. 知识产权',
        paragraphs: [
          '本服务及其原始内容、功能和设计均为趣吧及其许可方的专有财产，受版权、商标和其他知识产权法律的保护。您同意不复制、修改、分发或以其他方式使用本服务的任何部分，除非获得我们的明确书面许可。'
        ]
      },
      {
        title: '6. 内容权利',
        paragraphs: [
          '您保留您通过本服务提交、发布或显示的内容（"您的内容"）的所有权。通过提交、发布或显示您的内容，您授予我们全球性、免版税、非独占的许可，以使用、复制、修改、分发和展示您的内容，以便：'
        ],
        lists: [
          [
            '提供、维护和改进本服务',
            '开发和提供新服务',
            '防止滥用和违法行为',
            '履行我们的法律义务'
          ]
        ]
      },
      {
        title: '7. 终止',
        paragraphs: [
          '我们可能随时自行决定，在有或无通知的情况下，暂停或终止您的账户和访问本服务的权利，原因包括但不限于：'
        ],
        lists: [
          [
            '违反本协议',
            '从事欺诈或非法活动',
            '对其他用户或我们的服务造成安全风险',
            '长时间不活跃'
          ]
        ]
      },
      {
        title: '8. 免责声明',
        paragraphs: [
          '本服务按"原样"和"可用"的基础提供，不提供任何明示或暗示的保证。我们不对以下情况承担责任：'
        ],
        lists: [
          [
            '服务的持续可用性、及时性或安全性',
            '服务中包含或链接的任何内容、广告、产品或其他材料的准确性、可靠性或内容',
            '因使用本服务而产生的任何直接、间接、附带、特殊或后果性损害'
          ]
        ]
      },
      {
        title: '9. 赔偿',
        paragraphs: [
          '您同意赔偿并使趣吧及其官员、董事、员工、代理商和许可方免受因您使用本服务或违反本协议而产生的任何索赔、损害、义务、损失、责任、成本或债务。'
        ]
      },
      {
        title: '10. 协议变更',
        paragraphs: [
          '我们保留随时修改或替换本协议的权利。如果修订是实质性的，我们将在新条款生效前提供通知。继续使用本服务即表示您接受修订后的协议。'
        ]
      },
      {
        title: '11. 适用法律',
        paragraphs: [
          '本协议受中华人民共和国法律管辖并依其解释。与本协议相关的任何争议应提交至有管辖权的人民法院解决。'
        ]
      },
      {
        title: '12. 联系我们',
        paragraphs: ['如果您对本协议有任何疑问或疑虑，请通过以下方式与我们联系：'],
        lists: [['邮箱：legal@quba.com', '地址：中国上海市浦东新区']]
      }
    ]
  },

  // 隐私政策
  privacy: {
    title: '隐私政策',
    lastUpdated: '最后更新日期：2025年1月',
    backToLogin: '返回登录',
    intro:
      '趣吧（"我们"、"我们的"或"本服务"）尊重您的隐私，并致力于保护您的个人信息。本隐私政策解释了我们如何收集、使用、披露和保护您的信息。使用本服务即表示您同意本隐私政策的做法。',
    sections: [
      {
        title: '1. 我们收集的信息',
        subsections: [
          {
            title: '1.1 您提供的信息',
            paragraphs: ['当您使用本服务时，我们可能收集以下信息：'],
            lists: [
              [
                { strong: '账户信息：', text: '姓名、电子邮件地址、个人资料图片、出生日期' },
                { strong: '认证信息：', text: '通过第三方服务（如Google）进行身份验证时提供的信息' },
                { strong: '兴趣标签：', text: '您选择或生成的兴趣偏好和标签' },
                { strong: '内容：', text: '您发布的帖子、评论、图片、视频和其他内容' },
                { strong: '通信：', text: '您与我们之间的通信内容' }
              ]
            ]
          },
          {
            title: '1.2 自动收集的信息',
            paragraphs: ['当您访问或使用本服务时，我们自动收集：'],
            lists: [
              [
                { strong: '设备信息：', text: '设备类型、操作系统、浏览器类型、唯一设备标识符' },
                { strong: '使用信息：', text: '访问时间、浏览的页面、使用的功能、点击的链接' },
                { strong: '位置信息：', text: '基于IP地址的大致地理位置' },
                { strong: '日志信息：', text: '服务器日志、错误报告、性能数据' }
              ]
            ]
          },
          {
            title: '1.3 Cookie和类似技术',
            paragraphs: [
              '我们使用Cookie、Web Beacons和类似技术来收集和存储信息。Cookie是存储在您设备上的小型文本文件，用于记住您的偏好、改善用户体验和分析使用趋势。'
            ]
          }
        ]
      },
      {
        title: '2. 我们如何使用您的信息',
        paragraphs: ['我们使用收集的信息用于：'],
        lists: [
          [
            { strong: '提供、维护和改进服务：', text: '处理您的请求、个性化您的体验、开发新功能' },
            { strong: '身份验证和安全：', text: '验证您的身份、防止欺诈和滥用、保护账户安全' },
            { strong: '个性化推荐：', text: '根据您的兴趣推荐内容、用户和社区' },
            { strong: '通信：', text: '发送服务通知、更新、安全警报和营销信息（可选）' },
            { strong: '分析：', text: '分析使用趋势、改进服务性能、了解用户行为' },
            { strong: '法律合规：', text: '遵守法律义务、响应法律请求、保护我们的权利' }
          ]
        ]
      },
      {
        title: '3. 信息共享',
        subsections: [
          {
            title: '3.1 我们不会出售您的个人信息',
            paragraphs: ['我们不会将您的个人信息出售给第三方。']
          },
          {
            title: '3.2 我们可能共享信息的情况',
            lists: [
              [
                { strong: '服务提供商：', text: '与帮助我们运营服务的第三方服务提供商（如云存储、数据分析、支付处理）共享必要的信息' },
                { strong: '业务转让：', text: '在合并、收购或资产出售的情况下，您的信息可能被转让给相关方' },
                { strong: '法律要求：', text: '当我们真诚地认为法律要求、为了保护我们的权利或防止违法行为时披露信息' },
                { strong: '经您同意：', text: '在您明确同意的情况下，以其他方式共享信息' }
              ]
            ]
          },
          {
            title: '3.3 公开信息',
            paragraphs: [
              '您的个人资料信息（姓名、照片、兴趣标签）对其他用户可见。您可以通过账户设置控制哪些信息公开。'
            ]
          }
        ]
      },
      {
        title: '4. 数据安全',
        paragraphs: ['我们采取合理的技术和组织措施保护您的信息免受未经授权的访问、使用或披露：'],
        lists: [
          [
            { strong: '加密：', text: '在传输过程中使用SSL/TLS加密' },
            { strong: '访问控制：', text: '限制对个人信息的访问权限' },
            { strong: '安全审计：', text: '定期进行安全审查和评估' },
            { strong: '数据保留：', text: '在必要期限内保留信息，之后安全删除' }
          ]
        ],
        warning:
          '尽管我们努力保护您的信息，但没有互联网传输或电子存储方法是100%安全的。虽然我们力求使用合理的手段保护您的个人信息，但我们无法保证其绝对安全。'
      },
      {
        title: '5. 您的隐私权利',
        paragraphs: ['根据适用法律，您可能拥有以下权利：'],
        lists: [
          [
            { strong: '访问权：', text: '请求访问我们持有的您的个人信息副本' },
            { strong: '更正权：', text: '要求更正不准确或不完整的信息' },
            { strong: '删除权：', text: '要求删除您的个人信息' },
            { strong: '限制处理权：', text: '要求限制我们如何使用您的信息' },
            { strong: '数据可携带权：', text: '要求以结构化格式接收您的信息' },
            { strong: '反对权：', text: '反对我们处理您的信息' },
            { strong: '撤回同意：', text: '撤回之前给予的同意（不影响撤回前的合法性）' }
          ]
        ],
        paragraphs2: ['要行使这些权利，请通过本政策底部提供的联系方式与我们联系。我们将及时回应您的请求。']
      },
      {
        title: '6. 第三方链接',
        paragraphs: [
          '本服务可能包含指向第三方网站或服务的链接。我们对第三方网站的做法或内容不承担任何责任。我们鼓励您在离开本服务时阅读这些第三方的隐私政策。'
        ]
      },
      {
        title: '7. 儿童隐私',
        paragraphs: [
          '本服务不针对13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现已收集此类信息，我们将采取措施删除它。'
        ]
      },
      {
        title: '8. 数据跨境传输',
        paragraphs: [
          '您的信息可能被传输到您所在国家/地区以外的国家/地区并在那里处理。这些国家/地区的数据保护法律可能与您所在国家/地区的法律不同。',
          '当我们跨境传输您的信息时，我们将采取适当措施确保您的信息得到与本隐私政策一致的保护。'
        ]
      },
      {
        title: '9. 隐私政策的变更',
        paragraphs: [
          '我们可能会不时更新本隐私政策。变更后，我们将在本页面上发布新的隐私政策，并更新"最后更新日期"。我们建议您定期查看本隐私政策。',
          '重大变更将通过电子邮件或服务内的显著通知告知您。继续使用本服务即表示您接受更新后的隐私政策。'
        ]
      },
      {
        title: '10. 联系我们',
        paragraphs: ['如果您对本隐私政策或我们的信息实践有任何疑问、疑虑或请求，请通过以下方式联系我们：'],
        lists: [
          [
            { strong: '邮箱：', text: 'privacy@quba.com' },
            { strong: '地址：', text: '中国上海市浦东新区张江高科技园区' },
            { strong: '联系电话：', text: '+86 21-1234-5678' }
          ]
        ],
        paragraphs2: ['数据保护官联系方式：', '邮箱：dpo@quba.com']
      },
      {
        title: '11. 适用法律',
        paragraphs: [
          '本隐私政策受中华人民共和国法律管辖并依其解释。我们遵守适用的数据保护法律，包括《中华人民共和国个人信息保护法》（PIPL）和《中华人民共和国网络安全法》。'
        ]
      }
    ],
    summaryTitle: '隐私原则总结',
    summary: [
      '✓ 透明度：我们清楚地解释我们如何使用您的数据',
      '✓ 控制：您拥有控制个人信息的权利',
      '✓ 安全：我们实施强安全措施保护您的信息',
      '✓ 合规：我们遵守全球隐私法规',
      '✓ 最小化：我们只收集必要的信息'
    ]
  }
}
