'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  FolderIcon,
  DocumentTextIcon,
  PlayIcon,
  CogIcon,
  MagnifyingGlassIcon,
  BugAntIcon,
  PuzzlePieceIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
}

interface Tab {
  id: string;
  name: string;
  path: string;
  content: string;
  isDirty: boolean;
}

export default function VSCodeSimulation() {
  const [activeTab, setActiveTab] = useState<string>('main.js');
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'main.js',
      name: 'main.js',
      path: '/src/main.js',
      content: `// Welcome to VS Code Simulation
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log('Fibonacci of 10:', fibonacci(10));
function binarySearch(arr, target) {
  // TODO
}
const sortedArray = [1, 3, 5, 7, 9];
console.log(binarySearch(sortedArray, 7));`,
      isDirty: false
    }
  ]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/src']));
  const [terminal, setTerminal] = useState({
    isOpen: true,
    output: 'Welcome to VS Code Terminal\n$ ',
    height: 200
  });

  const fileTree: FileNode = {
    name: 'exam-project',
    type: 'folder',
    path: '/',
    children: [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          { name: 'main.js', type: 'file', path: '/src/main.js', content: tabs[0].content },
          { name: 'utils.js', type: 'file', path: '/src/utils.js', content: '// Utility functions\nexport const helpers = {};' },
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: [
              { name: 'Header.js', type: 'file', path: '/src/components/Header.js', content: '// Header component' },
              { name: 'Footer.js', type: 'file', path: '/src/components/Footer.js', content: '// Footer component' }
            ]
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        path: '/tests',
        children: [
          { name: 'main.test.js', type: 'file', path: '/tests/main.test.js', content: '// Tests for main.js' }
        ]
      },
      { name: 'package.json', type: 'file', path: '/package.json', content: '{ "name": "exam-project" }' },
      { name: 'README.md', type: 'file', path: '/README.md', content: '# Exam Project' }
    ]
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    newExpanded.has(path) ? newExpanded.delete(path) : newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const openFile = (node: FileNode) => {
    if (node.type === 'file') {
      const existing = tabs.find(tab => tab.path === node.path);
      if (!existing) {
        setTabs([...tabs, {
          id: node.name,
          name: node.name,
          path: node.path,
          content: node.content || '',
          isDirty: false
        }]);
      }
      setActiveTab(node.name);
    }
  };

  const closeTab = (tabId: string) => {
    const filtered = tabs.filter(tab => tab.id !== tabId);
    setTabs(filtered);
    if (activeTab === tabId && filtered.length) {
      setActiveTab(filtered[0].id);
    }
  };

  const updateTabContent = (content: string) => {
    setTabs(tabs.map(tab => tab.id === activeTab ? { ...tab, content, isDirty: true } : tab));
  };

  const runCode = () => {
    setTerminal(prev => ({
      ...prev,
      output: prev.output + '\n$ node src/main.js\nFibonacci of 10: 55\n$ '
    }));
  };

  const renderTree = (node: FileNode, level = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-gray-700 cursor-pointer text-sm ${
            activeTab === node.name ? 'bg-gray-600' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => node.type === 'folder' ? toggleFolder(node.path) : openFile(node)}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? <ChevronDownIcon className="h-4 w-4 mr-1" /> : <ChevronRightIcon className="h-4 w-4 mr-1" />}
              <FolderIcon className="h-4 w-4 mr-2 text-blue-400" />
            </>
          ) : (
            <DocumentTextIcon className="h-4 w-4 mr-2 text-gray-400 ml-5" />
          )}
          <span className="text-gray-200">{node.name}</span>
        </div>
        {node.type === 'folder' && isExpanded && node.children?.map(child => renderTree(child, level + 1))}
      </div>
    );
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Title Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm font-medium">ProctorX VS Code Simulation</div>
          <div className="text-xs text-gray-400">exam-project - Visual Studio Code</div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-1">
        <div className="flex items-center space-x-6 text-sm">
          {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(item => (
            <button key={item} className="hover:bg-gray-700 px-2 py-1 rounded">{item}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 space-y-4">
          {[DocumentTextIcon, MagnifyingGlassIcon, BugAntIcon, PuzzlePieceIcon].map((Icon, idx) => (
            <button key={idx} className="p-2 rounded hover:bg-gray-700" title="Icon">
              <Icon className="h-6 w-6" />
            </button>
          ))}
          <div className="flex-1" />
          <button className="p-2 rounded hover:bg-gray-700" title="Settings">
            <CogIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-3 border-b border-gray-700 font-bold text-gray-300">EXPLORER</div>
          <div className="p-2">{renderTree(fileTree)}</div>
        </div>

        {/* Editor & Terminal */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="flex items-center bg-gray-800 border-b border-gray-700 h-10">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                  tab.id === activeTab ? 'bg-gray-900 border-t border-l border-r border-gray-700' : 'bg-gray-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
                <XMarkIcon
                  className="h-4 w-4 ml-2 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                />
              </div>
            ))}
          </div>

          {/* Code Editor */}
          <div className="flex-1 bg-gray-900">
            {currentTab && (
              <Editor
                height="100%"
                theme="vs-dark"
                language="javascript"
                value={currentTab.content}
                onChange={(value) => updateTabContent(value || '')}
              />
            )}
          </div>

          {/* Terminal */}
          {terminal.isOpen && (
            <div className="bg-black text-green-400 font-mono text-sm p-2 border-t border-gray-700" style={{ height: `${terminal.height}px` }}>
              <div>{terminal.output}</div>
              <button
                className="mt-2 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                onClick={runCode}
              >
                <PlayIcon className="h-4 w-4 inline mr-1" />
                Run Code
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
