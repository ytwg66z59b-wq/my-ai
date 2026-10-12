import { useRef, useState } from 'react'
import { useGame } from '../state/GameContext'
import './BackupScreen.css'

export function BackupScreen() {
  const { exportBackup, importBackup, resetAll } = useGame()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  function handleExport() {
    const json = exportBackup()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dragon-days-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMessage('バックアップをダウンロードしました')
  }

  async function handleImportFile(file: File) {
    const text = await file.text()
    importBackup(text)
    setMessage('インポートを実行しました')
  }

  return (
    <section className="backup-screen">
      <header className="screen-head">
        <h1>設定・バックアップ</h1>
        <p>データは端末内（IndexedDB）に保存されます</p>
      </header>

      <div className="backup-block">
        <h2>エクスポート</h2>
        <p>育成・カウント・図鑑データを JSON で保存します。</p>
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          バックアップを保存
        </button>
      </div>

      <div className="backup-block">
        <h2>インポート</h2>
        <p>以前のバックアップから復元します（上書き）。</p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="file-input"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => fileRef.current?.click()}
        >
          ファイルを選ぶ
        </button>
      </div>

      <div className="backup-block danger">
        <h2>初期化</h2>
        <p>すべての記録を消し、最初の卵からやり直します。</p>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm('本当にすべてのデータを削除しますか？')) {
              void resetAll()
              setMessage('初期化しました')
            }
          }}
        >
          データを初期化
        </button>
      </div>

      {message && <p className="backup-msg">{message}</p>}
    </section>
  )
}
