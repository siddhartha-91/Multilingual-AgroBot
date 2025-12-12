import UploadBox from "@/components/upload-box";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-green-50 px-4 py-16">

      {/* Title */}
      <h1 className="text-5xl font-extrabold text-green-700 drop-shadow-sm">
        🌿 KissanAI
      </h1>

      {/* Subtitle */}
      <p className="text-green-800 mt-3 text-center max-w-lg text-lg">
        Diagnose crop diseases instantly using AI. Upload a leaf image to begin.
      </p>

      {/* Upload Box */}
      <div className="w-full max-w-xl mt-12 animate-fadeIn">
        <UploadBox />
      </div>

      {/* Demo Section */}
      <h3 className="text-green-700 font-semibold mt-10 mb-3">
        Try with demo images:
      </h3>

      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-lg bg-green-200 flex items-center justify-center text-green-700">
          Demo 1
        </div>
        <div className="w-20 h-20 rounded-lg bg-green-200 flex items-center justify-center text-green-700">
          Demo 2
        </div>
        <div className="w-20 h-20 rounded-lg bg-green-200 flex items-center justify-center text-green-700">
          Demo 3
        </div>
      </div>
    </main>
  );
}
