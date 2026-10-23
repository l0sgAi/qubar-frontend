import { describe, it, expect } from 'vitest'
import { createI18n } from 'vue-i18n'
import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'
import {
  NOTICE_TEMPLATE_KEYS,
  isSystemNotice,
  renderNoticeText,
  noticeTarget
} from '@/utils/noticeDisplay'

// 用真实文案编译，顺带校验模板 key 与占位符对得上
const createT = (locale) => createI18n({
  legacy: false,
  locale,
  messages: { 'zh-CN': zhCN, 'en-US': enUS }
}).global.t

const zh = createT('zh-CN')
const en = createT('en-US')

describe('noticeDisplay', () => {
  describe('renderNoticeText', () => {
    it('1–6：带 actor 时渲染触发人与摘要', () => {
      const actor = { username: 'Alice' }
      expect(renderNoticeText({ notice_type: 1, actor, snippet: '标题' }, zh)).toBe('Alice 赞了你的帖子《标题》')
      expect(renderNoticeText({ notice_type: 2, actor, snippet: '评论' }, zh)).toBe('Alice 赞了你的评论「评论」')
      expect(renderNoticeText({ notice_type: 3, actor, snippet: '标题' }, zh)).toBe('Alice 收藏了你的帖子《标题》')
      expect(renderNoticeText({ notice_type: 4, actor, snippet: '内容' }, zh)).toBe('Alice 评论了你的帖子：内容')
      expect(renderNoticeText({ notice_type: 5, actor, snippet: '内容' }, zh)).toBe('Alice 回复了你的评论：内容')
      expect(renderNoticeText({ notice_type: 6, actor, snippet: '内容' }, zh)).toBe('Alice 在帖子/评论中提到了你：内容')
    })

    it('actor 缺省时兜底为「有人」/ Someone', () => {
      expect(renderNoticeText({ notice_type: 1, snippet: '标题' }, zh)).toBe('有人 赞了你的帖子《标题》')
      expect(renderNoticeText({ notice_type: 1, actor: {}, snippet: 'T' }, en)).toBe('Someone liked your post "T"')
    })

    it('7：帖子审核通过（无 actor）', () => {
      expect(renderNoticeText({ notice_type: 7, snippet: '我的帖子' }, zh)).toBe('你的帖子《我的帖子》已通过审核')
      expect(renderNoticeText({ notice_type: 7, snippet: 'My post' }, en)).toBe('Your post "My post" has been approved')
    })

    it('8：帖子审核驳回（无 actor）', () => {
      expect(renderNoticeText({ notice_type: 8, snippet: '我的帖子' }, zh)).toBe('你的帖子《我的帖子》未通过审核')
      expect(renderNoticeText({ notice_type: 8, snippet: 'My post' }, en)).toBe('Your post "My post" didn\'t pass review')
    })

    it('snippet 缺省时渲染为空串而不是 undefined', () => {
      expect(renderNoticeText({ notice_type: 7 }, zh)).toBe('你的帖子《》已通过审核')
    })

    it('未知类型兜底显示 snippet，snippet 缺省时为空串', () => {
      expect(renderNoticeText({ notice_type: 99, snippet: '原文' }, zh)).toBe('原文')
      expect(renderNoticeText({ notice_type: 99 }, zh)).toBe('')
    })

    it('第二期类型 9–11 暂不映射模板，按未知类型兜底', () => {
      for (const type of [9, 10, 11]) {
        expect(NOTICE_TEMPLATE_KEYS[type]).toBeUndefined()
        expect(renderNoticeText({ notice_type: type, snippet: '标题' }, zh)).toBe('标题')
      }
    })
  })

  describe('isSystemNotice', () => {
    it('7/8 为系统通知，其余类型（含 actor 缺省的 1–6）不是', () => {
      expect(isSystemNotice({ notice_type: 7 })).toBe(true)
      expect(isSystemNotice({ notice_type: 8 })).toBe(true)
      expect(isSystemNotice({ notice_type: 1 })).toBe(false)
      expect(isSystemNotice({ notice_type: 6 })).toBe(false)
      expect(isSystemNotice({ notice_type: 99 })).toBe(false)
    })
  })

  describe('noticeTarget', () => {
    it('7/8 跳帖子详情，不带 comment_id', () => {
      expect(noticeTarget({ notice_type: 7, post_id: 'p1' })).toEqual({ path: '/post/p1', query: {} })
      expect(noticeTarget({ notice_type: 8, post_id: 'p2' })).toEqual({ path: '/post/p2', query: {} })
    })

    it('带 comment_id 时附带定位参数', () => {
      expect(noticeTarget({ notice_type: 5, post_id: 'p1', comment_id: 'c1' }))
        .toEqual({ path: '/post/p1', query: { comment_id: 'c1' } })
    })

    it('无 post_id 时返回 null，降级为普通块', () => {
      expect(noticeTarget({ notice_type: 7 })).toBeNull()
    })
  })
})
