import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  tools: [
    {
      codeExecution: {},
    },
  ],
});



export async function POST(req) {
  try {
    /**
     * Get the prompt from the request body.
     */
    const data = await req.json();
    const prompt = data.text || "Explain how AI works";

    // Check if GEMINI_KEY is available
    if (!process.env.GEMINI_KEY) {
      return NextResponse.json(
        { error: "GEMINI_KEY not configured" },
        { status: 500 }
      );
    }

    const result = await model.generateContent(prompt);

    return NextResponse.json({
      summary: result.response.text(),
    });

  } catch (error) {
    console.error("Chatbot API Error:", error);
    
    // Handle specific SSL/TLS errors
    if (error.code === 'EPROTO' || error.message.includes('SSL')) {
      return NextResponse.json(
        { error: "SSL/TLS connection error. Please check your network configuration." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

