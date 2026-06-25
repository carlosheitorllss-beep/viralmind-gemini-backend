export default async function handler(req, res) {
  // CORS para permitir chamadas do Base44
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    const { videoUrl, title, transcription } = req.body || {};

    if (!transcription || transcription.length < 20) {
      return res.status(400).json({
        error: "Transcrição inválida ou muito curta."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY não configurada no servidor."
      });
    }

    const prompt = `
Você é uma IA especialista em vídeos virais, retenção, YouTube Shorts, TikTok e Instagram Reels.

Analise completamente o vídeo abaixo e retorne APENAS um JSON válido, sem markdown, sem explicações fora do JSON.

Dados do vídeo:
Título: ${title || "Não informado"}
URL: ${videoUrl || "Não informada"}

Transcrição:
${transcription}

Formato obrigatório de resposta:
{
  "summary": "resumo geral do vídeo",
  "topics": ["tema 1", "tema 2", "tema 3"],
  "importantPoints": ["ponto importante 1", "ponto importante 2"],
  "hooks": ["hook forte 1", "hook forte 2"],
  "cuts": [
    {
      "title": "nome do corte",
      "reason": "por que esse trecho pode viralizar"
    }
  ],
  "keywords": ["palavra-chave 1", "palavra-chave 2"],
  "targetAudience": "público-alvo provável",
  "titles": ["título viral 1", "título viral 2", "título viral 3"],
  "viralScore": 0,
  "retentionTips": ["dica de retenção 1", "dica de retenção 2"],
  "improvements": ["melhoria 1", "melhoria 2"]
}

A nota viralScore deve ser um número de 0 a 100.
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return res.status(500).json({
        error: "Erro ao chamar Gemini API.",
        details: errorText
      });
    }

    const geminiData = await geminiResponse.json();
    const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini não retornou texto válido."
      });
    }

    let cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      parsed = {
        summary: cleanText,
        topics: [],
        importantPoints: [],
        hooks: [],
        cuts: [],
        keywords: [],
        targetAudience: "Não identificado",
        titles: [],
        viralScore: 0,
        retentionTips: [],
        improvements: []
      };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: "Erro interno ao analisar vídeo.",
      details: error.message
    });
  }
}
