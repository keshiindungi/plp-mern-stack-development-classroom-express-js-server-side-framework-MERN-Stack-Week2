// server.js - Completed Express server for Week 2 assignment

// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// 🧩 Middleware Setup
// ============================
app.use(bodyParser.json());

// Custom logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Simple authentication middleware
app.use((req, res, next) => {
  const token = req.headers["authorization"];
  if (token === "Bearer mysecrettoken" || req.method === "GET") {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// ============================
// 📦 In-Memory "Database"
// ============================
let products = [
  {
    id: "1",
    name: "Laptop",
    description: "High-performance laptop with 16GB RAM",
    price: 1200,
    category: "electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Smartphone",
    description: "Latest model with 128GB storage",
    price: 800,
    category: "electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Coffee Maker",
    description: "Programmable coffee maker with timer",
    price: 50,
    category: "kitchen",
    inStock: false,
  },
];

// ============================
// 🚀 Routes
// ============================

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Product API! Go to /api/products to see all products.");
});

// ✅ GET /api/products — Get all products (with optional filtering, search, pagination)
app.get("/api/products", (req, res) => {
  let filtered = products;
  const { category, q, page = 1, limit = 5 } = req.query;

  if (category) filtered = filtered.filter(p => p.category === category);
  if (q) filtered = filtered.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));

  res.json(paginated);
});

// ✅ GET /api/products/:id — Get one product by ID
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

// ✅ POST /api/products — Create new product
app.post("/api/products", (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;

    // Simple validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const newProduct = {
      id: uuidv4(),
      name,
      description: description || "",
      price,
      category: category || "general",
      inStock: inStock ?? true,
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ PUT /api/products/:id — Update existing product
app.put("/api/products/:id", (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Product not found" });

    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } catch (err) {
    next(err);
  }
});

// ✅ DELETE /api/products/:id — Delete a product
app.delete("/api/products/:id", (req, res, next) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: "Product not found" });

    products.splice(index, 1);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ============================
// ⚠️ Global Error Handler
// ============================
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ============================
// 🖥️ Start the Server
// ============================
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

// Export app for testing
module.exports = app;
