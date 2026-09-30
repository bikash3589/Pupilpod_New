import ActionButtons from "@/components/ActionButtons";
import SearchBar from "@/components/SearchBar";
import PageLayout from "@/components/PageLayout";
import styles from "./page.module.css"
import Link from "next/Link"
import CampaignTable from "./AddCampaign/components/CampaignTable"
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const searchText = search ?? "";

  return (
    <main className="page">
      <h1 className="page-title">Application List</h1>
      <section className="application-container">
         <div className={styles.toolbar}>
            <div>
              <SearchBar initialSearch={searchText} />
            </div>
            <div>
              <ActionButtons/>
            </div>
          </div>
           <CampaignTable searchText={searchText} />
      </section>
    </main>
  );
}