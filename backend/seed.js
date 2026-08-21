require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Product = require("./models/Product");

const products = [
  {
    name: "Wireless Headphones",
    description: "Comfortable Bluetooth headphones with clear sound and long battery life.",
    price: 1999,
    category: "Electronics",
    stock: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Smartwatch",
    description: "Modern smartwatch with activity tracking and notifications.",
    price: 2999,
    category: "Electronics",
    stock: 18,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with deep bass, long playback, and waterproof build.",
    price: 2499,
    category: "Electronics",
    stock: 14,
    image: "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Laptop Stand",
    description: "Ergonomic aluminum stand that lifts your screen for better posture.",
    price: 1599,
    category: "Electronics",
    stock: 22,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes designed for everyday training.",
    price: 2499,
    category: "Fashion",
    stock: 30,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Backpack",
    description: "Durable everyday backpack suitable for college and travel.",
    price: 1299,
    category: "Fashion",
    stock: 20,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Leather Wallet",
    description: "Premium leather wallet with multiple card slots and a RFID-safe design.",
    price: 999,
    category: "Fashion",
    stock: 35,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Sunglasses",
    description: "Polarized shades with UV protection and modern matte finish.",
    price: 1499,
    category: "Fashion",
    stock: 28,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Coffee Maker",
    description: "Compact coffee maker for quick and convenient brewing.",
    price: 3499,
    category: "Home",
    stock: 12,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Desk Lamp",
    description: "Minimal LED desk lamp with adjustable brightness.",
    price: 899,
    category: "Home",
    stock: 40,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Air Fryer",
    description: "Healthy and fast cooking with a compact countertop design.",
    price: 4999,
    category: "Home",
    stock: 10,
    image: "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Throw Pillow Set",
    description: "Soft textured cushion set that refreshes your living room instantly.",
    price: 1199,
    category: "Home",
    stock: 26,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Business Planner",
    description: "A premium planner designed for productivity, goals, and daily tracking.",
    price: 799,
    category: "Books",
    stock: 45,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Programming Book",
    description: "A practical guide covering modern JavaScript and full-stack fundamentals.",
    price: 1299,
    category: "Books",
    stock: 24,
    image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Yoga Mat",
    description: "Comfortable, non-slip yoga mat for workouts, stretching, and meditation.",
    price: 1799,
    category: "Fitness",
    stock: 19,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"
  }
];

