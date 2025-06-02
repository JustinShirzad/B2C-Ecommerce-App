import { DetailedProduct } from "../../components/Products/DetailedProduct";
import { AppLayout } from "../../components/Layout/AppLayout";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const response = await fetch(new URL(`/api/products/${params.id}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'), {
    cache: "no-store",
  });
  const product = await response.json();

  return (
    <AppLayout>
      <DetailedProduct product={product}/>
    </AppLayout>
  );
}