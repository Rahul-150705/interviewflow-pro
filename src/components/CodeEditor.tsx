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
  AlertCircle
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
  const [executionTime, setExecutionTime] = useState<number>(0);

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
    java: 'public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n        String input = "Hello World";\n        String reversed = reverseString(input);\n        System.out.println(reversed);\n    }\n    \n    public static String reverseString(String str) {\n        // Your solution here\n        return str;\n    }\n}',
    javascript: '// Write your JavaScript code here\nfunction solution() {\n    // your code\n}\n\nsolution();',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}',
    csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        // Write your C# code here\n    }\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your Go code here\n}',
    rust: 'fn main() {\n    // Write your Rust code here\n}',
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setOutput(null); // Clear previous output
    if (!code || code === codeTemplates[language]) {
      setCode(codeTemplates[newLanguage]);
    }
  };

  const handleRunCode = async () => {
    setExecuting(true);
    setOutput(null);
    
    // ✅ Start timer
    const startTime = Date.now();
    let timerInterval: NodeJS.Timeout;
    
    try {
      // ✅ Update execution time every 100ms
      timerInterval = setInterval(() => {
        setExecutionTime((Date.now() - startTime) / 1000);
      }, 100);

      const token = localStorage.getItem('token');
      
      // ✅ Set a client-side timeout (20 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch('http://localhost:8080/api/compiler/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization:`Bearer ${token}` })
        },
        body: JSON.stringify({
          sourceCode: code,
          language: language,
          stdin: stdin
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(timerInterval);
      
      setExecutionTime((Date.now() - startTime) / 1000);

      const result = await response.json();
      setOutput(result);
      
    } catch (error) {
      clearInterval(timerInterval!);
      setExecutionTime((Date.now() - startTime) / 1000);
      
      if (error instanceof Error && error.name === 'AbortError') {
        setOutput({
          success: false,
          error: 'Execution timed out after 20 seconds. Your code may have an infinite loop or is taking too long to run.',
          status: 'Timeout',
          statusId: 5
        });
      } else {
        setOutput({
          success: false,
          error: error instanceof Error ? error.message : 'Execution failed',
          status: 'Error',
          statusId: 4
        });
      }
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
                  Running... {executionTime.toFixed(1)}s
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
              disabled={executing}
            />
            <div className="mt-3 text-xs text-muted-foreground">
              {code.split('\n').length} lines • {code.length} characters
              {language === 'java' && (
                <div className="mt-2 flex items-start gap-2 p-2 bg-primary/10 border border-primary/30 rounded text-primary">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Java tip: Your public class name must match the filename. 
                    Use "public class Main" or the system will auto-detect your class name.
                  </span>
                </div>
              )}
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
                disabled={executing}
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
              
              {executing ? (
                <div className="min-h-[250px] flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <div className="text-center">
                    <p className="text-sm text-foreground mb-1">Executing your code...</p>
                    <p className="text-xs text-muted-foreground">Time: {executionTime.toFixed(1)}s</p>
                  </div>
                </div>
              ) : !output ? (
                <div className="min-h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Run your code to see output here
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {output.success ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : output.status === 'Timeout' ? (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className={`font-medium ${
                      output.success ? 'text-success' : 
                      output.status === 'Timeout' ? 'text-warning' : 
                      'text-destructive'
                    }`}>
                      {output.status}
                    </span>
                  </div>

                  {/* Execution Stats */}
                  {(output.time || executionTime > 0) && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{output.time || executionTime.toFixed(3)}s</span>
                      </div>
                    </div>
                  )}

                  {/* Standard Output */}
                  {output.stdout && (
                    <div className="bg-card p-3 rounded-lg border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Output:</div>
                      <pre className="font-mono text-sm text-foreground whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {output.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Errors */}
                  {output.stderr && (
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30 max-h-48 overflow-y-auto">
                      <div className="text-xs text-destructive mb-1">Error:</div>
                      <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
                        {output.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Generic Error */}
                  {output.error && (
                    <div className={`p-3 rounded-lg border ${
                      output.status === 'Timeout' 
                        ? 'bg-warning/10 border-warning/30' 
                        : 'bg-destructive/10 border-destructive/30'
                    } max-h-48 overflow-y-auto`}>
                      <div className={`text-xs mb-1 ${
                        output.status === 'Timeout' ? 'text-warning' : 'text-destructive'
                      }`}>
                        {output.status === 'Timeout' ? 'Timeout:' : 'Error:'}
                      </div>
                      <pre className={`font-mono text-sm whitespace-pre-wrap ${
                        output.status === 'Timeout' ? 'text-warning' : 'text-destructive'
                      }`}>
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
          disabled={!code.trim() || executing}
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