// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const UserSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     // Later, we will link this to the 'history' seen in Home.jsx
//     flows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' }]
// });

// // Logic: Before saving, hash the password if it's new or changed
// UserSchema.pre('save', async function () {
//     if (!this.isModified('password')) return;
//     this.password = await bcrypt.hash(this.password, 10);
// });

// module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // store hashed password
    flows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flow' }]
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model('User', UserSchema);