const additionalProducts = [
  ["4K Action Camera", "Electronics", 8999],
  ["Wireless Keyboard", "Electronics", 1799],
  ["Gaming Mouse", "Electronics", 1299],
  ["USB-C Hub", "Electronics", 999],
  ["Noise Cancelling Earbuds", "Electronics", 3299],
  ["Portable Power Bank", "Electronics", 1499],
  ["Mechanical Keyboard", "Electronics", 4599],
  ["Webcam with Microphone", "Electronics", 2799],
  ["Tablet Sleeve", "Electronics", 899],
  ["Phone Tripod", "Electronics", 1199],
  ["Wireless Charger", "Electronics", 1099],
  ["Mini Projector", "Electronics", 6999],
  ["Smart LED Bulb", "Electronics", 699],
  ["Fitness Tracker", "Electronics", 2199],
  ["Digital Alarm Clock", "Electronics", 1399],
  ["Denim Jacket", "Fashion", 2899],
  ["Cotton Hoodie", "Fashion", 1999],
  ["Classic T-Shirt", "Fashion", 799],
  ["Chino Trousers", "Fashion", 1699],
  ["Canvas Sneakers", "Fashion", 1899],
  ["Leather Belt", "Fashion", 899],
  ["Wool Scarf", "Fashion", 699],
  ["Cotton Cap", "Fashion", 499],
  ["Travel Duffel Bag", "Fashion", 2199],
  ["Crossbody Bag", "Fashion", 1599],
  ["Classic Wristwatch", "Fashion", 2499],
  ["Linen Shirt", "Fashion", 1299],
  ["Rain Jacket", "Fashion", 2399],
  ["Sports Socks Pack", "Fashion", 599],
  ["Silk Tie", "Fashion", 999],
  ["Nonstick Cookware Set", "Home", 5499],
  ["Ceramic Dinner Set", "Home", 2499],
  ["Electric Kettle", "Home", 1599],
  ["Stainless Steel Bottle", "Home", 899],
  ["Bamboo Cutting Board", "Home", 699],
  ["Cotton Bedsheet Set", "Home", 1899],
  ["Memory Foam Pillow", "Home", 1499],
  ["Scented Candle Set", "Home", 799],
  ["Wall Art Print", "Home", 999],
  ["Storage Basket Set", "Home", 1199],
  ["Robot Vacuum", "Home", 12999],
  ["Hand Blender", "Home", 1799],
  ["Toaster Oven", "Home", 3999],
  ["Indoor Plant Pot", "Home", 599],
  ["Bath Towel Set", "Home", 1399],
  ["The Art of Focus", "Books", 599],
  ["Everyday Cooking Guide", "Books", 899],
  ["World Travel Stories", "Books", 749],
  ["Mindfulness Journal", "Books", 499],
  ["Learn Python Quickly", "Books", 1099],
  ["Modern Design Handbook", "Books", 1299],
  ["Classic Mystery Novel", "Books", 449],
  ["Personal Finance Guide", "Books", 699],
  ["Creative Writing Workbook", "Books", 799],
  ["Gardening for Beginners", "Books", 849],
  ["Strength Training Guide", "Books", 999],
  ["Children's Story Collection", "Books", 549],
  ["World Atlas", "Books", 1499],
  ["Photography Basics", "Books", 899],
  ["Entrepreneurship Playbook", "Books", 1199],
  ["Adjustable Dumbbells", "Fitness", 5999],
  ["Resistance Bands Set", "Fitness", 999],
  ["Kettlebell", "Fitness", 2499],
  ["Foam Roller", "Fitness", 1299],
  ["Exercise Ball", "Fitness", 1199],
  ["Gym Gloves", "Fitness", 699],
  ["Jump Rope", "Fitness", 499],
  ["Cycling Helmet", "Fitness", 1999],
  ["Running Armband", "Fitness", 599],
  ["Sports Water Bottle", "Fitness", 799],
  ["Camping Backpack", "Outdoor", 3299],
  ["LED Camping Lantern", "Outdoor", 899],
  ["Hiking Poles", "Outdoor", 1799],
  ["Picnic Blanket", "Outdoor", 1499],
  ["Travel Neck Pillow", "Travel", 799],
  ["Packing Cube Set", "Travel", 999],
  ["Hard Shell Suitcase", "Travel", 4999],
  ["Passport Holder", "Travel", 699],
  ["Stainless Travel Mug", "Travel", 1099],
  ["Digital Luggage Scale", "Travel", 599],
  ["Pet Feeding Bowl", "Pets", 699],
  ["Pet Grooming Brush", "Pets", 599],
  ["Interactive Cat Toy", "Pets", 899],
  ["Dog Walking Harness", "Pets", 1199],
  ["Pet Comfort Bed", "Pets", 1999]
];

const categoryImagePool = {
  Electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80"
  ],
  Fashion: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80"
  ],
  Home: [
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"
  ],
  Books: [
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80"
  ],
  Fitness: [
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80"
  ],
  Outdoor: [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80"
  ],
  Travel: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80"
  ],
  Pets: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80"
  ]
};

const catalog = [
  ...products,
  ...additionalProducts.map(([name, category, price], index) => ({
    name,
    description: `${name} made for reliable everyday use and lasting value.`,
    price,
    category,
    stock: 10 + (index % 36),
    image: categoryImagePool[category][index % categoryImagePool[category].length]
  }))
];

async function seed() {
  await connectDB();

  const adminPassword = await bcrypt.hash("admin@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  await User.findOneAndUpdate(
    { email: "admin@gmail.com" },
    { name: "Admin", email: "admin@gmail.com", password: adminPassword, role: "admin" },
    { upsert: true, new: true }
  );

  await User.findOneAndUpdate(
    { email: "user@example.com" },
    { name: "Demo User", email: "user@example.com", password: userPassword, role: "user" },
    { upsert: true, new: true }
  );

  await Product.deleteMany({});
  await Product.insertMany(catalog);

  console.log("Database seeded successfully.");
  console.log("Admin: admin@gmail.com / admin@123");
  console.log("User: user@example.com / User@123");
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
