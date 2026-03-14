import { NextResponse } from "next/server";

export const runtime = "edge";

const PATHWAY_ID = "f02dfb48-3222-478f-8fce-7d5ece71a9cf";

export async function POST(request: Request) {
  try {
    // 1. Extract the phoneNumber directly from the request body
    // Added startTime extraction here
    const { phoneNumber, startTime } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Default to 'now' if no startTime is provided by the user
    const callTime = startTime || new Date().toISOString();

    // 2. Trigger Bland AI using the number passed in
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: process.env.BLAND_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        pathway_id: PATHWAY_ID,
        start_time: callTime,
      }),
    });

    const data = await response.json();

    // Handle Bland AI specific errors (e.g. invalid number format)
    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Bland AI Error" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      callId: data.call_id,
      scheduledAt: callTime,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
