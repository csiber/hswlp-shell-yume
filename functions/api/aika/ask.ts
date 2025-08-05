export const onRequestPost = async (ctx: any) => {
  const { request } = ctx;
  try {
    const { message, persona, systemPrompt, user_id, memoryContext, stream } = await request.json();

    const promptParts: string[] = [systemPrompt];
    if (memoryContext) {
      promptParts.push(`Also, the user previously mentioned: ${memoryContext}.`);
    }
    promptParts.push(message);
    const finalPrompt = promptParts.join("\n");

    // Example proxy call to the upstream AI service
    const body = {
      message: finalPrompt,
      persona,
      systemPrompt,
      user_id,
      memoryContext,
      stream,
    };

    const resp = await fetch("https://api.aikahub.example/api/aika/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: resp.headers,
    });
  } catch (err: any) {
    return new Response(err.message || "Invalid request", { status: 400 });
  }
};

