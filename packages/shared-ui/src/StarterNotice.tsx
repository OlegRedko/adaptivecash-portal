import { Card, CardHeader, Text, makeStyles, tokens } from '@fluentui/react-components';
const useStyles = makeStyles({ root:{ maxWidth:'760px', margin:'48px auto', padding:tokens.spacingHorizontalL }, body:{ padding:tokens.spacingHorizontalL, display:'grid', gap:tokens.spacingVerticalM } });
export interface StarterNoticeProps { portalName:string; tenantId:string; permissions:string[]; }
export function StarterNotice({ portalName, tenantId, permissions }:StarterNoticeProps) {
 const s=useStyles();
 return <main className={s.root}><Card><CardHeader header={<Text size={600} weight="semibold">{portalName}</Text>} description={<Text>AdaptiveCash take-home starter</Text>}/><div className={s.body}><Text>Tenant: <strong>{tenantId}</strong></Text><Text>Permissions: {permissions.join(', ')}</Text><Text>The build, providers, router, typed API client and backend fixtures are ready. Implement platform-core and documents-feature according to the assignment.</Text></div></Card></main>;
}
