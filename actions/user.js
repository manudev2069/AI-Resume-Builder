"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getSafeIndustryInsights } from "./dashboard";
import { checkUser } from "@/lib/checkuser";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        user = await checkUser();
    }

    if (!user) throw new Error("User not found");


    try {
        let industryInsight = await db.industryInsight.findUnique({
            where: {
                industry: data.industry,
            },
        });

        if (!industryInsight) {
            const insights = await getSafeIndustryInsights(data.industry);

            industryInsight = await db.industryInsight.upsert({
                where: {
                    industry: data.industry,
                },
                update: {},
                create: {
                    industry: data.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });
        }

        const updatedUser = await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                industry: data.industry,
                experience: data.experience,
                bio: data.bio,
                skills: data.skills,
            },
        });

        const result = { updatedUser, industryInsight };

        // revalidatePath("/");
        return { success: true, ...result };

    } catch (error) {
        console.error("Error updating user and industry:", error.message)
        throw new Error("Failed to update profile");

    }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    try {
        let user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            },
        });

        if (!user) {
            user = await checkUser();
        }

        return {
            isOnboarded: !!user?.industry,
        };
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        throw new Error("Failed to check onboarding status");
    }
}
