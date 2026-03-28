import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function test() {
    try {
        console.log("Testing with API Key:", process.env.GEMINI_API_KEY);
        const result = await model.generateContent("Hello");
        console.log("Response:", result.response.text());
    } catch (e) {
        console.error("Error during test:", e);
    }
}

test();
