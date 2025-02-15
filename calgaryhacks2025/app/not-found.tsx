export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 
          text-white rounded-lg font-semibold transition-all hover:scale-105"
        >
          Go Home
        </a>
      </div>
    </div>
  );
} 