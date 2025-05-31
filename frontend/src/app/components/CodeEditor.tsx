import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { executeCode } from '@/utils/api';
import { languageIds } from '@/utils/languageIds';

interface Props {
  token: string;
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
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg space-y-4">
      <div className="flex items-center gap-4">
        <select
          className="p-2 bg-gray-700 text-white rounded"
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
        className="w-full bg-gray-700 text-white p-3 rounded"
        rows={3}
        placeholder="Optional stdin input"
        value={stdin}
        onChange={(e) => setStdin(e.target.value)}
      />

      {output !== null && (
        <div className="bg-gray-900 p-4 rounded border border-gray-700 text-white whitespace-pre-wrap">
          <strong className="text-green-400">Output:</strong>
          <pre className="mt-2">{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
