import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Code,
  Terminal,
  Clock,
  Database
} from 'lucide-react';

interface CodeEditorProps {
  question: string;
  onSubmit: (code: string, language: string) => void;
}

const CodeEditor = ({ question, onSubmit }: CodeEditorProps) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [executing, setExecuting] = useState(false);

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
  ];

  const codeTemplates: Record<string, string> = {
    python: '# Write your Python code here\ndef solution():\n    pass\n\nif __name__ == "__main__":\n    solution()',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}',
    javascript: '// Write your JavaScript code here\nfunction solution() {\n    // your code\n}\n\nsolution();',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Write your C# code here\n    }\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your Go code here\n}',
    rust: 'fn main() {\n    // Write your Rust code here\n}',
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (!code || code === codeTemplates[language]) {
      setCode(codeTemplates[newLanguage]);
    }
  };

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/compiler/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify({
          sourceCode: code,
          language: language,
          stdin: stdin
        })
      });

      const result = await response.json();
      setOutput(result);
    } catch (error) {
      setOutput({
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed'
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitAnswer = () => {
    onSubmit(code, language);
  };

  // Initialize with template if empty
  if (!code) {
    setCode(codeTemplates[language]);
  }

  return (
    <div className="space-y-4">
      {/* Question Display */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0">
              <Code className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Problem Statement</h3>
              <p className="text-foreground leading-relaxed">{question}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Controls */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Language:</span>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-40 bg-card border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/50">
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleRunCode}
              disabled={executing || !code.trim()}
              className="gradient-primary text-primary-foreground border-0"
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Code Editor */}
        <Card className="glass-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Code Editor</h3>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              className="min-h-[400px] font-mono text-sm bg-card border-border/50 focus:border-primary focus:ring-primary/20 resize-none"
              spellCheck={false}
            />
            <div className="mt-3 text-xs text-muted-foreground">
              {code.split('\n').length} lines • {code.length} characters
            </div>
          </CardContent>
        </Card>

        {/* Input/Output Panel */}
        <div className="space-y-4">
          {/* Input */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Input (stdin)</h3>
              </div>
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Provide input for your program..."
                className="min-h-[100px] font-mono text-sm bg-card border-border/50 focus:border-primary focus:ring-primary/20 resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="glass-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Output</h3>
              </div>
              
              {!output ? (
                <div className="min-h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Run your code to see output here
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {output.success ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`font-medium ${output.success ? 'text-success' : 'text-destructive'}`}>
                      {output.status}
                    </span>
                  </div>

                  {/* Execution Stats */}
                  {output.time && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{output.time}s</span>
                      </div>
                      {output.memory && (
                        <div className="flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          <span>{output.memory} KB</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Standard Output */}
                  {output.stdout && (
                    <div className="bg-card p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Output:</div>
                      <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                        {output.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Errors */}
                  {output.stderr && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30">
                      <div className="text-xs text-destructive mb-1">Error:</div>
                      <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
                        {output.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Compile Errors */}
                  {output.compile_output && (
                    <div className="bg-warning/10 p-3 rounded-lg border border-warning/30">
                      <div className="text-xs text-warning mb-1">Compilation Error:</div>
                      <pre className="font-mono text-sm text-warning whitespace-pre-wrap">
                        {output.compile_output}
                      </pre>
                    </div>
                  )}

                  {/* Generic Error */}
                  {output.error && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30">
                      <div className="text-xs text-destructive mb-1">Error:</div>
                      <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
                        {output.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmitAnswer}
          disabled={!code.trim()}
          className="gradient-primary text-primary-foreground border-0 shadow-glow"
          size="lg"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Submit Solution
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;