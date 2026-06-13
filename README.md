# ViralMind Gemini Backend

Backend seguro para conectar o ViralMind AI ao Gemini API sem expor sua chave no frontend/Base44.

## Como usar

### 1. Subir no GitHub
Crie um repositório no GitHub e envie estes arquivos.

### 2. Deploy na Vercel
- Acesse a Vercel
- Importe o repositório
- Faça o deploy

### 3. Configurar variável de ambiente na Vercel
Em Project Settings > Environment Variables, crie:

GEMINI_API_KEY=sua_chave_gemini

Depois faça redeploy.

### 4. Endpoint
Depois do deploy, seu endpoint será:

https://SEU-PROJETO.vercel.app/api/analyze

### 5. Body esperado

```json
{
  "videoUrl": "https://youtube.com/...",
  "title": "Título do vídeo",
  "transcription": "Transcrição completa do vídeo"
}
```

### 6. Resposta esperada

```json
{
  "summary": "...",
  "topics": [],
  "importantPoints": [],
  "hooks": [],
  "cuts": [],
  "keywords": [],
  "targetAudience": "...",
  "titles": [],
  "viralScore": 80,
  "retentionTips": [],
  "improvements": []
}
```
