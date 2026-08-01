import { Inngest } from "inngest";


export const inngest = new Inngest({id:"Resume Builder ai",
    name:"Resume Builder ai",
    credentials:{
        gemini:{
            apikey:process.env.GEMINI_API_KEY,
        }
    }
})