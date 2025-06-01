'use client'

import { useState } from 'react'

export default function CodeExecutor() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    const res = await fetch('/api/submit-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language })
    })
    const data = await res.json()
    setOutput(data.stdout || data.stderr || 'No output')
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <textarea value={code} onChange={(e) => setCode(e.target.value)} rows={10} className="w-full p-2 border" placeholder="Write your code..." />
      <select value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 border p-1">
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
        {/* add more languages */}
      </select>
      <button onClick={handleSubmit} className="block mt-2 bg-green-500 text-white px-4 py-2 rounded">
        {loading ? 'Running...' : 'Run Code'}
      </button>
      {output && <pre className="mt-4 bg-black text-white p-2 rounded">{output}</pre>}
    </div>
  )
}
