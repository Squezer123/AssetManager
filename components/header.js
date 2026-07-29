import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Header() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <h1 className="text-2xl font-bold text-slate-800">
          Asset Manager
        </h1>

        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="hover:text-blue-600"
          >
            Dashboard
          </Link>

          <Link
            href="/equipment"
            className="hover:text-blue-600"
          >
            Equipment
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-900"
            >
              Admin Panel
            </Link>
          )}

          {session?.user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Wyloguj się
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Zaloguj się
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}