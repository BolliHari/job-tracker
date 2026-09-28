const fs = require('fs')
const path = require('path')
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters')
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require('@langchain/google-genai')
const { ChatPromptTemplate } = require('@langchain/core/prompts')
const { StringOutputParser } = require('@langchain/core/output_parsers')
const { isRetryableError, toUserFacingGeminiError } = require('../utils/geminiErrors')

const KNOWLEDGE_PATH = path.join(__dirname, '../knowledge/job_tracker.txt')
const EMBEDDING_MODELS = ['gemini-embedding-001', 'text-embedding-004', 'embedding-001']
const CHAT_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash']

let storePromise = null

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'your_google_ai_key_here') {
    throw new Error('Gemini API key is not configured. Set GEMINI_API_KEY in backend/.env')
  }
  return apiKey
}

function cosine(left, right) {
  let dot = 0
  let leftNorm = 0
  let rightNorm = 0
  const length = Math.min(left.length, right.length)
  for (let i = 0; i < length; i += 1) {
    dot += left[i] * right[i]
    leftNorm += left[i] * left[i]
    rightNorm += right[i] * right[i]
  }
  const denom = Math.sqrt(leftNorm) * Math.sqrt(rightNorm)
  return denom === 0 ? 0 : dot / denom
}

function chatModelCandidates() {
  const preferred = process.env.GEMINI_MODEL?.trim()
  return [...new Set(preferred ? [preferred, ...CHAT_MODELS] : CHAT_MODELS)]
}

async function buildStore() {
  const apiKey = getApiKey()
  const raw = fs.readFileSync(KNOWLEDGE_PATH, 'utf8')
  // Overlap keeps a sentence that lands on a chunk boundary in both neighbors.
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 80,
  })
  const docs = await splitter.createDocuments([raw])
  const texts = docs.map((doc) => doc.pageContent)

  let lastError = null
  for (const model of EMBEDDING_MODELS) {
    try {
      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model,
        stripNewLines: false,
      })
      const vectors = await embeddings.embedDocuments(texts)
      console.log(`RAG index ready: ${docs.length} chunks (${model})`)
      return { docs, vectors, embeddings }
    } catch (error) {
      lastError = error
      if (!isRetryableError(error)) throw toUserFacingGeminiError(error)
    }
  }

  throw toUserFacingGeminiError(lastError || new Error('Could not embed the product guide'))
}

function getStore() {
  if (!storePromise) {
    storePromise = buildStore().catch((error) => {
      storePromise = null
      throw error
    })
  }
  return storePromise
}

function formatHistory(history) {
  const lines = history.slice(-6).map((turn) => {
    const speaker = turn.role === 'user' ? 'Visitor' : 'Assistant'
    return `${speaker}: ${turn.content}`
  })
  return lines.length ? lines.join('\n') : '(none)'
}

async function retrieve(store, question) {
  const queryVector = await store.embeddings.embedQuery(question)
  return store.docs
    .map((doc, index) => ({
      content: doc.pageContent,
      score: cosine(queryVector, store.vectors[index]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.content)
    .join('\n\n')
}

async function answerQuestion(question, history) {
  const apiKey = getApiKey()
  const store = await getStore()
  const context = await retrieve(store, question)
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      'You are the Job Tracker homepage assistant. '
        + 'Answer only from the context below. '
        + 'If the answer is not in the context, reply exactly: '
        + "I don't know that yet. Try the Features section, or sign in and explore the app.\n\n"
        + 'Be concise and practical. Write plain sentences with no markdown. '
        + 'Do not invent features, prices, or policies.\n\n'
        + 'Context:\n{context}\n\n'
        + 'Recent conversation:\n{history}',
    ],
    ['user', '{question}'],
  ])

  let lastError = null
  for (const modelName of chatModelCandidates()) {
    try {
      const model = new ChatGoogleGenerativeAI({
        apiKey,
        model: modelName,
        temperature: 0,
      })
      const chain = prompt.pipe(model).pipe(new StringOutputParser())
      const answer = await chain.invoke({
        context,
        history: formatHistory(history),
        question,
      })
      return String(answer || '').trim()
    } catch (error) {
      lastError = error
      if (!isRetryableError(error)) throw toUserFacingGeminiError(error)
    }
  }

  throw toUserFacingGeminiError(lastError || new Error('Could not answer that question'))
}

module.exports = { answerQuestion }
