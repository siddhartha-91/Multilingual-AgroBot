export async function POST(req: Request) {
  const { message } = await req.json();
  return Response.json({
    reply: `Mock reply from KissanAI: "${message}" processed.`
  });
}
