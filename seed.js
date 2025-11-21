require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

(async () => {
  await connectDB();
  // create admin (owner)
  const ownerEmail = process.env.ADMIN_EMAIL || 'owner@example.com';
  let owner = await User.findOne({ email: ownerEmail });
  if (!owner) {
    owner = new User({ firstName: 'Owner', email: ownerEmail, password: 'Owner123!', role: 'admin', uniqId: 'Owner001' });
    await owner.save();
    console.log('Owner created:', ownerEmail);
  }

  // create sample product
  await Product.deleteMany({});
  await Product.create({
    title: 'Oversized Street Tee',
    slug: 'oversized-street-tee',
    description: 'Streetwear oversized tee',
    price: 999,
    images: [],
    gender: 'men',
    variants: [
      { size: 'M', color: 'Black', sku: 'OST-M-BLK', stock: 10 },
      { size: 'L', color: 'White', sku: 'OST-L-WHT', stock: 5 }
    ]
  });
  console.log('Sample product seeded');
  process.exit(0);
})();
