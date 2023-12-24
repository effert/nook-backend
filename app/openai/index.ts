import OpenAI from "openai"
import { HttpsProxyAgent } from "https-proxy-agent"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  httpAgent: new HttpsProxyAgent(process.env.PROXY_URL!),
})

export default async function main(content) {
  const stream = await openai.beta.chat.completions.stream({
    model: "gpt-3.5-turbo-0613",
    // model: "gpt-4-1106-preview",
    messages: [{ role: "user", content }],
    stream: true,
  })

  // for await (const chunk of stream) {
  //   console.log(chunk.choices[0].delta.content);
  // }

  const chatCompletion = await stream.finalChatCompletion()
  return chatCompletion.choices[0].message.content
}
