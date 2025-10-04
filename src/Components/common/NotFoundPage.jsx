// NotFound.jsx
export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-lg text-gray-600 mb-6">Oops! The page you are looking for does not exist.</p>
            <a
                href="/"
                className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/70 transition"
            >
                Go Back Home
            </a>
        </div>
    );
}
