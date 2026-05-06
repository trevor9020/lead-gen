import { runAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();
  const { businessName, city } = body;

  if (!businessName || !city) {
    return Response.json(
      { error: "businessName and city are required" },
      { status: 400 }
    );
  }

  const result = await runAudit(businessName.trim(), city.trim());
  return Response.json(result);
}
