import { currentUser } from "@clerk/nextjs/server"
import { db } from "./prisma";

export const checkUser = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }


    try {
        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            }
        })

        if (loggedInUser) {
            return loggedInUser;
        }

        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) {
            throw new Error("Clerk user is missing an email address");
        }

        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        const name = fullName || user.username || email.split("@")[0];

        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                name,
                imageUrl: user.imageUrl,
                email,
                skills: [],
            },
        });

        return newUser;
    } catch (error) {
        console.error("Error creating or fetching user:", error.message);
        throw error;
    }
}
