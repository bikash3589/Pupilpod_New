type PageLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export default function PageLayout({
  title,
  children,
}: PageLayoutProps) {
  return (
    <main className="page">
      <h1 className="page-title">{title}</h1>

      <section className="application-container">
        <div className="card">
          {children}
        </div>
      </section>
    </main>
  );
}