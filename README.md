# Natural Language Database Query App

A Node.js CLI that lets you ask plain English questions about a database and get plain English answers back — powered by OpenAI's GPT and MySQL.

## Database Description

This database models a small e-commerce store. It tracks **users**, **product categories**, **products** and their **variants** (size, color, SKU, stock), **orders**, and the individual **order items** within each order. It's designed to answer business questions like sales performance, inventory levels, and customer spending.

## Schema

![Database Schema](schema.png)


## Example That Worked

**Question:** Who has spent the most money?

**Generated SQL:**
```sql
SELECT u.first_name, u.last_name, SUM(o.total_amount) AS total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY total_spent DESC
LIMIT 1
```

**Response:**
> Bob Smith has spent the most, with a total of $154.97 across his orders.

## Example That Did Not Work

**Question:** What did people buy last Christmas?

**Generated SQL:**
```sql
SELECT u.first_name, p.title, oi.quantity
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN users u ON u.id = o.user_id
JOIN product_variants pv ON pv.id = oi.product_variant_id
JOIN products p ON p.id = pv.product_id
WHERE o.created_at BETWEEN '2024-12-24' AND '2024-12-26'
```

**Response:**
> The query ran successfully but returned no results — there are no orders in the database from December 24–26, 2024. The seed data only goes back to January 2025.

*(The SQL itself was valid and correct; it just didn't match any data. A smarter fallback could detect empty results and say so more helpfully.)*

---

See [examples.md](examples.md) for 8 more worked examples.

## Prompting Strategies

Two prompting strategies were tested for the SQL generation step:

### Strategy 1 — Minimal prompt
The first version just said: *"You are a SQL expert. Write a query to answer the user's question. Return only the SQL."*

This worked for simple questions but occasionally returned SQL wrapped in markdown code fences (` ```sql `) or with a trailing semicolon that broke the MySQL driver. It also sometimes used subqueries where a JOIN would be cleaner.

### Strategy 2 — Constrained prompt with rules (current version)
The improved prompt adds explicit rules:
- Only `SELECT` statements allowed
- No markdown, no code fences, no trailing semicolon
- Use JOINs when data spans tables
- Use aliases for readable column names
- Make a reasonable assumption if the question is ambiguous

This version was noticeably more reliable. The formatted output was always clean, and the responses handled multi-table questions (like linking orders → users → products) correctly on the first try. The alias rule especially helped — the natural language answer step is much better when column names like `total_spent` come back instead of `SUM(o.total_amount)`.

The answer-generation prompt also improved when told to avoid mentioning SQL or table names — early responses would say things like *"the `orders` table shows..."* which sounds robotic. Telling it to speak like a friendly data analyst made the answers feel more natural.
