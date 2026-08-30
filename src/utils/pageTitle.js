import i18n from '@/locales'

// 同步浏览器标签页标题（document.title），格式「页面名 - 品牌」
// 路由 meta.titleKey 指定页面名；登录页/未配置的路由展示品牌标语
export const applyPageTitle = (route) => {
  const t = i18n.global.t
  const brand = t('title.brand')

  if (!route?.meta?.titleKey) {
    document.title = `${brand} - ${t('title.slogan')}`
    return
  }

  // 搜索页带上关键词：搜索「xxx」
  const pageTitle = route.name === 'search' && route.query?.q
    ? t('title.searchKeyword', { keyword: route.query.q })
    : t(route.meta.titleKey)

  document.title = `${pageTitle} - ${brand}`
}
