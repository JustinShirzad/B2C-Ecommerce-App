import { ReactNode } from "react";
import { TopMenu } from "./TopMenu";
import { Sidebar } from "./Sidebar";
import { PrismaClient } from "@prisma/client";
import { Footer } from "./Footer";

const prisma = new PrismaClient();

async function getCategories() {
  const categoriesData = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
  });

  return categoriesData.map(item => item.category);
}

export async function AppLayout({ children }: { children: ReactNode }) {
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopMenu />
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-64 w-full">
              <Sidebar categories={categories} />
            </div>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}