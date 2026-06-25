export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { videoUrl, title } = req.body || {};

    if (!videoUrl) {
      return res.status(400).json({ error: "URL do vídeo obrigatória" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY não configurada" });
    }

    // Placeholder: integração de transcrição será adicionada aqui.
    // O endpoint agora aceita somente o link e prepara a análise automática.
    const transcription = `Analise este vídeo do YouTube: ${videoUrl}`;

    const prompt = `
Você é especialista em vídeos virais.
Analise o conteúdo abaixo e responda somente em JSON.

Título: ${title || "Não informado"}
Conteúdo:
${transcription}

Formato:
{
"summary":"",
"topics":[],
"importantPoints":[],
"hooks":[],
"cuts":[],
"keywords":[],
"targetAudience":"",
"titles":[],
"viralScore":0,
"retentionTips":[],
"improvements":[]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: "Gemini sem resposta", details: data });
    }

    const clean = text.replace(/```json|```/g, "").trim();

    return res.status(200).json(JSON.parse(clean));

  } catch (error) {
    return res.status(500).json({
      error: "Erro na análise",
      details: error.message
    });
  }
}
