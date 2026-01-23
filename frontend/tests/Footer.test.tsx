import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer', () => {
  it('renders the footer with correct content', () => {
    render(<Footer />);
    expect(screen.getByText('CircleCare')).toBeInTheDocument();
    expect(screen.getByText('Care-centered expense sharing on Stacks')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });
});
