export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.error("==================== [CLIENT ERROR REPORTED] ====================");
    console.error("Message:", data.message);
    console.error("Name:", data.name);
    console.error("Filename:", data.filename, "Line:", data.lineno, "Col:", data.colno);
    console.error("Stack trace:\n", data.stack);
    console.error("=================================================================");
  } catch (err) {
    console.error("Failed to parse client error report:", err);
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
