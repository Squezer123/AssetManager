import laptops from "../../../data/laptops.json";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function LaptopDetails({ params }) {

  const { id } = await params;

  const laptop = laptops.find(
    (item) => item.id.toString() === id
  );
  if (!laptop) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl px-6 py-10">

        <Link
          href="/"
          className="text-blue-600 hover:underline"
        >
          ← Back to equipment
        </Link>

        <div className="mt-8 grid gap-10 rounded-xl bg-white p-8 shadow md:grid-cols-2">

          <div className="flex h-96 items-center justify-center rounded-xl bg-slate-200">

            <div className="text-center text-slate-500">

              <div className="text-6xl">
                💻
              </div>

              <p className="mt-3">
                Laptop image
              </p>

            </div>

          </div>

          <div>

            <h2 className="text-4xl font-bold text-slate-900">
              {laptop.name}
            </h2>

            <p className="mt-3 text-slate-600">
              Corporate device used for company operations.
            </p>

            <div className="mt-8 space-y-5">

              <Info
                label="Manufacturer"
                value={laptop.manufacturer}
              />

              <Info
                label="CPU"
                value={laptop.cpu}
              />

              <Info
                label="RAM"
                value={laptop.ram}
              />

              <Info
                label="Storage"
                value={laptop.storage || "512GB SSD"}
              />

              <Info
                label="Operating System"
                value={laptop.os || "Windows 11"}
              />

              <Info
                label="Serial Number"
                value={laptop.serial || "N/A"}
              />

              <div>
                <p className="text-sm text-gray-500">
                  Availability
                </p>
                <span
                  className={`inline-block rounded-full px-4 py-2 text-sm ${
                    laptop.status === "Available"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >

                  {laptop.status}

                </span>
              </div>
            </div>

            <button
              className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Assign laptop
            </button>

          </div>
        </div>

        <div className="mt-10 rounded-xl bg-white p-8 shadow">

          <h3 className="text-2xl font-semibold">
            Description
          </h3>

          <p className="mt-4 text-slate-600 leading-7">
            This laptop belongs to the company inventory.
            It is configured for business applications,
            programming and everyday office tasks.
          </p>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }) {

  return (

    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>


      <p className="font-medium text-slate-800">
        {value}
      </p>

    </div>

  );

}