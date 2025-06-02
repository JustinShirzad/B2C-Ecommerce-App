import { Fragment } from "react";
import { TopMenu } from "../../components/Layout/TopMenu";
import { RegistrationForm } from "../../components/User/RegistrationForm";
import { isLoggedIn } from "@/lib/auth";

export default async function Page() {
    const loggedIn = await isLoggedIn();

    // Change this later to show user account info and previous orders
    if (loggedIn) {
        return (
            <Fragment>
                <TopMenu />
                <div className="mt-12 pt-8 max-w-md mx-auto px-4">
                    <p>You are already logged in...</p>
                </div>
            </Fragment>
        );
    }

    if (!loggedIn) {
        return (
            <Fragment>
                <TopMenu />
                <div className="mt-12 pt-8 max-w-md mx-auto px-4">
                    <RegistrationForm />
                </div>
            </Fragment>
        );
    }
}