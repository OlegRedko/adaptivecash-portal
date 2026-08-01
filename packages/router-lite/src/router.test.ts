import { matchRoute } from './router';
describe('matchRoute',()=>{ it('extracts a route parameter',()=>{ expect(matchRoute('/documents/:documentId','/documents/DOC-1')).toEqual({documentId:'DOC-1'}); }); it('does not match another route',()=>{ expect(matchRoute('/documents/:documentId','/settings')).toBeNull(); }); });
