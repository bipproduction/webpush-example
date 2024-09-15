import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { sub } = await req.json();
  const data = await prisma.subscription.delete({
    where: {
      id: sub.keys.auth
    }
  });
  return new Response(JSON.stringify({ data }));
}
