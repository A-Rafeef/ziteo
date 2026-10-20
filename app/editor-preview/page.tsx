import {requireChatGPTUser} from '../chatgpt-auth';
import EditorPreview from '../components/EditorPreview';

export const dynamic='force-dynamic';

export default async function EditorPreviewPage(){
 await requireChatGPTUser('/#website');
 return <EditorPreview/>;
}
