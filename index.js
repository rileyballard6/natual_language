require("dotenv").config();
const OpenAI = require("openai");
const mysql = require("mysql2/promise");
const readline = require("readline");
const fs = require("fs");

const schema = fs.readFileSync("schema.sql", "utf8");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// In-domain few-shot examples drawn from this same e-commerce database
const FEW_SHOT_EXAMPLES = [
  {
    role: "user",
    content: "How many orders are there in total?",
  },
  {
    role: "assistant",
    content: "SELECT COUNT(*) AS order_count FROM orders",
  },
  {
    role: "user",
    content: "Which products are in the Electronics category?",
  },
  {
    role: "assistant",
    content:
      "SELECT p.title, p.price FROM products p JOIN categories c ON c.id = p.category_id WHERE c.name = 'Electronics'",
  },
  {
    role: "user",
    content: "What is the total revenue from completed orders?",
  },
  {
    role: "assistant",
    content:
      "SELECT SUM(total_amount) AS total_revenue FROM orders WHERE status = 'completed'",
  },
];

const SYSTEM_PROMPT = `You are a MySQL expert. Given the database schema below, write a single SQL SELECT query that answers the user's question.
Rules:
- Return ONLY the raw SQL — no explanation, no markdown, no code fences, no semicolon at the end
- Only use SELECT statements (never INSERT, UPDATE, DELETE, or DROP)
- Use JOINs when data spans multiple tables
- Use aliases to make column names readable in results
- If the question is ambiguous, make a reasonable assumption

Schema:
${schema}`;

async function getSQL(question, strategy) {
  // Zero-shot: schema + question only, no examples
  // Few-shot: schema + in-domain NLQ-SQL examples + question
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(strategy === "few-shot" ? FEW_SHOT_EXAMPLES : []),
    { role: "user", content: question },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
  });
  return response.choices[0].message.content.trim().replace(/;$/, "");
}

async function getAnswer(question, sql, results) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a friendly data analyst. The user asked a question about a store database.
You were given the SQL query that ran and its results. Summarize the answer in plain, conversational language.
- Be concise but complete — mention specific names and numbers from the data
- If the results are empty, say so clearly and suggest why that might be
- Do not mention SQL, tables, or technical jargon`,
      },
      {
        role: "user",
        content: `Question: ${question}

SQL used: ${sql}

Query results (${results.length} row(s)):
${JSON.stringify(results, null, 2)}`,
      },
    ],
  });
  return response.choices[0].message.content.trim();
}

async function main() {
  const strategy = process.argv[2] === "--zero-shot" ? "zero-shot" : "few-shot";

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`Strategy: ${strategy}`);
  console.log('Ask questions about your database in plain English. Type "exit" to quit.\n');

  const ask = () => {
    rl.question("You: ", async (question) => {
      if (question.trim().toLowerCase() === "exit") {
        await db.end();
        rl.close();
        return;
      }

      try {
        // Step 1: get SQL from GPT using the selected prompting strategy
        const sql = await getSQL(question, strategy);
        console.log(`\n[SQL] ${sql}\n`);

        // Step 2: run it against the database
        const [rows] = await db.execute(sql);

        // Step 3: get plain English answer from GPT
        const answer = await getAnswer(question, sql, rows);
        console.log(`Answer: ${answer}\n`);
      } catch (err) {
        console.error(`Error: ${err.message}\n`);
      }

      ask();
    });
  };

  ask();
}

main();
