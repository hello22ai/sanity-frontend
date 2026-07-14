import Link from "next/link";
import { logout } from "@/app/login/actions";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hello22-logo.png"
            alt="hello22.ai"
            className="h-8 w-auto transition-transform duration-200 group-hover:scale-[1.03]"
            width={2086}
            height={426}
          />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="cursor-pointer rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-600 transition-colors duration-200 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200/80 py-8">
      <p className="text-center text-sm text-stone-500">
        © {new Date().getFullYear()} hello22.ai · Stories &amp; ideas worth
        sharing
      </p>
    </footer>
  );
}
