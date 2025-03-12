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

import 'tldraw/tldraw.css'
// import './App.css'

import { TltxtTool } from './tltxt-tool'

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
        'tltxt-icon': '/mdi--text-box-outline.svg',
    },
}

const customTools = [TltxtTool]

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw
        tools={customTools}
        initialState="tltxt"
        overrides={uiOverrides}
        components={components}
        assetUrls={customAssetUrls}
      />
    </div>
  )
}

export default App
