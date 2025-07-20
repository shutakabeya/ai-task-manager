import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input is required and must be a string' },
        { status: 400 }
      )
    }

    const prompt = `
以下の自然文を読んで、実行可能な粒度の「やるべきタスク」を抽出し、titleのみをJSONで返してください。

【制約】
- 各タスクは30分〜2時間程度で実行できる作業にしてください。
- 曖昧な表現（例：準備する、対応するなど）は避けてください。
- 出力形式は以下のようにしてください：

{
  "subtasks": [
    { "title": "構成案を作成する" },
    { "title": "原稿を執筆する" }
  ]
}

【自然文】
${input}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 500,
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    // JSON部分を抽出
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      )
    }

    const parsedResponse = JSON.parse(jsonMatch[0])

    if (!parsedResponse.subtasks || !Array.isArray(parsedResponse.subtasks)) {
      return NextResponse.json(
        { error: 'Invalid response structure' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('GPT Tasks API Error:', error)
    return NextResponse.json(
      { error: 'AIの処理に失敗しました' },
      { status: 500 }
    )
  }
} 