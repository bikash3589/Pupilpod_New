import Link from "next/link"
export default function Gopi(){
        return(
        <main className="page">
           <header>
          <nav className="navigation">
            <Link href="/" className="navigationButton">Home</Link>
            <Link href="/" className="navigationButton">Admission</Link>
            <Link href="/" className="navigationButton">Campaign</Link>
          </nav>
        </header>
      <h1 className="page-title">Dynamic Home Page</h1>
      <section className="application-container">
         <p>Dynamic Home page</p>
      </section>
    </main>
    )
}