import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
const forms = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  status:
    i % 7 === 0
      ? "Missing"
      : i % 4 === 0
      ? "Review"
      : "Ready",
}));
export const Route = createFileRoute('/bulk-verify')({
  component: RouteComponent,
})
function RouteComponent() {
  const [verifying, setVerifying] = useState(false);
const [files, setFiles] = useState<FileList | null>(null);
const [results, setResults] = useState<any[]>([]);
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center mb-3">
          Bulk AI Verification
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Upload and verify up to 100 application forms using AI.
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8">

          <input
  type="file"
  multiple
  onChange={(e) => setFiles(e.target.files)}
  className="w-full border rounded-lg p-4"
/>
<button
onClick={async () => {
  if (!files) {
    alert("Please select files");
    return;
  }

  setVerifying(true);

  const formData = new FormData();

  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("http://localhost:5000/verify", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

setResults(data.results);

alert(`Uploaded ${data.total} files successfully`);
}}
className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
>
  {verifying ? "AI is Verifying..." : "Start AI Verification"}
</button>

        </div>
{verifying && (
  <>
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">

      <div className="bg-green-100 rounded-lg p-4 text-center">
        <h2 className="text-2xl font-bold">72</h2>
        <p>Ready</p>
      </div>

      <div className="bg-yellow-100 rounded-lg p-4 text-center">
        <h2 className="text-2xl font-bold">18</h2>
        <p>Review</p>
      </div>

      <div className="bg-red-100 rounded-lg p-4 text-center">
        <h2 className="text-2xl font-bold">10</h2>
        <p>Missing</p>
      </div>

      <div className="bg-blue-100 rounded-lg p-4 text-center">
        <h2 className="text-2xl font-bold">100</h2>
        <p>Total Forms</p>
      </div>

    </div>

    <div className="mt-8 bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Form</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
  {results.map((form, index) => {
    return (
      <tr key={index} className="border-t">
        <td className="p-3">{form.file}</td>
        <td className="p-3">{form.status}</td>
      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  </>
)}
      </div>
    </div>
  )
}

