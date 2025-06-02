import { Fragment } from "react";
import { TopMenu } from "../components/Layout/TopMenu";
import { LoginForm } from "../components/User/LoginForm";
import { isLoggedIn } from "@/lib/auth";
import { LogoutButton } from "../components/User/LogoutButton";
import { OrderList } from "../components/User/OrderList";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function Page() {
    const loggedIn = await isLoggedIn();

    // Move OrderList and LogoutButton and to a separate component and use orders API route
    if (loggedIn) {
        const userId = (await cookies()).get('user-id')?.value;

        if (!userId) {
            console.error("User ID not found in cookies despite isLoggedIn returning true");
            return (
                <Fragment>
                    <TopMenu />
                    <p>Something went wrong.</p>
                </Fragment>
            );
        }

        const orders = await prisma.order.findMany({
            where: {
                userId: userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return (
            <Fragment>
                <TopMenu />
                <div className="mt-12 pt-8 max-w-md mx-auto px-4">
                    <OrderList orders={orders} />
                    <LogoutButton />
                </div>
            </Fragment>
        );
    }

    if (!loggedIn) {
        return (
            <Fragment>
                <TopMenu />
                <div className="mt-12 pt-8 max-w-md mx-auto px-4">
                    <LoginForm />
                </div>
            </Fragment>
        );
    }
}