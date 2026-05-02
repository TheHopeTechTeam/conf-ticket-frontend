// 會員假資料

export const mockMemberResponse = {
  docs: [
    {
      id: 'mock-member-001',
      email: 'test@example.com',
      name: '測試用戶',
      gender: 'male',
      tel: '+886912345678',
      role: 'minister',
      location: 'The Hope 台北',
      consentedAt: '2024-01-01T00:00:00.000Z',
      dietaryRequirement: '葷食',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      meta: {
        vip: false, // VIP 權限，設為 true 可測試優惠票券流程
        isTester: true, // 測試權限
      },
    },
  ],
  totalDocs: 1,
  limit: 1,
  totalPages: 1,
  page: 1,
  pagingCounter: 1,
  hasPrevPage: false,
  hasNextPage: false,
  prevPage: null,
  nextPage: null,
};

// 非 VIP 會員（用於測試權限檢查）
export const mockNonVipMemberResponse = {
  ...mockMemberResponse,
  docs: [
    {
      ...mockMemberResponse.docs[0],
      id: 'mock-member-002',
      email: 'nonvip@example.com',
      name: '一般用戶',
      meta: {
        vip: false,
      },
    },
  ],
};
