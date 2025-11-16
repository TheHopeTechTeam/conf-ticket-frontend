export const MODE = {
  EDIT: 'edit',
  VIEW: 'view',
} as const;

export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  FORM: 'form',
} as const;

export const MAIL = {
  CONTACT_EMAIL: 'conference@thehope.co',
  NOREPLAY_EMAIL: 'noreply@thehope.co',
} as const;

/** The Hope Tech Team recruit message */
export const RECRUIT_MESSAGES = [
  '你也想要運用科技的恩賜一起建造教會嗎？',
  '那就快點透過 email 加入我們吧！',
  'dev@thehope.co',
  '標題請填寫「我想加入Tech Team - （你的稱呼）-（想要申請的服事職位）」',
];
