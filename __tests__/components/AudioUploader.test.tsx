import { render, screen } from '../../test-utils/index';
import { AudioUploader } from '@/components/AudioUploader';

// Mock the react-dropzone to simplify testing
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
    open: jest.fn(),
  })),
}));

describe('AudioUploader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload area', () => {
    render(<AudioUploader />);
    
    expect(screen.getByText(/drag.*drop an audio file/i)).toBeInTheDocument();
    expect(screen.getByText(/supported.*mp3.*wav/i)).toBeInTheDocument();
  });

  it('renders the dropzone', () => {
    render(<AudioUploader />);
    
    expect(screen.getByTestId('dropzone')).toBeInTheDocument();
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('shows transcribe button (even when disabled)', () => {
    render(<AudioUploader />);
    
    const transcribeButton = screen.getByRole('button', { name: /transcribe/i });
    expect(transcribeButton).toBeInTheDocument();
  });

  it('shows warning message when no file is selected', () => {
    render(<AudioUploader />);
    
    expect(screen.getByText(/please upload an audio file/i)).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    expect(() => render(<AudioUploader />)).not.toThrow();
  });

  it('has correct styling classes', () => {
    render(<AudioUploader />);
    
    const container = screen.getByTestId('dropzone').parentElement;
    expect(container).toHaveClass('bg-gray-800');
  });
});