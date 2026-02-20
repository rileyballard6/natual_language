# Query Examples

Six example questions, the SQL generated, and the response from the app.

---

### 1. Who has spent the most money?

**SQL:**
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

---

### 2. What are the top 3 best-selling products?

**SQL:**
```sql
SELECT p.title, SUM(oi.quantity) AS units_sold
FROM products p
JOIN product_variants pv ON pv.product_id = p.id
JOIN order_items oi ON oi.product_variant_id = pv.id
GROUP BY p.id
ORDER BY units_sold DESC
LIMIT 3
```

**Response:**
> The top 3 best-selling products are the Classic T-Shirt (4 units), followed by Wireless Headphones, Mechanical Keyboard, Hoodie, and The Pragmatic Programmer (all tied at 2 units each).

---

### 3. How many orders are in each status?

**SQL:**
```sql
SELECT status, COUNT(*) AS order_count
FROM orders
GROUP BY status
```

**Response:**
> There are currently 4 completed orders, 2 that have been shipped, and 2 still pending.

---

### 4. Which products have never been ordered?

**SQL:**
```sql
SELECT p.title
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
LEFT JOIN order_items oi ON oi.product_variant_id = pv.id
WHERE oi.id IS NULL
```

**Response:**
> The Cast Iron Skillet and the Denim Jacket have never been ordered.

---

### 5. What is the average order value?

**SQL:**
```sql
SELECT ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
```

**Response:**
> The average order value is $65.24.

---

### 6. Which category has the most products?

**SQL:**
```sql
SELECT c.name, COUNT(p.id) AS product_count
FROM categories c
JOIN products p ON p.category_id = c.id
GROUP BY c.id
ORDER BY product_count DESC
LIMIT 1
```

**Response:**
> The Clothing category has the most products, with 3 items listed.

---