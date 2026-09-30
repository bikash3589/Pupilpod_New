import Navbar from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-main">
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
