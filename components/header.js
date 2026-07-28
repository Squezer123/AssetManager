import Link from "next/link";

export default function Header({}){
    return(
        <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

          <h1 className="text-2xl font-bold text-slate-800">
            Asset Manager
          </h1>


          <div className="flex gap-8">

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


            <Link
              href="/login"
              className="hover:text-blue-600"
            >
              Login
            </Link>

          </div>

        </div>
      </nav>
    );
}