import { cookies } from "next/headers";

export async function isLoggedIn() {
  const userCookies = await cookies();
  const token = userCookies.get("user-id")?.value;
  
  return token;
}