export type DocumentStatus='Draft'|'ReadyForSignature'|'Signing'|'Verified'|'Failed';
export type SigningSessionStatus='Pending'|'AwaitingProvider'|'Verified'|'Failed'|'Expired';
export interface DocumentSummary { id:string; title:string; status:DocumentStatus; signer:string; createdAt:string; updatedAt:string; }
export interface SigningSession { id:string; documentId:string; status:SigningSessionStatus; provider:string; createdAt:string; expiresAt:string; }
export interface DocumentDetail extends DocumentSummary { contentType:string; signingSession?:SigningSession; }
export interface DocumentListFilters { search?:string; status?:DocumentStatus; }
export interface CreateSigningSessionRequest { documentId:string; idempotencyKey:string; }
export interface ProblemDetails { type?:string; title?:string; status?:number; detail?:string; instance?:string; code?:string; existingSessionId?:string; [key:string]:unknown; }
export class PortalApiError extends Error { constructor(public readonly status:number, public readonly problem:ProblemDetails){ super(problem.detail??problem.title??`HTTP ${status}`); this.name='PortalApiError'; } get retryable(){return this.status>=500;} }
export interface DocumentsApi { listDocuments(tenantId:string,filters:DocumentListFilters,signal?:AbortSignal):Promise<DocumentSummary[]>; getDocument(tenantId:string,documentId:string,signal?:AbortSignal):Promise<DocumentDetail>; getActiveSigningSession(tenantId:string,documentId:string,signal?:AbortSignal):Promise<SigningSession|null>; createSigningSession(tenantId:string,request:CreateSigningSessionRequest,signal?:AbortSignal):Promise<SigningSession>; getSigningSession(tenantId:string,sessionId:string,signal?:AbortSignal):Promise<SigningSession>; }
