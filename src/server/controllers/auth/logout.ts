import { response } from "@/server/utils/responseHandler"
import { cookies } from "next/headers"

export const logout = async () => {
    try {
    const cookieStore = await cookies()
    cookieStore.delete('auth_token')
     
     return response(200, "Logged out successfully")
    } catch(err) {
        console.error("Logout error:", err);

        return response(500, "Error occurred while logging out");
    }
}