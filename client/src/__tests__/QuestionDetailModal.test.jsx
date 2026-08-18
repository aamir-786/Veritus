import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuestionDetailModal from '../components/QuestionDetailModal';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test_user', role: 'user' } })
}));

// Mock CartContext
vi.mock('../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn() })
}));

// Mock ReactMarkdown
vi.mock('react-markdown', () => ({
  default: ({ children }) => <>{children}</>
}));

const mockQuestion = {
  id: 1,
  domain: 'Governance',
  title: 'What is Governance?',
  guidance: 'This is the first sentence. This is the locked body that should be blurred out.'
};

describe('QuestionDetailModal', () => {
  it('renders locked state when user does not have domain pack', () => {
    render(
      <BrowserRouter>
        <QuestionDetailModal 
          question={mockQuestion} 
          unlockedDomains={[]} 
          onClose={() => {}} 
          onAskCopilot={() => {}} 
        />
      </BrowserRouter>
    );

    // Should show lock CTA
    expect(screen.getByText(/Unlock Governance Master Pack/i)).toBeInTheDocument();
    // Should show Add to Cart button
    expect(screen.getByText(/Add Governance Pack to Cart/i)).toBeInTheDocument();
  });

  it('renders unlocked state when user has domain pack', () => {
    render(
      <BrowserRouter>
        <QuestionDetailModal 
          question={mockQuestion} 
          unlockedDomains={['pack_governance']} 
          onClose={() => {}} 
          onAskCopilot={() => {}} 
        />
      </BrowserRouter>
    );

    // Should NOT show lock CTA
    expect(screen.queryByText(/Unlock Governance Master Pack/i)).not.toBeInTheDocument();
  });
});
