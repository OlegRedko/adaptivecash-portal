import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentDetails } from './DocumentDetails/DocumentDetails';
import { createTestApi } from './testing/createTestApi';
import { documentFixture, renderDocuments } from './testing/renderDocuments';

// The drawer and the confirmation modal both expose role="dialog",
// so the confirmation has to be selected by its accessible name.
const openConfirmDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Sign document' }));
  return screen.findByRole('dialog', { name: /Sign document\?/ });
};

describe('signing flow', () => {
  it('sends one command when the confirm button is double clicked', async () => {
    const user = userEvent.setup();
    const document = documentFixture();
    const api = createTestApi([document]);

    renderDocuments(<DocumentDetails document={document} open onClose={() => {}} />, { api });

    const dialog = await openConfirmDialog(user);
    const confirm = within(dialog).getByRole('button', { name: 'Sign' });

    // Two clicks dispatched back to back, before React can re-render with isPending.
    await Promise.all([user.click(confirm), user.click(confirm)]);

    await waitFor(() => expect(api.createCalls.length).toBeGreaterThan(0));
    expect(api.createCalls).toHaveLength(1);
  });

  it('reuses the same idempotency key when retrying after a 503', async () => {
    const user = userEvent.setup();
    const document = documentFixture();
    const api = createTestApi([document]);
    api.failNextCreateWith(503);

    renderDocuments(<DocumentDetails document={document} open onClose={() => {}} />, { api });

    const dialog = await openConfirmDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Sign' }));

    const retry = await screen.findByRole('button', { name: 'Retry' });
    await user.click(retry);

    await waitFor(() => expect(api.createCalls).toHaveLength(2));
    expect(api.createCalls[1].idempotencyKey).toBe(api.createCalls[0].idempotencyKey);
  });

  it('attaches to the existing session on 409 instead of repeating the command', async () => {
    const user = userEvent.setup();
    const document = documentFixture();
    const api = createTestApi([document]);
    api.failNextCreateWith(409, { code: 'ACTIVE_SESSION', existingSessionId: 'SIGN-EXISTING' });

    renderDocuments(<DocumentDetails document={document} open onClose={() => {}} />, { api });

    const dialog = await openConfirmDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Sign' }));

    expect(await screen.findByText(/SIGN-EXISTING/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(api.createCalls).toHaveLength(1);
  });

  it('stops polling the session after unmount', async () => {
    const user = userEvent.setup();
    const document = documentFixture();
    const api = createTestApi([document]);
    api.setSessionStatus('AwaitingProvider');

    const { unmount } = renderDocuments(
      <DocumentDetails document={document} open onClose={() => {}} />,
      { api },
    );

    const dialog = await openConfirmDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Sign' }));

    await waitFor(() => expect(api.sessionPolls).toBeGreaterThan(0));

    unmount();
    const pollsAtUnmount = api.sessionPolls;

    await new Promise((resolve) => setTimeout(resolve, 2500));

    expect(api.sessionPolls).toBe(pollsAtUnmount);
  });

  it('does not show Verified until the server reports it', async () => {
    const user = userEvent.setup();
    const document = documentFixture();
    const api = createTestApi([document]);
    api.setSessionStatus('AwaitingProvider');

    renderDocuments(<DocumentDetails document={document} open onClose={() => {}} />, { api });

    const dialog = await openConfirmDialog(user);
    await user.click(within(dialog).getByRole('button', { name: 'Sign' }));

    await screen.findByText('AwaitingProvider');
    expect(screen.queryByText('Verified')).not.toBeInTheDocument();

    api.setSessionStatus('Verified');

    expect(await screen.findByText('Verified', {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
