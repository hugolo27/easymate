"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SummaryRequest {
  text: string;
  max_length: number;
}

interface SummaryChunk {
  type: string;
  content: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [maxLength, setMaxLength] = useState(150);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://smart-summary-backend.onrender.com";

  // Debug: Log when summary changes
  useEffect(() => {
    console.log("Summary state changed to:", summary);
  }, [summary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSummary("");
    setError("");
    setLoading(true);

    try {
      console.log("Making request to:", `${apiUrl}/summarize`);
      
      const response = await fetch(`${apiUrl}/summarize`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/plain",
        },
        body: JSON.stringify({ text: input, max_length: maxLength }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        console.log("Received chunk:", chunk);
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              let jsonStr = line.slice(6);
              if (jsonStr.startsWith('data: ')) {
                jsonStr = jsonStr.slice(6);
              }
              
              console.log("Parsing JSON:", jsonStr);
              
              const data: SummaryChunk = JSON.parse(jsonStr);
              console.log("Parsed data:", data);
              
              if (data.type === "summary_chunk" && data.content) {
                fullText += data.content;
                console.log("Setting summary to:", fullText);
                setSummary(fullText);
              } else if (data.type === "error") {
                throw new Error(data.content);
              }
            } catch (parseError) {
              console.log("Parse error for line:", line, parseError);
              continue;
            }
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      console.error("Summary generation error:", err);
    } finally {
      setLoading(false);
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "nearest"
        });
      }, 100);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (error) setError("");
  };

  const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxLength(Number(e.target.value));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-800 text-3xl font-bold">Smart Summary</span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none text-lg bg-gray-50 transition-colors duration-200"
            placeholder="Paste your text here..."
            value={input}
            onChange={handleInputChange}
            required
            maxLength={10000}
            disabled={loading}
            aria-label="Text to summarize"
            aria-describedby="text-length"
          />
          
          <div className="text-xs text-gray-500 text-right" id="text-length">
            {input.length}/10,000 characters
          </div>
          
          <div className="flex items-center gap-4">
            <label htmlFor="maxLength" className="text-gray-700 font-medium">
              Summary Length:
            </label>
            <input
              id="maxLength"
              type="range"
              min={50}
              max={500}
              value={maxLength}
              onChange={handleMaxLengthChange}
              className="accent-blue-500 flex-1"
              disabled={loading}
              aria-label={`Summary length: ${maxLength} characters`}
            />
            <span className="text-blue-600 font-bold w-12 text-center">
              {maxLength}
            </span>
          </div>
          
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || !input.trim()}
            aria-label={loading ? "Generating summary..." : "Generate summary"}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Summarizing...
              </span>
            ) : (
              "Summarize"
            )}
          </button>
        </form>
        
        <div ref={summaryRef} className="mt-8 min-h-[64px]">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-medium">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {summary && (
            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 text-lg text-gray-900 whitespace-pre-line animate-fade-in">
              {summary}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-xs text-gray-400 text-center">
          Developed by{" "}
          <Link 
            href="https://www.linkedin.com/in/hugolo27/" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-200 underline"
          >
            Hugo López
          </Link>{" "}
          as a Technical Challenge
        </div>
      </div>
    </main>
  );
} 