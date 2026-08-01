"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUser } from "@/lib/checkuser";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
})

const toArray = (value, fallback) => {
    if (Array.isArray(value) && value.length) return value;
    return fallback;
};

const toEnumValue = (value, allowed, fallback) => {
    const normalized = String(value || "").toUpperCase();
    return allowed.includes(normalized) ? normalized : fallback;
};

const toNumber = (value, fallback) => {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
};

const getFallbackIndustryInsights = (industry = "your industry") => ({
    salaryRanges: [
        { role: "Entry Level Professional", min: 300000, max: 600000, median: 450000, location: "India" },
        { role: "Mid Level Professional", min: 700000, max: 1400000, median: 1000000, location: "India" },
        { role: "Senior Professional", min: 1500000, max: 2800000, median: 2100000, location: "India" },
        { role: "Team Lead", min: 1800000, max: 3500000, median: 2600000, location: "India" },
        { role: "Manager", min: 2200000, max: 4500000, median: 3200000, location: "India" },
    ],
    growthRate: 8,
    demandLevel: "MEDIUM",
    topSkills: ["Communication", "Problem Solving", "Digital Tools", "Teamwork", "Domain Knowledge"],
    marketOutlook: "POSITIVE",
    keyTrends: [
        `Growing demand for skilled ${industry} professionals`,
        "More companies using AI and automation in daily work",
        "Higher focus on measurable business impact",
        "Remote and hybrid collaboration becoming common",
        "Continuous upskilling becoming important for career growth",
    ],
    recommendedSkills: ["Data Literacy", "AI Tools", "Project Management", "Communication", "Industry Research"],
});

const normalizeInsights = (insights, industry) => {
    const fallback = getFallbackIndustryInsights(industry);

    return {
        salaryRanges: toArray(insights?.salaryRanges, fallback.salaryRanges).map((range, index) => ({
            role: range?.role || fallback.salaryRanges[index % fallback.salaryRanges.length].role,
            min: toNumber(range?.min, fallback.salaryRanges[index % fallback.salaryRanges.length].min),
            max: toNumber(range?.max, fallback.salaryRanges[index % fallback.salaryRanges.length].max),
            median: toNumber(range?.median, fallback.salaryRanges[index % fallback.salaryRanges.length].median),
            location: range?.location || "India",
        })),
        growthRate: toNumber(insights?.growthRate, fallback.growthRate),
        demandLevel: toEnumValue(insights?.demandLevel, ["HIGH", "MEDIUM", "LOW"], fallback.demandLevel),
        topSkills: toArray(insights?.topSkills, fallback.topSkills),
        marketOutlook: toEnumValue(insights?.marketOutlook, ["POSITIVE", "NEUTRAL", "NEGATIVE"], fallback.marketOutlook),
        keyTrends: toArray(insights?.keyTrends, fallback.keyTrends),
        recommendedSkills: toArray(insights?.recommendedSkills, fallback.recommendedSkills),
    };
};

export const generateAIInsights = async (industry) => {
    const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "HIGH" | "MEDIUM" | "LOW",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return normalizeInsights(JSON.parse(cleanedText), industry);
};

export const getSafeIndustryInsights = async (industry) => {
    try {
        return await generateAIInsights(industry);
    } catch (error) {
        console.error("Falling back to default industry insights:", error.message);
        return getFallbackIndustryInsights(industry);
    }
};


export async function getIndustryInsights() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let user = await db.user.findUnique({
        where: { clerkUserId: userId },
        include: {
            industryInsight: true,
        },
    });

    if (!user) {
        const ensuredUser = await checkUser();
        if (ensuredUser) {
            user = await db.user.findUnique({
                where: { clerkUserId: userId },
                include: {
                    industryInsight: true,
                },
            });
        }
    }

    if (!user) throw new Error("User not found");



    if (!user.industryInsight) {
        const insights = await getSafeIndustryInsights(user.industry || "tech-software-development");

        const industryInsight = await db.industryInsight.upsert({
            where: { industry: user.industry || "tech-software-development" },
            update: {
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
            create: {
                industry: user.industry || "tech-software-development",
                ...insights,
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        return industryInsight;



    }

    return user.industryInsight;
}
