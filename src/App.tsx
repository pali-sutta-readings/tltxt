import { Tldraw } from 'tldraw'
// import 'tldraw/tldraw.css'
// import './App.css'

function App() {
  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <Tldraw onMount={(editor) => {
        window.editor = editor;
      }}
      />
    </div>
  )
}

export default App
