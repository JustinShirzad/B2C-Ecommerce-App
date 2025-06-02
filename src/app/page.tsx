import { Main } from "./components/Main";
import { AppLayout } from "./components/Layout/AppLayout";

export default async function Page() {
  const response = await fetch(new URL('/api/products', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
    cache: "no-store",
  });
  const product = await response.json();

  return (
    <AppLayout>
      <Main product={product}/>
    </AppLayout>
  );
}