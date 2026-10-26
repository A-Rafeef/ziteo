import WorkspaceApp from './workspace';
import { requireUser } from './server/auth';
export const dynamic = 'force-dynamic';
export default async function Home(){await requireUser('/');return <WorkspaceApp/>;}
