import { vi, describe, it, expect, beforeEach } from 'vitest';
import {
  InitiateTapPayService,
  InitiateTapPayServiceArgs,
} from '../../../src/services/InitiateTapPayService';
import { Order } from '../../../src/types/payment';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('InitiateTapPayService', () => {
  const stubPartnerKey = 'mock_partner_key';
  const stubTapPayEndpoint = 'https://mock.tappay.endpoint/payment';
  const stubFrontendRedirectUrl = 'https://mock.frontend.com/redirect';
  const stubBackendNotifyUrl = 'https://mock.backend.com/notify';

  const sturServiceArgs: InitiateTapPayServiceArgs = {
    partnerKey: stubPartnerKey,
    tapPayEndpoint: stubTapPayEndpoint,
    frontendRedirectUrl: stubFrontendRedirectUrl,
    backendNotifyUrl: stubBackendNotifyUrl,
  };

  const stubMerchantId = 'mock_merchant_id';
  const stubOrder: Order = {
    id: 'mock_order_123',
    total: 1_000,
    member: {
      id: 'member_456',
      name: 'John Doe',
      email: 'john.doe@example.com',
      tel: '0912345678',
    },
    tickets: [], // Not directly used in toTapPayPayByPrimeParams for now, but part of Order type
    summary: {
      totalAmount: 1_000,
      totalQuantity: 1,
    },
    groupPassFormData: {},
  } as unknown as Order;

  const stubPrime = 'mock_prime';

  let service: InitiateTapPayService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InitiateTapPayService(sturServiceArgs);
  });

  it('returns true on successful payment (status 0)', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ msg: 'Success', status: 0 }),
    });

    const result = await service.execute({
      merchantId: stubMerchantId,
      order: stubOrder,
      prime: stubPrime,
    });

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns false on failed payment status (non-0)', async () => {
    const tapPayErrorStatus = 1;
    const tapPayErrorMessage = 'Payment Failed';
    mockFetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({ msg: tapPayErrorMessage, status: tapPayErrorStatus }),
    });

    const result = await service.execute({
      merchantId: stubMerchantId,
      order: stubOrder,
      prime: stubPrime,
    });

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns false on network error or fetch rejection', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await service.execute({
      merchantId: stubMerchantId,
      order: stubOrder,
      prime: stubPrime,
    });

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns false if response.json() parsing fails', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.reject(new Error('Invalid JSON response')),
    });

    const result = await service.execute({
      merchantId: stubMerchantId,
      order: stubOrder,
      prime: stubPrime,
    });

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('calls fetch with correct arguments (headers and body)', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ msg: 'Success', status: 0 }),
    });

    await service.execute({
      merchantId: stubMerchantId,
      order: stubOrder,
      prime: stubPrime,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      stubTapPayEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': stubPartnerKey,
        },
        body: JSON.stringify({
          prime: stubPrime,
          partner_key: stubPartnerKey,
          merchant_id: stubMerchantId,
          amount: stubOrder.total,
          currency: 'TWD',
          order_number: stubOrder.id,
          details: `Order ID ${stubOrder.id}`,
          cardholder: {
            phone_number: stubOrder.member.tel,
            name: stubOrder.member.name,
            email: stubOrder.member.email,
          },
          three_domain_secure: true,
          result_url: {
            frontend_redirect_url: stubFrontendRedirectUrl,
            backend_notify_url: stubBackendNotifyUrl,
          },
        }),
      })
    );
  });
});
