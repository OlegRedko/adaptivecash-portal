import type { DocumentStatus, SigningSessionStatus } from '@adaptivecash/api-client';

/** A document can be signed when it is awaiting signature, or when the last attempt failed. */
const SIGNABLE_DOCUMENT_STATUSES: readonly DocumentStatus[] = ['ReadyForSignature', 'Failed'];

export const isSignableDocumentStatus = (status: DocumentStatus): boolean =>
  SIGNABLE_DOCUMENT_STATUSES.includes(status);

export const TERMINAL_SIGNING_STATUSES: readonly SigningSessionStatus[] = [
  'Verified',
  'Failed',
  'Expired',
];

export const isTerminalSigningStatus = (status: SigningSessionStatus | undefined): boolean =>
  status !== undefined && TERMINAL_SIGNING_STATUSES.includes(status);

/** Failed and Expired are retryable; a new attempt must use a new idempotency key. */
export const isRetryableSigningStatus = (status: SigningSessionStatus | undefined): boolean =>
  status === 'Failed' || status === 'Expired';
