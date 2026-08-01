"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertTriangle,
    CheckCircle2,
    Download,
    Edit,
    LayoutTemplate,
    Loader2,
    Monitor,
    Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import EntryForm from "./entry-form";
import html2pdf from "html2pdf.js";

const resumeStyles = [
    {
        id: "classic",
        name: "Classic",
        description: "Formal, ATS-friendly, and easy to scan.",
    },
    {
        id: "modern",
        name: "Modern",
        description: "Clean accent line for tech and product roles.",
    },
    {
        id: "compact",
        name: "Compact",
        description: "Fits more experience into fewer pages.",
    },
    {
        id: "executive",
        name: "Executive",
        description: "Polished layout for senior profiles.",
    },
    {
        id: "editorial",
        name: "Editorial",
        description: "Sharp magazine-style headings for creative roles.",
    },
    {
        id: "timeline",
        name: "Timeline",
        description: "A guided career story with clear section markers.",
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Quiet, refined, and recruiter-friendly.",
    },
    {
        id: "portfolio",
        name: "Portfolio",
        description: "Project-forward style for makers and designers.",
    },
];

const starterTemplates = [
    {
        id: "software",
        name: "Software Engineer",
        description: "Projects, impact, and technical depth.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | LinkedIn: https://linkedin.com/in/your-profile | GitHub: https://github.com/your-handle

</div>

## Professional Summary

Software engineer with experience building reliable web applications, improving performance, and collaborating across product and design teams. Strong in JavaScript, React, Node.js, and database-backed systems.

## Skills

JavaScript, React, Next.js, Node.js, PostgreSQL, Prisma, REST APIs, Git, Testing, UI Performance

## Work Experience

### Software Engineer - Company Name
Jan 2023 - Present

- Built customer-facing features used by 10,000+ monthly users.
- Improved page load performance by 35% through bundle and query optimization.
- Partnered with designers and product managers to ship accessible workflows.

## Projects

### Resume Builder Platform
Jan 2024 - Mar 2024

- Created a resume editor with markdown preview, PDF export, and saved drafts.
- Integrated authentication, database storage, and AI-assisted writing tools.

## Education

### Degree Name - University Name
Aug 2019 - May 2023

- Relevant coursework: Data Structures, Databases, Web Engineering`,
    },
    {
        id: "fresher",
        name: "Fresher",
        description: "Simple structure for students and first jobs.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | Portfolio: https://your-site.com

</div>

## Career Objective

Motivated graduate seeking an entry-level role where I can apply problem-solving, communication, and technical skills while learning from experienced teams.

## Skills

Communication, Teamwork, JavaScript, HTML, CSS, React, SQL, MS Excel, Research

## Projects

### Academic Project Name
Jan 2024 - Apr 2024

- Built a working project prototype to solve a real user problem.
- Presented project outcomes and documentation to faculty reviewers.

## Internship Experience

### Intern - Company Name
Jun 2023 - Aug 2023

- Assisted with daily team operations and prepared weekly progress reports.
- Learned industry workflows and contributed to assigned project tasks.

## Education

### Degree Name - College Name
Aug 2020 - May 2024

- CGPA/Percentage: Add your score
- Activities: Add clubs, events, or leadership work`,
    },
    {
        id: "business",
        name: "Business Analyst",
        description: "Metrics, stakeholders, and process wins.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | LinkedIn: https://linkedin.com/in/your-profile

</div>

## Professional Summary

Business analyst experienced in gathering requirements, improving processes, and turning data into clear recommendations. Comfortable working with stakeholders, dashboards, documentation, and delivery teams.

## Skills

Requirement Gathering, SQL, Excel, Power BI, Documentation, Process Mapping, Stakeholder Management, Agile

## Work Experience

### Business Analyst - Company Name
Jan 2022 - Present

- Documented business requirements for cross-functional product releases.
- Reduced manual reporting time by 40% through dashboard automation.
- Coordinated with engineering, sales, and operations teams to clarify scope.

## Projects

### Sales Dashboard Revamp
Mar 2023 - Jun 2023

- Consolidated multiple reports into one executive dashboard.
- Improved data visibility for weekly leadership reviews.

## Education

### Degree Name - University Name
Aug 2018 - May 2022`,
    },
    {
        id: "data",
        name: "Data Analyst",
        description: "Dashboards, SQL, and measurable insights.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | LinkedIn: https://linkedin.com/in/your-profile | Portfolio: https://your-site.com

</div>

## Professional Summary

Data analyst with experience cleaning data, building dashboards, and explaining trends to business teams. Skilled at SQL, spreadsheet modeling, visualization, and turning raw data into practical recommendations.

## Skills

SQL, Excel, Power BI, Tableau, Python, Data Cleaning, Dashboard Design, KPI Reporting, Statistics

## Work Experience

### Data Analyst - Company Name
Jan 2023 - Present

- Built recurring dashboards used by leadership to track revenue, retention, and operations metrics.
- Improved report accuracy by standardizing source data and validation checks.
- Presented monthly insights that helped teams prioritize high-impact customer segments.

## Projects

### Customer Retention Analysis
Apr 2024 - Jun 2024

- Analyzed churn patterns across customer cohorts and product usage.
- Recommended actions that targeted the highest-risk user groups.

## Education

### Degree Name - University Name
Aug 2019 - May 2023`,
    },
    {
        id: "marketing",
        name: "Digital Marketing",
        description: "Campaigns, content, and growth metrics.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | LinkedIn: https://linkedin.com/in/your-profile

</div>

## Professional Summary

Digital marketer with experience planning campaigns, improving conversion rates, and creating content across social, search, and email channels. Strong focus on analytics, audience research, and brand consistency.

## Skills

SEO, Google Ads, Meta Ads, Email Marketing, Content Strategy, Google Analytics, Copywriting, A/B Testing, Canva

## Work Experience

### Digital Marketing Executive - Company Name
Feb 2022 - Present

- Managed multi-channel campaigns that increased qualified leads by 28%.
- Improved landing page conversion through copy tests and audience segmentation.
- Coordinated weekly content calendars for social, blog, and email campaigns.

## Projects

### Product Launch Campaign
Aug 2023 - Oct 2023

- Planned launch messaging, paid ads, email sequence, and performance dashboard.
- Delivered a campaign report with lessons for future launches.

## Education

### Degree Name - University Name
Aug 2018 - May 2022`,
    },
    {
        id: "project-manager",
        name: "Project Manager",
        description: "Delivery, teams, and stakeholder clarity.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | LinkedIn: https://linkedin.com/in/your-profile

</div>

## Professional Summary

Project manager experienced in coordinating teams, tracking delivery risks, and keeping stakeholders aligned. Strong in planning, communication, sprint ceremonies, documentation, and delivery reporting.

## Skills

Agile, Scrum, Jira, Risk Management, Stakeholder Communication, Roadmaps, Budget Tracking, Team Coordination

## Work Experience

### Project Manager - Company Name
Jan 2021 - Present

- Led cross-functional projects from discovery through launch.
- Reduced delivery delays by improving sprint planning and risk tracking.
- Prepared status reports and decision notes for leadership reviews.

## Projects

### Operations Workflow Redesign
May 2023 - Sep 2023

- Coordinated process mapping, timeline planning, and rollout communication.
- Improved handoff clarity between operations, support, and product teams.

## Education

### Degree Name - University Name
Aug 2017 - May 2021`,
    },
    {
        id: "teacher",
        name: "Teacher",
        description: "Classroom impact, curriculum, and learning outcomes.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | City, Country

</div>

## Professional Summary

Dedicated educator with experience planning lessons, supporting student growth, and creating inclusive classroom environments. Skilled in curriculum design, assessment, parent communication, and classroom management.

## Skills

Lesson Planning, Classroom Management, Assessment Design, Student Engagement, Curriculum Development, Communication

## Work Experience

### Teacher - School Name
Jun 2021 - Present

- Designed lesson plans aligned with curriculum goals and student learning needs.
- Used assessments and feedback to improve student understanding.
- Communicated progress with parents and collaborated with faculty members.

## Achievements

- Add awards, certifications, school initiatives, or student performance improvements.

## Education

### Degree or Certification - Institution Name
Aug 2017 - May 2021`,
    },
    {
        id: "healthcare",
        name: "Healthcare Professional",
        description: "Patient care, compliance, and clinical strengths.",
        content: `## <div align="center">Your Name</div>

<div align="center">

Email: you@example.com | Phone: +1 234 567 8900 | License/Certification: Add details

</div>

## Professional Summary

Healthcare professional focused on safe patient care, accurate documentation, and compassionate support. Experienced in clinical coordination, patient communication, and working with multidisciplinary teams.

## Skills

Patient Care, Clinical Documentation, Care Coordination, Communication, Safety Protocols, Electronic Health Records

## Work Experience

### Healthcare Role - Hospital or Clinic Name
Jan 2022 - Present

- Supported patient care plans while following safety and documentation standards.
- Coordinated with doctors, nurses, and support staff to improve patient experience.
- Maintained accurate records and helped patients understand next steps.

## Certifications

- Add licenses, training, or continuing education.

## Education

### Degree Name - Institution Name
Aug 2018 - May 2022`,
    },
];

const ResumeBuilder = ({ initialContent }) => {
    const [activeTab, setActiveTab] = useState("edit");
    const [previewContent, setPreviewContent] = useState(initialContent || "");
    const { user } = useUser();
    const [resumeMode, setResumeMode] = useState("preview");
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState("classic");

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },
    });

    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError,
    } = useFetch(saveResume);

    const formValues = watch();

    useEffect(() => {
        if (initialContent) setActiveTab("preview");
    }, [initialContent]);

    useEffect(() => {
        const savedStyle = window.localStorage.getItem("resume-style");
        if (savedStyle && resumeStyles.some((style) => style.id === savedStyle)) {
            setSelectedStyle(savedStyle);
        }
    }, []);

    useEffect(() => {
        window.localStorage.setItem("resume-style", selectedStyle);
    }, [selectedStyle]);

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent || initialContent || "");
        }
    }, [formValues, activeTab, initialContent]);

    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully!");
        }
        if (saveError) {
            toast.error(saveError.message || "Failed to save resume");
        }
    }, [saveResult, saveError, isSaving]);

    const getContactMarkdown = () => {
        const { contactInfo = {} } = formValues;
        const parts = [];
        const displayName = user?.fullName || "Your Name";

        if (contactInfo.email) parts.push(`Email: ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`Phone: ${contactInfo.mobile}`);
        if (contactInfo.linkedin) parts.push(`[LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.twitter) parts.push(`[Twitter/X](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${displayName}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
            : "";
    };

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;
        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    };

    const applyStarterTemplate = (template) => {
        setPreviewContent(template.content);
        setActiveTab("preview");
        setResumeMode("edit");
        toast.success(`${template.name} resume loaded. Edit the markdown and save when ready.`);
    };

    const generatePDF = async () => {
        setIsGenerating(true);
        try {
            const element = document.getElementById("resume-pdf");
            const opt = {
                margin: [8, 8],
                filename: "resume.pdf",
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const onSubmit = async () => {
        try {
            const formattedContent = (previewContent || "")
                .replace(/\n/g, "\n")
                .replace(/\n\s*\n/g, "\n\n")
                .trim();

            await saveResumeFn(formattedContent);
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div data-color-mode="light" className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="font-bold gradient-title text-5xl md:text-6xl">
                        Resume Builder
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Pick a style, load a starter resume, then edit every word.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <LayoutTemplate className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Resume Style</h2>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    {resumeStyles.map((style) => {
                        const isSelected = selectedStyle === style.id;
                        return (
                            <button
                                key={style.id}
                                type="button"
                                onClick={() => setSelectedStyle(style.id)}
                                className={`rounded-lg border p-4 text-left transition-colors ${isSelected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "bg-card hover:bg-muted"
                                    }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-semibold">{style.name}</span>
                                    {isSelected && <CheckCircle2 className="h-4 w-4" />}
                                </div>
                                <p className="text-sm opacity-80">{style.description}</p>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Starter Resumes</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {starterTemplates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => applyStarterTemplate(template)}
                            className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted"
                        >
                            <span className="font-semibold">{template.name}</span>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {template.description}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                            <div className="grid grid-cols-1 gap-4 rounded-lg border bg-muted/50 p-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/your-profile"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Twitter/X Profile</label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/your-handle"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Professional Summary</h3>
                            <Controller
                                name="summary"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="Write a compelling professional summary..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Skills</h3>
                            <Controller
                                name="skills"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-sm text-red-500">{errors.skills.message}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <Controller
                                name="experience"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Experience"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-sm text-red-500">
                                    {errors.experience.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
                            <Controller
                                name="education"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Education"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-500">
                                    {errors.education.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <Controller
                                name="projects"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Project"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-sm text-red-500">
                                    {errors.projects.message}
                                </p>
                            )}
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="preview">
                    <Button
                        variant="link"
                        type="button"
                        className="mb-2"
                        onClick={() =>
                            setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                        }
                    >
                        {resumeMode === "preview" ? (
                            <>
                                <Edit className="h-4 w-4" />
                                Edit Markdown
                            </>
                        ) : (
                            <>
                                <Monitor className="h-4 w-4" />
                                Show Styled Preview
                            </>
                        )}
                    </Button>

                    {resumeMode !== "preview" && (
                        <div className="mb-2 flex items-center gap-2 rounded border-2 border-yellow-600 p-3 text-yellow-600">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                Updating the form will replace manual markdown edits.
                            </span>
                        </div>
                    )}

                    {resumeMode === "preview" ? (
                        <div className="overflow-hidden rounded-lg border bg-white">
                            <div className={`resume-preview resume-preview-${selectedStyle}`}>
                                <MDEditor.Markdown source={previewContent || ""} />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-lg border">
                            <MDEditor
                                value={previewContent || ""}
                                onChange={(value) => setPreviewContent(value || "")}
                                height={680}
                                preview="edit"
                            />
                        </div>
                    )}

                    <div className="hidden">
                        <div id="resume-pdf" className={`resume-preview resume-preview-${selectedStyle}`}>
                            <MDEditor.Markdown source={previewContent || ""} />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ResumeBuilder;
