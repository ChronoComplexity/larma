import { NextResponse } from "next/server";

export const runtime = "edge";

const PATHWAY_ID = "f02dfb48-3222-478f-8fce-7d5ece71a9cf";

export async function POST(request: Request) {
  try {
    const { phoneNumber, startTime } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // 1. Initialise the request body with only required fields
    const requestBody: any = {
      phone_number: phoneNumber,
      pathway_id: PATHWAY_ID,
    };

    // 2. Only add start_time if it exists.
    // If this key is missing, Bland AI defaults to an instant call.
    if (startTime) {
      requestBody.start_time = startTime;
    }

    // 3. Trigger the Bland AI call
    const response = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        Authorization: process.env.BLAND_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Bland AI Error" },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      callId: data.call_id,
      mode: startTime ? "Scheduled" : "Instant",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
