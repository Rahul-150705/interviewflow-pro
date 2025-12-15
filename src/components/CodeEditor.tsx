import { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';

interface CodeEditorProps {
  question: string;
  onSubmit: (code: string, language: string) => void;
}

const codeTemplates: Record<string, string> = {
  python: '# Write your Python code here\ndef solution():\n    pass\n\nif __name__ == "__main__":\n    solution()',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}',
  javascript: '// Write your JavaScript code here\nfunction solution() {\n\n}\n\nsolution();',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}',
  c: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Write your C# code here\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your Go code here\n}',
  rust: 'fn main() {\n    // Write your Rust code here\n}',
};

const CodeEditor = ({ question, onSubmit }: CodeEditorProps) => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(codeTemplates['python']);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

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

  // ✅ Correct place to inject template (runs ONLY on language change)
  useEffect(() => {
    setCode(codeTemplates[language]);
    setOutput(null);
  }, [language]);

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput(null);

    const startTime = Date.now();
    let timerInterval: NodeJS.Timeout;

    try {
      timerInterval = setInterval(() => {
        setExecutionTime((Date.now() - startTime) / 1000);
      }, 100);

      const token = localStorage.getItem('token');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch('http://localhost:8080/api/compiler/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          sourceCode: code,
          language,
          stdin,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(timerInterval);

      setExecutionTime((Date.now() - startTime) / 1000);
      setOutput(await response.json());
    } catch (error: any) {
      clearInterval(timerInterval!);
      setExecutionTime((Date.now() - startTime) / 1000);

      if (error.name === 'AbortError') {
        setOutput({
          success: false,
          status: 'Timeout',
          error: 'Execution timed out after 20 seconds',
        });
      } else {
        setOutput({
          success: false,
          status: 'Error',
          error: error.message || 'Execution failed',
        });
      }
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Problem Statement</h3>
          <p>{question}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(l => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleRunCode} disabled={executing}>
            {executing ? <Loader2 className="animate-spin" /> : <Play />} Run
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="min-h-[400px] font-mono"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      <Card>
  <CardContent className="p-4">
    {!output ? (
      <span className="text-muted-foreground">Run code to see output</span>
    ) : (
      <div className="space-y-2">
        {/* Success output */}
        {output.stdout && (
          <pre className="text-sm whitespace-pre-wrap">
            {output.stdout}
          </pre>
        )}

        {/* Error output */}
        {output.stderr && (
          <pre className="text-sm text-red-500 whitespace-pre-wrap">
            {output.stderr}
          </pre>
        )}

        {/* Fallback (only if neither stdout nor stderr exists) */}
        {!output.stdout && !output.stderr && (
          <pre className="text-sm">
            {output.status}
          </pre>
        )}
      </div>
    )}
  </CardContent>
</Card>

      <div className="flex justify-end">
        <Button onClick={() => onSubmit(code, language)}>Submit</Button>
      </div>
    </div>
  );
};

export default CodeEditor;
