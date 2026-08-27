const httpMocks = require('node-mocks-http');

let mockOrderData = null;

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/mock_session_url' })
      }
    },
    refunds: {
      create: jest.fn().mockResolvedValue({ id: 're_test_123', status: 'succeeded' })
    }
  }));
});

jest.mock('../src/config/supabase', () => ({
  from: jest.fn(() => ({
    insert: jest.fn().mockImplementation(() => ({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: 'ord-mock-123' } })
      })
    })),
    select: jest.fn().mockReturnValue({
      single: jest.fn().mockImplementation(async () => ({ data: mockOrderData || { id: 'course_id', type: 'Course' } })),
      ilike: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { promo_code: 'SUMMER20', discount_percentage: 20, is_active: true } })
      }),
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockImplementation(async () => ({ data: mockOrderData || { id: 'ord-mock-123', status: 'paid' } }))
      })
    }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(async () => ({ data: { ...(mockOrderData || {}), status: 'refund_requested', refund_reason: 'Test reason' } }))
        })
      })
    }),
    or: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { id: 'course_id', type: 'Course' } })
    }),
    eq: jest.fn().mockReturnValue({
      single: jest.fn().mockImplementation(async () => ({ data: mockOrderData || { id: 'template_id', type: 'Template' } }))
    }),
    ilike: jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValue({ data: { promo_code: 'SUMMER20', discount_percentage: 20, is_active: true } })
    }),
    delete: jest.fn().mockReturnValue({
      match: jest.fn().mockResolvedValue({ error: null })
    })
  }))
}));

const promotionsController = require('../src/controllers/promotionsController');
const commerceController = require('../src/controllers/commerceController');
const adminController = require('../src/controllers/adminController');

