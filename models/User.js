const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  label: String,
  street: String,
  city: String,
  state: String,
  zipcode: String,
  country: String,
  phone: String
});

const UserSchema = new mongoose.Schema({
  uniqId: { type: String, unique: true }, // e.g. Jashu001
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user' | 'admin' | 'owner'
  addresses: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  createdAt: { type: Date, default: Date.now }
});

// password hash
UserSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function(entered){
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
