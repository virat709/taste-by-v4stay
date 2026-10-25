import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import SlideToConfirm from '../SlideToConfirm';

// Note: jsdom has no real layout, so clientWidth is 0 — the component's own
// getMax() clamps travel to 0 and only the keyboard path can fire onConfirm.
// We therefore test: keyboard confirm, disabled state, and spring-back logic.
describe('SlideToConfirm', () => {
  it('fires onConfirm via keyboard (Enter)', async () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm onConfirm={onConfirm} label="Slide to Pick Up" />);
    const thumb = screen.getByTestId('slide-thumb');
    fireEvent.keyDown(thumb, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('slide-to-confirm').getAttribute('aria-label')).toBe('Slide to Pick Up');
  });

  it('fires onConfirm via Space too', () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm onConfirm={onConfirm} label="Go offline" height={48} />);
    fireEvent.keyDown(screen.getByTestId('slide-thumb'), { key: ' ' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm onConfirm={onConfirm} label="Locked" disabled />);
    fireEvent.keyDown(screen.getByTestId('slide-thumb'), { key: 'Enter' });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('does not fire again while in the confirming flash', () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm onConfirm={onConfirm} label="Slide" />);
    const thumb = screen.getByTestId('slide-thumb');
    fireEvent.keyDown(thumb, { key: 'Enter' });
    fireEvent.keyDown(thumb, { key: 'Enter' }); // spam — must be ignored
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('recovers and can fire again after the confirm flash resets', async () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<SlideToConfirm onConfirm={onConfirm} label="Slide" />);
    const thumb = screen.getByTestId('slide-thumb');
    fireEvent.keyDown(thumb, { key: 'Enter' });
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.runAllTimersAsync();        // flash window (900ms) elapses, flash resets
    });
    fireEvent.keyDown(thumb, { key: 'Enter' });
    await act(async () => {});
    expect(onConfirm).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('shows the label on the track', () => {
    render(<SlideToConfirm onConfirm={vi.fn()} label="Slide to Clock In" />);
    expect(screen.getByText('Slide to Clock In')).toBeInTheDocument();
  });
});
