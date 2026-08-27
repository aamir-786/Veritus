const httpMocks = require('node-mocks-http');
const commerceController = require('../src/controllers/commerceController');

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/test_url' })
      }
    }
  }));
});

// Mock Supabase
const mockInsert = jest.fn().mockResolvedValue({ data: { id: 'test_order_id' } });
const mockSelect = jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'course_id', type: 'Course' } }) });

jest.mock('../src/config/supabase', () => ({
  from: jest.fn(() => ({
    insert: mockInsert,
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 'course_id', type: 'Course' } }),
      ilike: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { promo_code: 'SUMMER20', discount_percentage: 20, is_active: true } }) })
    }),
    or: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'course_id', type: 'Course' } }) }),
    eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'template_id', type: 'Template' } }) }),
    ilike: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { promo_code: 'SUMMER20', discount_percentage: 20, is_active: true } }) })
  }))
}));

describe('commerceController', () => {
  describe('createCheckoutSession', () => {
    it('should create a checkout session for a domain pack', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/create-checkout-session',
        body: {
          item_id: 'pack_risk',
          item_type: 'pack'
        },
        user: { id: 'test_user_id', email: 'test@example.com' }
      });
      const res = httpMocks.createResponse();

      await commerceController.createCheckoutSession(req, res);

      const responseData = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.checkout_url).toBe('https://checkout.stripe.com/test_url');
    });

    it('should fail for an invalid pack ID', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/create-checkout-session',
        body: {
          item_id: 'pack_invalid',
          item_type: 'pack'
        },
        user: { id: 'test_user_id', email: 'test@example.com' }
      });
      const res = httpMocks.createResponse();

      await commerceController.createCheckoutSession(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData().error).toBe('Selected product not found');
    });

    it('should apply valid coupon and calculate remaining amount', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/create-checkout-session',
        body: {
          item_id: 'pack_risk',
          item_type: 'pack',
          coupon_code: 'SUMMER20'
        },
        user: { id: 'test_user_id', email: 'test@example.com' }
      });
      const res = httpMocks.createResponse();

      await commerceController.createCheckoutSession(req, res);

      const responseData = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.original_amount).toBeDefined();
    });
  });

  describe('requestRefund', () => {
    it('should reject refund request if order is older than 3 days', async () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
      const mockOrder = {
        id: 'ord-123',
        user_id: 'user-1',
        user_email: 'user@example.com',
        status: 'paid',
        paid_at: fourDaysAgo
      };

      const mockSupabase = require('../src/config/supabase');
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            single: jest.fn().mockResolvedValue({ data: mockOrder })
          })
        })
      });

      const req = httpMocks.createRequest({
        method: 'POST',
        params: { id: 'ord-123' },
        body: { reason: 'Changed my mind' },
        user: { id: 'user-1', email: 'user@example.com' }
      });
      const res = httpMocks.createResponse();

      await commerceController.requestRefund(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().error).toContain('Refund window has expired');
    });
  });
});
