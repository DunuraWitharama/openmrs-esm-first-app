import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { usePrivileges } from './privileges.resource';
import Root from './root.component';

// Replace the real data-fetching hook with a fake one we control
vi.mock('./privileges.resource', () => ({
  usePrivileges: vi.fn(),
}));

const mockUsePrivileges = vi.mocked(usePrivileges);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockMutate = vi.fn();

const testPrivileges = [
  { uuid: '1', name: 'Add Patients', description: 'Able to add patients', retired: false },
  { uuid: '2', name: 'Test Privilege', description: 'My first privilege', retired: false },
];

describe('Privilege Manager', () => {
  beforeEach(() => {
    mockUsePrivileges.mockReturnValue({
      privileges: testPrivileges,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    } as never);
  });

  it('shows the form and the list of privileges', () => {
    render(<Root />);

    expect(screen.getByRole('heading', { name: /privilege manager/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /privilege name/i })).toBeInTheDocument();
    expect(screen.getByText('Add Patients')).toBeInTheDocument();
    expect(screen.getByText('Test Privilege')).toBeInTheDocument();
  });

  it('filters the list when you search', async () => {
    const user = userEvent.setup();
    render(<Root />);

    await user.type(screen.getByRole('searchbox'), 'Test');

    expect(screen.getByText('Test Privilege')).toBeInTheDocument();
    expect(screen.queryByText('Add Patients')).not.toBeInTheDocument();
  });

  it('creates a privilege and reloads the list', async () => {
    const user = userEvent.setup();
    mockOpenmrsFetch.mockResolvedValue({ data: {} } as never);
    render(<Root />);

    await user.type(screen.getByRole('textbox', { name: /privilege name/i }), 'New Privilege');
    await user.type(screen.getByRole('textbox', { name: /description/i }), 'Created in a test');
    await user.click(screen.getByRole('button', { name: /create privilege/i }));

    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/privilege'),
      expect.objectContaining({
        method: 'POST',
        body: { name: 'New Privilege', description: 'Created in a test' },
      }),
    );
    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
    expect(mockMutate).toHaveBeenCalled();
  });
});
