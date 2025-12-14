import dotenv from "dotenv";
import OpenAI from "openai";

// VERY IMPORTANT
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
