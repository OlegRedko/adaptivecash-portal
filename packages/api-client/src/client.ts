import { PortalApiError, type CreateSigningSessionRequest, type DocumentDetail, type DocumentListFilters, type DocumentSummary, type DocumentsApi, type ProblemDetails, type SigningSession } from './contracts';
export function createDocumentsApi(baseUrl='/api', fetchImpl:typeof fetch=fetch):DocumentsApi {
 const send=async<T>(tenantId:string,path:string,init:RequestInit={})=>{ const headers=new Headers(init.headers); headers.set('X-Tenant-Id',tenantId); if(init.body) headers.set('Content-Type','application/json'); const response=await fetchImpl(`${baseUrl}${path}`,{...init,headers}); if(response.status===204)return null as T; const body=await response.json().catch(()=>({title:response.statusText,status:response.status}) as ProblemDetails); if(!response.ok)throw new PortalApiError(response.status,body as ProblemDetails); return body as T; };
 return {
  listDocuments:(tenantId,filters,signal)=>{const q=new URLSearchParams(); if(filters.search)q.set('search',filters.search); if(filters.status)q.set('status',filters.status); return send<DocumentSummary[]>(tenantId,`/documents?${q}`,{signal});},
  getDocument:(tenantId,id,signal)=>send<DocumentDetail>(tenantId,`/documents/${encodeURIComponent(id)}`,{signal}),
  getActiveSigningSession:(tenantId,id,signal)=>send<SigningSession|null>(tenantId,`/documents/${encodeURIComponent(id)}/active-signing-session`,{signal}),
  createSigningSession:(tenantId,request,signal)=>send<SigningSession>(tenantId,`/documents/${encodeURIComponent(request.documentId)}/signing-sessions`,{method:'POST',headers:{'Idempotency-Key':request.idempotencyKey},body:JSON.stringify({documentId:request.documentId}),signal}),
  getSigningSession:(tenantId,id,signal)=>send<SigningSession>(tenantId,`/signing-sessions/${encodeURIComponent(id)}`,{signal})
 };
}
