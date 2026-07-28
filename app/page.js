import Link from "next/link";
import laptops from "../data/laptops.json";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Asset Manager
          </h1>

          <div className="flex items-center gap-8">
            <a href="/" className="hover:text-blue-600">
              Dashboard
            </a>

            <a href="/equipment" className="hover:text-blue-600">
              Equipment
            </a>

            <a href="/login" className="hover:text-blue-600">
              Logout
            </a>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-4xl font-bold text-slate-900">
          Dashboard
        </h2>

        <p className="mt-2 text-slate-600">
          Welcome to the Asset Management System.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Total laptops</p>
            <h3 className="mt-2 text-4xl font-bold">
              {laptops.length}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Available</p>
            <h3 className="mt-2 text-4xl font-bold text-green-600">
              {laptops.filter(l => l.status === "Available").length}
            </h3>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm text-gray-500">Assigned</p>
            <h3 className="mt-2 text-4xl font-bold text-orange-500">
              {laptops.filter(l => l.status === "Assigned").length}
            </h3>
          </div>
        </div>

        <div className="mt-12 rounded-xl bg-white p-6 shadow">
          <h3 className="mb-6 text-2xl font-semibold">
            Latest equipment
          </h3>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">Laptop</th>
                <th>Manufacturer</th>
                <th>CPU</th>
                <th>RAM</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {laptops.map((laptop) => (
                <tr
                  key={laptop.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="py-4 font-medium">
                    <Link href={`../equipment/${laptop.id}`} className="text-blue-600 hover:underline">
                      {laptop.name}
                    </Link>
                  </td>

                  <td>{laptop.manufacturer}</td>

                  <td>{laptop.cpu}</td>

                  <td>{laptop.ram}</td>

                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-sm ${
                        laptop.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {laptop.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
} 