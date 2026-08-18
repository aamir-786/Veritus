const httpMocks = require('node-mocks-http');
const dashboardController = require('../src/controllers/dashboardController');
const supabase = require('../src/config/supabase');

jest.mock('../src/config/supabase', () => ({
  from: jest.fn()
}));

describe('dashboardController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardSummary', () => {
    it('should extract unlocked_domains for a regular user with packs', async () => {
      // Setup mock data
      const mockEntitlements = [
        { product_id: 'pack_governance' },
        { product_id: 'course_123' },
        { product_id: 'pack_cyber' }
      ];

      // Chain mock for supabase
      const mockEq = jest.fn().mockResolvedValue({ data: mockEntitlements });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      
      const mockCoursesIn = jest.fn().mockResolvedValue({ data: [] });
      const mockCoursesSelect = jest.fn().mockReturnValue({ in: mockCoursesIn });
      
      const mockProgressEq = jest.fn().mockResolvedValue({ data: [] });
      const mockProgressSelect = jest.fn().mockReturnValue({ eq: mockProgressEq });
      
      const mockTemplatesOr = jest.fn().mockResolvedValue({ data: [] });
      const mockTemplatesSelect = jest.fn().mockReturnValue({ or: mockTemplatesOr });

      supabase.from.mockImplementation((table) => {
        if (table === 'entitlements') return { select: mockSelect };
        if (table === 'courses') return { select: mockCoursesSelect };
        if (table === 'progress') return { select: mockProgressSelect };
        if (table === 'templates') return { select: mockTemplatesSelect };
        return { select: jest.fn() };
      });

      const req = httpMocks.createRequest({
        user: { id: 'user_1', role: 'user' }
      });
      const res = httpMocks.createResponse();

      await dashboardController.getDashboardSummary(req, res);

      const responseData = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(responseData.success).toBe(true);
      
      // Verification that pack parsing worked correctly
      expect(responseData.unlocked_domains).toContain('pack_governance');
      expect(responseData.unlocked_domains).toContain('pack_cyber');
      expect(responseData.unlocked_domains).not.toContain('course_123');
      expect(responseData.unlocked_domains.length).toBe(2);
    });

    it('should give admins the pack_full access', async () => {
      // Mock for admin query
      const mockCoursesSelect = jest.fn().mockResolvedValue({ data: [] });
      const mockProgressEq = jest.fn().mockResolvedValue({ data: [] });
      const mockProgressSelect = jest.fn().mockReturnValue({ eq: mockProgressEq });
      const mockTemplatesSelect = jest.fn().mockResolvedValue({ data: [] });

      supabase.from.mockImplementation((table) => {
        if (table === 'courses') return { select: mockCoursesSelect };
        if (table === 'progress') return { select: mockProgressSelect };
        if (table === 'templates') return { select: mockTemplatesSelect };
        return { select: jest.fn() };
      });

      const req = httpMocks.createRequest({
        user: { id: 'admin_1', role: 'admin' }
      });
      const res = httpMocks.createResponse();

      await dashboardController.getDashboardSummary(req, res);

      const responseData = res._getJSONData();
      expect(res.statusCode).toBe(200);
      expect(responseData.unlocked_domains).toEqual(['pack_full']);
    });
  });
});
