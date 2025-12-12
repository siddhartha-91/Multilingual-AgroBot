export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10">
      <div className="loader"></div>
      <p className="text-green-700 font-medium animate-pulse">
        Scanning leaf image…
      </p>
    </div>
  );
}
