import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-xl text-center p-8">
        <h1 className="text-6xl md:text-9xl font-extrabold text-indigo-600">
          404
        </h1>
        <p className="mt-4 text-2xl font-semibold">Page not found</p>
        <p className="mt-2 text-gray-600">
          We couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
