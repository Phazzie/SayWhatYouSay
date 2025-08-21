import { render, screen } from '../../test-utils/index';
import { Header } from '@/components/Header';

describe('Header Component', () => {
  it('renders the application title', () => {
    render(<Header />);
    
    expect(screen.getByText('SayWhat')).toBeInTheDocument();
    expect(screen.getByText('You Say')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Header />);
    
    expect(screen.getByText('AI-Powered Transcription Comparison & Analysis')).toBeInTheDocument();
  });

  it('has the correct styling classes', () => {
    render(<Header />);
    
    const headerElement = screen.getByRole('banner');
    expect(headerElement).toHaveClass('bg-gray-800/50', 'backdrop-blur-sm');
  });

  it('renders without crashing', () => {
    expect(() => render(<Header />)).not.toThrow();
  });
});