describe('Veritus Feature Integration Test Suite', () => {
  
  test('1. Validate Coupon Code API', async () => {
    const req1 = httpMocks.createRequest({
      method: 'POST',
      body: { promo_code: 'SUMMER20' }
    });
    const res1 = httpMocks.createResponse();
    await promotionsController.validateCoupon(req1, res1);
    
    const resData = res1._getJSONData();
    console.log('[Test 1.1 - Valid Coupon Response]:', resData);
    expect(res1.statusCode).toBe(200);
    expect(resData.success).toBe(true);
    expect(resData.promotion.promo_code).toBe('SUMMER20');
    expect(resData.promotion.discount_percentage).toBe(20);
  });

  test('2. Multi-Item Checkout Session with Coupon Applied', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        items: [
          { id: 'pack_risk', type: 'pack', price: 49 },
          { id: 'pack_compliance', type: 'pack', price: 49 }
        ],
        coupon_code: 'SUMMER20',
        customer_email: 'testbuyer@veritus.com'
      },
      user: { id: '00000000-0000-0000-0000-000000000101', email: 'testbuyer@veritus.com' }
    });
    const res = httpMocks.createResponse();

    await commerceController.createMultiCheckoutSession(req, res);

    const data = res._getJSONData();
    console.log('[Test 2 - Checkout Session Response]:', data);
    expect(res.statusCode).toBe(200);
    expect(data.success).toBe(true);
    expect(data.checkout_url).toBe('https://checkout.stripe.com/mock_session_url');
  });

  test('3. User Refund Request - Enforce 3-Day Window', async () => {
    // 3.1 Recent Order (1 day old <= 72h) -> Should succeed
    const recentOrderDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    mockOrderData = {
      id: 'ord-recent-1',
      user_id: '00000000-0000-0000-0000-000000000101',
      user_email: 'testbuyer@veritus.com',
      product_id: 'pack_risk',
      product_title: 'Risk Domain Pack',
      amount: 39.2,
      original_amount: 49,
      discount_amount: 9.8,
      coupon_code: 'SUMMER20',
      status: 'paid',
      paid_at: recentOrderDate
    };

    const reqRecent = httpMocks.createRequest({
      method: 'POST',
      params: { id: 'ord-recent-1' },
      body: { reason: 'Decided to focus on a different module this quarter.' },
      user: { id: '00000000-0000-0000-0000-000000000101', email: 'testbuyer@veritus.com' }
    });
    const resRecent = httpMocks.createResponse();

    await commerceController.requestRefund(reqRecent, resRecent);
    const recentData = resRecent._getJSONData();
    console.log('[Test 3.1 - Recent Order Refund Request Response]:', recentData);
    expect(resRecent.statusCode).toBe(200);
    expect(recentData.success).toBe(true);

    // 3.2 Old Order (5 days old > 72h) -> Should fail with 3-day window expired message
    const oldOrderDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
    mockOrderData = {
      id: 'ord-old-99',
      user_id: '00000000-0000-0000-0000-000000000101',
      user_email: 'testbuyer@veritus.com',
      status: 'paid',
      paid_at: oldOrderDate
    };

    const reqOld = httpMocks.createRequest({
      method: 'POST',
      params: { id: 'ord-old-99' },
      body: { reason: 'Expired refund attempt' },
      user: { id: '00000000-0000-0000-0000-000000000101', email: 'testbuyer@veritus.com' }
    });
    const resOld = httpMocks.createResponse();

    await commerceController.requestRefund(reqOld, resOld);
    const oldData = resOld._getJSONData();
    console.log('[Test 3.2 - Expired Order Refund Request Response]:', oldData);
    expect(resOld.statusCode).toBe(400);
    expect(oldData.success).toBe(false);
    expect(oldData.error).toContain('Refund window has expired');
  });

  test('4. Admin Process Refund Request (Approve / Reject with Reply Note)', async () => {
    mockOrderData = {
      id: 'ord-pending-55',
      user_id: '00000000-0000-0000-0000-000000000101',
      user_email: 'testbuyer@veritus.com',
      product_id: 'pack_risk',
      status: 'refund_requested',
      refund_reason: 'Not relevant to my current role',
      stripe_payment_intent: 'pi_test_123'
    };

    // Test Admin Reject Request
    const reqReject = httpMocks.createRequest({
      method: 'POST',
      params: { id: 'ord-pending-55' },
      body: { action: 'reject', admin_reply: 'Sorry, course content was accessed 100%.' }
    });
    const resReject = httpMocks.createResponse();

    await adminController.processRefundRequest(reqReject, resReject);
    const rejectData = resReject._getJSONData();
    console.log('[Test 4.1 - Admin Reject Refund Response]:', rejectData);
    expect(resReject.statusCode).toBe(200);
    expect(rejectData.success).toBe(true);

    // Test Admin Approve Request
    const reqApprove = httpMocks.createRequest({
      method: 'POST',
      params: { id: 'ord-pending-55' },
      body: { action: 'approve', admin_reply: 'Approved. Your refund of 75% has been processed via Stripe.' }
    });
    const resApprove = httpMocks.createResponse();

    await adminController.processRefundRequest(reqApprove, resApprove);
    const approveData = resApprove._getJSONData();
    console.log('[Test 4.2 - Admin Approve Refund Response]:', approveData);
    expect(resApprove.statusCode).toBe(200);
    expect(approveData.success).toBe(true);
  });

  test('5. Perpetual Admin Manual Refund for any order (>3 days)', async () => {
    mockOrderData = {
      id: 'ord-special-override',
      user_id: '00000000-0000-0000-0000-000000000101',
      user_email: 'testbuyer@veritus.com',
      product_id: 'pack_cyber',
      status: 'paid',
      stripe_payment_intent: 'pi_test_999'
    };

    const reqManual = httpMocks.createRequest({
      method: 'POST',
      params: { id: 'ord-special-override' },
      body: { admin_reply: 'Special executive exception granted after policy period.' }
    });
    const resManual = httpMocks.createResponse();

    await adminController.refundOrder(reqManual, resManual);
    const manualData = resManual._getJSONData();
    console.log('[Test 5 - Perpetual Admin Manual Refund Response]:', manualData);
    expect(resManual.statusCode).toBe(200);
    expect(manualData.success).toBe(true);
  });
});
