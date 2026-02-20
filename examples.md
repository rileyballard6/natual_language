# Query Examples

Six example questions, the SQL generated, and the response from the app.

---

### 1. Who has spent the least money?

**SQL:**

```sql
[SQL] SELECT u.email, SUM(o.total_amount) AS total_spent FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id ORDER BY total_spent ASC LIMIT 1
```

**Response:**

> The person who has spent the least money is Eve, with a total of $22.99.

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

>The top three best-selling products are:
>
> 1. **Classic T-Shirt** with 4 sold.
> 2. **Wireless Headphones** with 2 sold.
> 3. **Mechanical Keyboard** also with 2 sold.

> These products have shown the highest sales in the store, with the Classic T-Shirt leading the way.

---

### 3. How many orders are in each status?

**SQL:**

```sql
SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status
```

**Response:**

> Here’s a breakdown of the number of orders by their status:
> 
> - There are 4 orders that are marked as "completed."
> - There are 2 orders that have been "shipped."
> - Additionally, there are 2 orders that are still "pending."

Let me know if you need more information!

---

### 4. Which products have never been ordered?

**SQL:**

```sql
[SQL] SELECT p.title FROM products p LEFT JOIN order_items oi ON p.id = oi.product_variant_id WHERE oi.id IS NULL
```

**Response:**

>  The only product that has never been ordered is the "Hoodie." So, it seems like this item hasn't attracted any buyers yet.

---

### 5. What is the average order value?

**SQL:**

```sql
SELECT ROUND(AVG(total_amount), 2) AS average_order_value
FROM orders
```

**Response:**

> The average order value is about $64.74. This means that, on average, customers spend this amount when they place an order at the store.

---

### 6. Which category has the most products?

**SQL:**

```sql
[SQL] SELECT c.name AS category_name, COUNT(p.id) AS product_count FROM categories c LEFT JOIN products p ON c.id = p.category_id GROUP BY c.id ORDER BY product_count DESC LIMIT 1
```

**Response:**

> The category with the most products is "Electronics," which has a total of 3 products available.

---
