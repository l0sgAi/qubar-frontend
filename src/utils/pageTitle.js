import i18n from '@/locales'

// 动态标题状态：详情页数据加载成功后由页面设置（绑定 route.name + fullPath 的页面实例）。
// 语言切换时 applyPageTitle 按当前语言模板重建；离开页面（fullPath 变化）后失效回退通用标题
let dynamicTitle = null

export const setDynamicTitleData = (routeName, fullPath, key, params) => {
  dynamicTitle = { routeName, fullPath, key, params }
}

// 同步浏览器标签页标题（document.title），格式「页面名 - 品牌」
// 路由 meta.titleKey 指定页面名；未配置的路由展示品牌标语
export const applyPageTitle = (route) => {
  const t = i18n.global.t
  const brand = t('title.brand')

  if (!route?.meta?.titleKey) {
    dynamicTitle = null
    document.title = `${brand} - ${t('title.slogan')}`
    return
  }

  // 详情页数据加载成功后展示具体内容（帖子标题/圈子名/用户名）
  if (dynamicTitle && dynamicTitle.routeName === route.name && dynamicTitle.fullPath === route.fullPath) {
    document.title = `${t(dynamicTitle.key, dynamicTitle.params)} - ${brand}`
    return
  }
  dynamicTitle = null

  // 搜索页带上关键词：搜索「xxx」
  const pageTitle = route.name === 'search' && route.query?.q
    ? t('title.searchKeyword', { keyword: route.query.q })
    : t(route.meta.titleKey)

  document.title = `${pageTitle} - ${brand}`
}
