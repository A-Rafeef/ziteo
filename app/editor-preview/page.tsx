import {requireUser} from '../server/auth';
import EditorPreview from '../components/EditorPreview';

export const dynamic='force-dynamic';

export default async function EditorPreviewPage(){
 await requireUser('/#website');
 return <EditorPreview/>;
}
