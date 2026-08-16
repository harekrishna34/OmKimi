// apps/kimi-web/src/i18n/locales/zh/knowledge.ts
export default {
  // Dialog titles
  editTitle: '编辑知识',
  createTitle: '创建知识',

  // Form fields
  name: '名称',
  namePlaceholder: '例如：语言偏好',
  useWhen: '使用时机',
  useWhenPlaceholder: '例如：与用户交流时',
  content: '内容',
  contentPlaceholder: '输入知识内容...',

  // Actions
  save: '保存',
  cancel: '取消',
  delete: '删除',
  close: '关闭',

  // Chat stream recall
  knowledge: {
    recalled: '已回忆知识 ({count})',
    noRecalls: '未回忆知识',
  },

  // Settings panel
  settings: {
    title: '知识库',
    description: '管理可在对话中回忆的知识条目。',
    addNew: '添加知识',
    empty: '暂无知识条目。创建一个开始使用。',
    emptyHint: '知识条目帮助代理在会话间记住重要信息。',
    import: '导入',
    export: '导出',
    totalEntries: '{count} 条目',
    activeEntries: '{count} 条激活',
  },

  // Confirmation dialogs
  confirm: {
    deleteTitle: '删除知识',
    deleteMessage: '确定要删除 "{name}" 吗？此操作无法撤销。',
    discardTitle: '放弃更改',
    discardMessage: '您有未保存的更改。确定要关闭吗？',
  },

  // Validation
  validation: {
    nameRequired: '名称为必填项',
    contentRequired: '内容为必填项',
    contentMaxLength: '内容不能超过 2000 个字符',
  },
};
