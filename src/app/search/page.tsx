import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";

export default async function Page({
    searchParams
}: {
    searchParams: { q: string }
}) {
    const query = searchParams.q || "";
    const response = await fetch(
        new URL(
            `/api/search?q=${encodeURIComponent(query)}`, process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        ),
        { cache: "no-store" }
    );

    const products = await response.json();

    return (
        <AppLayout>
            <Main product={products} />
        </AppLayout>
    );
}