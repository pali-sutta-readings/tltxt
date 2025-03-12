import { StateNode, Editor, TLTextShape, toRichText } from 'tldraw'

const OFFSET = 12;
export class TltxtTool extends StateNode {
    static override id = 'tltxt';

    override onEnter() {
        this.editor.setCursor({ type: 'cross', rotation: 0 });
    }

    override onPointerDown() {
        const { currentPagePoint } = this.editor.inputs;
        this.editor.createShape<TLTextShape>({
            type: 'text',
            x: currentPagePoint.x - OFFSET,
            y: currentPagePoint.y - OFFSET,
            props: { richText: toRichText('🕮') },
        })
    }
}
