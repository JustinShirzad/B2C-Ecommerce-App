import { Main } from "./components/Main";
import { AppLayout } from "./components/Layout/AppLayout";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'desc'
    },
  });

  return (
    <AppLayout>
      <Main product={products}/>
    </AppLayout>
  );
}