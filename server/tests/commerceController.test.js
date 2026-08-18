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
    select: mockSelect,
    or: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'course_id', type: 'Course' } }) }),
    eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'template_id', type: 'Template' } }) })
  }))
}));

describe('commerceController', () => {
  describe('createCheckoutSession', () => {
    it('should create a checkout session for a domain pack', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        url: '/create-checkout-session',
        body: {
          item_id: 'pack_governance',
          item_type: 'pack'
        },
        user: { id: 'test_user_id', email: 'test@example.com' }
      });
      const res = httpMocks.createResponse();

      await commerceController.createCheckoutSession(req, res);

      const responseData = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.checkout_url).toMatch(/^\/checkout\/pay\/ord-\d+$/);
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
  });
});
