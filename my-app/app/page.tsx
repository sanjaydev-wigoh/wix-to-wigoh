// // app/page.tsx
// 'use client';

// import { useState } from 'react';

// export default function HomePage() {
//   const [html, setHtml] = useState('');
//   const [result, setResult] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const res = await fetch('/api/convert', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ html }),
//       });

//       const data = await res.json();
//       if (res.ok) {
//         setResult(JSON.stringify(data, null, 2));
//         setError('');
//       } else {
//         setError(data.error || 'Unknown error');
//         setResult('');
//       }
//     } catch (err: any) {
//       setError('Fetch error');
//       setResult('');
//     }
//   };

//   return (
//     <main className="p-10 max-w-4xl mx-auto">
//       <h1 className="text-2xl text-black font-bold mb-4">Wix HTML → Layout Converter</h1>
//       <form onSubmit={handleSubmit}>
//         <textarea
//           className="w-full p-4 h-64 border text-black rounded mb-4"
//           placeholder="Paste raw Wix HTML here"
//           value={html}
//           onChange={(e) => setHtml(e.target.value)}
//           required
//         />
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           Convert
//         </button>
//       </form>

//       {error && (
//         <p className="text-red-500 mt-4">
//           ⚠️ Error: {error}
//         </p>
//       )}

//       {result && (
//         <pre className="mt-6 p-4 bg-gray-100 text-black rounded overflow-auto">
//           {result}
//         </pre>
//       )}
//     </main>
//   );
// }
// 'use client';
// import { useState } from 'react';

// export default function Page() {
//   const [html, setHtml] = useState('');
//   const [result, setResult] = useState<any>(null);

//   const handleConvert = async () => {
//     const res = await fetch('/api/convert', {
//       method: 'POST',
//       body: JSON.stringify({ html }),
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await res.json();
//     setResult(data);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Convert HTML to Org JSON</h1>
//       <textarea
//         className="w-full text-black h-64 p-4 border rounded"
//         value={html}
//         onChange={(e) => setHtml(e.target.value)}
//         placeholder="Paste your HTML here..."
//       />
//       <button
//         onClick={handleConvert}
//         className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Convert
//       </button>

//       {result && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold mb-2">Output JSON:</h2>
//           <pre className="bg-gray-100 text-black p-4 rounded text-sm overflow-x-auto">
//             {JSON.stringify(result, null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useState } from "react";

export default function HtmlConverter() {
  const [rawHtml, setRawHtml] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConvert() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/convert-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawHtml }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <div
      className="flex gap-20 items-center"
      style={{  margin: "1rem", fontFamily: "sans-serif" }}
    >
      <div style={{ width: "80%" }}>
        <h1 className="text-purple-700 font-mono font-semibold">Raw HTML to Org Format Converter</h1>
        <textarea
          className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 font-mono text-sm shadow-sm placeholder-gray-400"
          placeholder="Paste raw HTML here..."
          value={rawHtml}
          onChange={(e) => setRawHtml(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            fontFamily: "monospace",
            fontSize: 14,
            color: "black",
          }}
        />
      </div>
      <div>
        <button
          className="px-6 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-md hover:from-indigo-600 hover:to-purple-600 transition duration-300 ease-in-out"
          onClick={handleConvert}
          disabled={loading || rawHtml.trim() === ""}
          style={{ marginTop: 10, padding: "8px 16px", fontSize: 16 }}
        >
          {loading ? "Converting..." : "Convert"}
        </button>
      </div>
    
    </div>  <div>
        {error && (
          <pre style={{ marginTop: 20, color: "red", whiteSpace: "pre-wrap" }}>
            Error: {error}
          </pre>
        )}

        {result && (
          <>
            <h2 className="text-purple-700 font-mono font-semibold" style={{ marginTop: 20 }}>Converted JSON Layout</h2>
            <pre
              style={{
                backgroundColor: "#f0f0f0",
                padding: 10,
                color: "black",
                borderRadius: 6,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {result}
            </pre>
          </>
        )}
      </div></>
  );
}
