import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { executeCode } from '../../utils/api';
import { languageIds } from '../../utils/languageIds';

interface Props {
  token: string; // Supabase JWT
}

const CodeEditor: React.FC<Props> = ({ token }) => {
  const [language, setLanguage] = useState('python');
  const [languageId, setLanguageId] = useState(languageIds.python);
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    try {
      const result = await executeCode(token, code, languageId, stdin);
      setOutput(result.stdout || result.stderr || result.compile_output || 'No output');
    } catch (err: any) {
      setOutput('Execution error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          className="border p-2 rounded"
          value={language}
          onChange={(e) => {
            const lang = e.target.value;
            setLanguage(lang);
            setLanguageId(languageIds[lang]);
          }}
        >
          {Object.entries(languageIds).map(([lang, id]) => (
            <option key={id} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleExecute}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Run Code'}
        </button>
      </div>

      <Editor
        height="300px"
        defaultLanguage={language}
        value={code}
        onChange={(value) => setCode(value || '')}
        theme="vs-dark"
      />

      <textarea
        className="w-full p-2 border rounded"
        rows={3}
        placeholder="Optional stdin input"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
      />

      {output !== null && (
        <div className="bg-gray-100 p-4 rounded border whitespace-pre-wrap">
          <strong>Output:</strong>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
