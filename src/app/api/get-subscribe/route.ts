import prisma from "@/lib/prisma";

export async function GET() {
  const sub = await prisma.subscription.findMany();
  return new Response(JSON.stringify({ data: sub }));
}
