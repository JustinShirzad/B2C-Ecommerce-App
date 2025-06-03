import { CartList } from "../components/Cart/CartList";
import { Fragment } from "react";
import { TopMenu } from "../components/Layout/TopMenu";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function Page() {
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
        return redirect("/account");
    }

    const userId = (await cookies()).get('user-id')?.value;

    if (!userId) {
        console.error("User ID not found in cookies despite isLoggedIn returning true");
        return redirect("/account");
    }

    // Get the user's cart with all items and related product details
    const cart = await prisma.cart.findUnique({
        where: {
            userId: userId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    });

    // If cart doesn't exist, create an empty one
    if (!cart) {
        try {
            await prisma.cart.create({
                data: {
                    userId: userId,
                },
            });
        } catch (error) {
            console.error("Failed to create cart:", error);
            return (
                <Fragment>
                    <TopMenu />
                    <div className="mt-12 pt-8 max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-2xl font-bold mb-6">Error</h1>
                        <p className="text-red-600">There was a problem accessing your cart. Please try again later.</p>
                        <div className="mt-4">
                            <a href="/" className="text-blue-600 hover:underline">Return to homepage</a>
                        </div>
                    </div>
                </Fragment>
            );
        }

        // Return empty cart view with centered content
        return (
            <Fragment>
                <TopMenu />
                <div className="mt-12 pt-8 max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
                    <p className="text-gray-600">Your cart is empty.</p>
                    <div className="mt-4">
                        <a href="/" className="text-blue-600 hover:underline">Continue shopping</a>
                    </div>
                </div>
            </Fragment>
        );
    }

    // Calculate cart total
    const cartTotal = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);

    return (
        <Fragment>
            <TopMenu />
            <div className="mt-12 pt-8 max-w-6xl mx-auto px-4">
                <h1 className="text-2xl font-bold mb-6 text-center">Your Cart</h1>
                <div className="w-full">
                    <CartList cart={cart} cartTotal={cartTotal} />
                </div>
            </div>
        </Fragment>
    );
}