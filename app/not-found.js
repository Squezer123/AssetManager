import Link from "next/link";


export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">

      <div className="rounded-xl bg-white p-10 text-center shadow">

        <h1 className="text-6xl font-bold text-slate-800">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold">
          Page not found
        </h2>

        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Back to dashboard
        </Link>

      </div>

    </main>
  );
}