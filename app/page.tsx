import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold">AUTHORIZED Security Workflow Studio</h1>
      <p className="max-w-2xl text-slate-300">
        Plan and run safe security posture workflows only for domains you own or are explicitly authorized to test.
      </p>
      <div className="flex gap-3">
        <Link href="/app" className="rounded bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500">Open Studio</Link>
        <Link href="/terms" className="rounded border border-slate-700 px-4 py-2">Terms</Link>
      </div>
    </main>
  );
}
