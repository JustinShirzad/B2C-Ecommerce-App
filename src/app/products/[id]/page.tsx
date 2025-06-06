import { DetailedProduct } from "../../components/Products/DetailedProduct";
import { AppLayout } from "../../components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params; 

  const product = await prisma.product.findUnique({
    where: {
      id: resolvedParams.id,  // ← Changed from params.id to resolvedParams.id
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <AppLayout>
      <DetailedProduct product={product} />
    </AppLayout>
  );
}