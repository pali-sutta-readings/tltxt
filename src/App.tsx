import {
    DefaultKeyboardShortcutsDialog,
    DefaultKeyboardShortcutsDialogContent,
    DefaultToolbar,
    DefaultToolbarContent,
    TLComponents,
    TLUiAssetUrlOverrides,
    TLUiOverrides,
    Tldraw,
    TldrawUiMenuItem,
    useIsToolSelected,
    useTools,
} from 'tldraw'

// tldraw.css already included in index.css
// import 'tldraw/tldraw.css'

import { TltxtTool } from './tltxt-tool'

import declensions_legend_code from './declensions-legend-bookmarklet.js?raw';

// https://github.com/chimurai/bookmarklet/blob/gh-pages/js/bookmarklet.js
const BOOKMARKLET = {
    HEADER: 'javascript:(async function(){',
    FOOTER: '})()'
}

function createBookmarkletUri(sourceCode: string): string {
    const reStripComments = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm
    const bookmarklet = `${BOOKMARKLET.HEADER}${sourceCode.replace(reStripComments, '$1')}${BOOKMARKLET.FOOTER}`
    const bookmarkletEncoded = encodeURI(bookmarklet)
    return bookmarkletEncoded;
}

// Based on the tutorial:
// https://tldraw.dev/examples/ui/add-tool-to-toolbar

const uiOverrides: TLUiOverrides = {
    tools(editor, tools) {
        tools.tltxt = {
            id: 'tltxt',
            icon: 'tltxt-icon',
            label: 'TLTXT',
            kbd: 's',
            onSelect: () => {
                editor.setCurrentTool('tltxt')
            },
        }
        return tools
    },
}

const components: TLComponents = {
    Toolbar: (props) => {
        const tools = useTools()
        const isTltxtSelected = useIsToolSelected(tools['tltxt'])
        return (
            <DefaultToolbar {...props}>
                <TldrawUiMenuItem {...tools['tltxt']} isSelected={isTltxtSelected} />
                <DefaultToolbarContent />
            </DefaultToolbar>
        )
    },
    KeyboardShortcutsDialog: (props) => {
        const tools = useTools()
        return (
            <DefaultKeyboardShortcutsDialog {...props}>
                <DefaultKeyboardShortcutsDialogContent />
                {/* Ideally, we'd interleave this into the tools group */}
                <TldrawUiMenuItem {...tools['tltxt']} />
            </DefaultKeyboardShortcutsDialog>
        )
    },
}

export const customAssetUrls: TLUiAssetUrlOverrides = {
    icons: {
        // Prefixed with /tltxt/ because it is served as a gh-pages project page.
        'tltxt-icon': '/tltxt/static/mdi--text-box-outline.svg',
    },
}

const customTools = [TltxtTool]

function App() {
    return (
        <div className="tldraw-editor">
            <Tldraw
                tools={customTools}
                initialState="tltxt"
                overrides={uiOverrides}
                components={components}
                assetUrls={customAssetUrls}
                onMount={() => {
                    const link_el = document.getElementById('declensions-bookmarklet') as HTMLElement;
                    link_el.setAttribute(('href'), createBookmarkletUri(declensions_legend_code));
                }}
            />
        </div>
    )
}

export default App
