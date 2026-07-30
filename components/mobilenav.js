"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";

export default function MobileNav({ isAdmin, userEmail, isLoggedIn }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Otwórz menu"
        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b bg-white shadow-lg">
          <div className="flex flex-col divide-y divide-slate-100 px-6 py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="py-3 text-slate-700 hover:text-blue-600"
            >
              Dashboard
            </Link>

            <Link
              href="/equipment"
              onClick={() => setOpen(false)}
              className="py-3 text-slate-700 hover:text-blue-600"
            >
              Equipment
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="py-3 font-medium text-slate-900"
              >
                Admin Panel
              </Link>
            )}

            {isLoggedIn ? (
              <div className="py-3">
                <p className="mb-2 text-sm text-slate-500">{userEmail}</p>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Wyloguj się
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="py-3"
              >
                <span className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                  Zaloguj się
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}