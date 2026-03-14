const BLAND_AI_KEY = process.env.BLAND_API_KEY;

if (!BLAND_AI_KEY) {
  throw new Error("Missing BLAND_API_KEY in environment variables");
}

type BlandResponse = {
  status: "success" | "error";
  call_id: string;
};

// sendPhoneCall("+12223334444", "pathway uid");
async function sendPhoneCall(phoneNumber: string, pathwayId: string) {
  const response = await fetch("https://api.bland.ai/v1/calls", {
    method: "POST",
    headers: {
      Authorization: BLAND_AI_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      pathway_id: pathwayId,
    }),
  });

  const data = (await response.json()) as BlandResponse;

  if (data.status === "success") {
    console.log(`Call initiated! ID: ${data.call_id}`);
  } else {
    console.error("Call failed to queue.");
  }

  return data;
}
