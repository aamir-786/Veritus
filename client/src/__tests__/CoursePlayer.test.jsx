import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CoursePlayer from '../pages/CoursePlayer';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    getCourseDetails: vi.fn(),
    getLessonPlayback: vi.fn(),
  }
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test_user', role: 'user' } })
}));

// Mock window.matchMedia for any video players or carousels that might use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('CoursePlayer Mixed Blocks', () => {
  it('renders mixed blocks simultaneously', async () => {
    api.getCourseDetails.mockResolvedValue({
      success: true,
      course: { id: 1, title: 'Test Course', modules: [{ id: 1, order_index: 1, title: 'Mod 1', lessons: [{ id: 1, title: 'Les 1' }] }] }
    });

    api.getLessonPlayback.mockResolvedValue({
      success: true,
      lesson: {
        id: 1,
        title: 'Mixed Lesson',
        blocks: [
          { type: 'text', content: 'This is a text block' },
          { type: 'document', title: 'Test Document', url: 'test.pdf' }
        ]
      }
    });

    render(
      <BrowserRouter>
        <CoursePlayer />
      </BrowserRouter>
    );

    // Wait for async load
    expect(await screen.findByText('This is a text block')).toBeInTheDocument();
    expect(await screen.findByText('Test Document')).toBeInTheDocument();
  });
});
