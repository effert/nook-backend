import OpenAI from "openai"
import http from "http"
import { HttpsProxyAgent } from "https-proxy-agent"

const openai = new OpenAI({
  apiKey: "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",
  httpAgent: new HttpsProxyAgent("http://localhost:7890"),
})

async function main() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Say this is a test" }],
    model: "gpt-4-0314",
  })
  console.log(chatCompletion) // {id: "…", choices: […], …}
}

main()
