import type { DocumentDetail } from '@adaptivecash/api-client';
export const documentFixtures:DocumentDetail[]=[
 {id:'BR-DOC-001',title:'Branch cash collection order',status:'ReadyForSignature',signer:'Olena Kovalenko',createdAt:'2026-07-01T09:00:00Z',updatedAt:'2026-07-30T08:30:00Z',contentType:'application/pdf'},
 {id:'BR-DOC-002',title:'Daily cash balance statement',status:'Verified',signer:'Andrii Melnyk',createdAt:'2026-06-29T09:00:00Z',updatedAt:'2026-07-29T15:00:00Z',contentType:'application/pdf'},
 {id:'CU-DOC-001',title:'Customer collection request',status:'ReadyForSignature',signer:'Customer Operator',createdAt:'2026-07-25T10:00:00Z',updatedAt:'2026-07-30T07:45:00Z',contentType:'application/pdf'}
];
