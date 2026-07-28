export default function Footer() {
    return (
      <footer className="border-t bg-white py-6">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Asset Manager. All rights reserved.
        </div>
      </footer>
    );
  }