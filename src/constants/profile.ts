export enum ValidChurchType {
  TAIPEI = 'taipei',
  TAICHUNG = 'taichung',
  ONLINE = 'online',
  OTHER = 'other',
}

export const GENDER_OPTIONS = [
  { id: 'male', label: '男' },
  { id: 'female', label: '女' },
];

export const CHURCH_OPTIONS = [
  { id: 'taipei', label: 'The Hope 台北分部' },
  { id: 'taichung', label: 'The Hope 台中分部' },
  { id: 'online', label: 'The Hope 線上分部' },
  { id: 'other', label: '其他' },
];

export const CHURCH_IDENTITY_OPTIONS = [
  { id: 'senior-pastor', label: '主任牧師' },
  { id: 'pastor', label: '牧師' },
  { id: 'minister', label: '傳道' },
  { id: 'seminary-student', label: '神學生' },
  { id: 'staff', label: '全職同工' },
  { id: 'member', label: '一般參加者' },
];
