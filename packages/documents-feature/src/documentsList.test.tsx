import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentsPage } from './DocumentsPage';
import { createTestApi } from './testing/createTestApi';
import { documentFixture, renderDocuments } from './testing/renderDocuments';

const documents = [
  documentFixture({ id: 'BR-DOC-001', title: 'Slow cash collection order' }),
  documentFixture({ id: 'BR-DOC-002', title: 'Quick balance statement' }),
];

describe('documents list', () => {
  it('does not let a slow earlier response overwrite the current filter', async () => {
    const user = userEvent.setup();
    const api = createTestApi(documents);

    // The first search resolves long after the second one.
    api.setListLatency('slow', 400);
    api.setListLatency('quick', 0);

    renderDocuments(<DocumentsPage />, { api });
    await screen.findByText('Slow cash collection order');

    const search = screen.getByPlaceholderText('Search documents');
    await user.type(search, 'slow');
    await user.clear(search);
    await user.type(search, 'quick');

    await screen.findByText('Quick balance statement');

    // Wait past the slow response so a late arrival would have had time to land.
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(screen.getByText('Quick balance statement')).toBeInTheDocument();
    expect(screen.queryByText('Slow cash collection order')).not.toBeInTheDocument();
  });

  it('restores filters from the URL on load', async () => {
    const api = createTestApi(documents);

    renderDocuments(<DocumentsPage />, { api, url: '/documents?search=quick&status=ReadyForSignature' });

    await waitFor(() => expect(api.listCalls.length).toBeGreaterThan(0));

    expect(api.listCalls[0]).toMatchObject({
      tenantId: 'branch-demo',
      search: 'quick',
      status: 'ReadyForSignature',
    });
    expect(screen.getByPlaceholderText('Search documents')).toHaveValue('quick');
  });

  it('shows a retry action when the list fails and recovers after it is used', async () => {
    const user = userEvent.setup();
    const api = createTestApi(documents);
    api.failNextList();

    renderDocuments(<DocumentsPage />, { api });

    const retry = await screen.findByRole('button', { name: 'Retry' });
    await user.click(retry);

    expect(await screen.findByText('Slow cash collection order')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('scopes the query to the tenant of the portal it is composed into', async () => {
    const api = createTestApi(documents);

    renderDocuments(<DocumentsPage />, { api, tenantId: 'customer-demo' });

    await waitFor(() => expect(api.listCalls.length).toBeGreaterThan(0));
    expect(api.listCalls.every((call) => call.tenantId === 'customer-demo')).toBe(true);
  });
});
