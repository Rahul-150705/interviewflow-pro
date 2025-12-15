import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Send,
  FileCode,
  Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const languageIcons: Record<string, string> = {
  python: '🐍',
  java: '☕',
  javascript: '💛',
  cpp: '⚡',
  c: '🔧',
  csharp: '💜',
  go: '🐹',
  rust: '🦀',
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

  const lineCount = code.split('\n').length;

  return (
    <div className="space-y-4">
      {/* Problem Statement Card */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <CardHeader className="pb-3 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileCode className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Problem Statement</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-muted-foreground leading-relaxed">{question}</p>
        </CardContent>
      </Card>

      {/* Editor Toolbar */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-44 bg-muted/50 border-border/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span>{languageIcons[language]}</span>
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l.value} value={l.value}>
                      <div className="flex items-center gap-2">
                        <span>{languageIcons[l.value]}</span>
                        <span>{l.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Badge variant="outline" className="text-xs text-muted-foreground border-border/50">
                {lineCount} lines
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {executing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span>{executionTime.toFixed(1)}s</span>
                </div>
              )}
              
              <Button 
                onClick={handleRunCode} 
                disabled={executing}
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
              >
                {executing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          <Code className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Code Editor</span>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
        </div>
        <CardContent className="p-0">
          <div className="relative">
            {/* Line numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-muted/20 border-r border-border/30 flex flex-col items-end pr-2 pt-4 text-xs text-muted-foreground/50 font-mono select-none overflow-hidden">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="h-6 leading-6">{i + 1}</div>
              ))}
            </div>
            <Textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              className="min-h-[400px] font-mono text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none pl-14 py-4 leading-6"
              spellCheck={false}
              placeholder="Start coding..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Input (stdin) */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          <Terminal className="h-4 w-4 text-secondary" />
          <span className="text-sm font-medium">Input (stdin)</span>
        </div>
        <CardContent className="p-0">
          <Textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            className="min-h-[80px] font-mono text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
            spellCheck={false}
            placeholder="Enter input for your program..."
          />
        </CardContent>
      </Card>

      {/* Output */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 border-b border-border/50">
          <Terminal className="h-4 w-4 text-accent-foreground" />
          <span className="text-sm font-medium">Output</span>
          {output && (
            <Badge 
              variant={output.stdout && !output.stderr ? "default" : output.stderr ? "destructive" : "secondary"}
              className="ml-auto text-xs"
            >
              {output.stdout && !output.stderr ? (
                <><CheckCircle2 className="h-3 w-3 mr-1" /> Success</>
              ) : output.stderr ? (
                <><XCircle className="h-3 w-3 mr-1" /> Error</>
              ) : (
                output.status || 'Completed'
              )}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          {!output ? (
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-lg bg-muted/50">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-sm">Run your code to see the output here</span>
            </div>
          ) : (
            <div className="space-y-3">
              {output.stdout && (
                <pre className="text-sm font-mono whitespace-pre-wrap bg-muted/30 rounded-lg p-3 border border-border/30">
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre className="text-sm font-mono whitespace-pre-wrap text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                  {output.stderr}
                </pre>
              )}
              {!output.stdout && !output.stderr && (
                <pre className="text-sm font-mono text-muted-foreground">
                  {output.status || 'No output'}
                </pre>
              )}
              {executionTime > 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/30">
                  <Clock className="h-3 w-3" />
                  <span>Execution time: {executionTime.toFixed(2)}s</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={() => onSubmit(code, language)}
          size="lg"
          className="gap-2 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
        >
          <Send className="h-4 w-4" />
          Submit Solution
        </Button>
      </div>
    </div>
  );
};

export default CodeEditor;
