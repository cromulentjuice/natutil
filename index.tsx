import { useState } from "react";

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDownloadLink("");

    if (!files || files.length === 0) {
      setError("Please select at least one XML file.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append("file", file);
    }

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Conversion failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadLink(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto py-12 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-6">🧾 XML to Excel Converter</h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept=".xml"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Convert to Excel"}
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {downloadLink && (
        <div className="mt-6">
          <a
            href={downloadLink}
            download="converted.xlsx"
            className="underline text-blue-600"
          >
            Download Converted Excel File
          </a>
          <iframe
            src={downloadLink}
            title="Excel Preview"
            className="w-full mt-4 h-96 border rounded"
          ></iframe>
        </div>
      )}
    </main>
  );
}
