const mongoose = require('mongoose');

// used to track both a customer's purchase history as well as items in their cart
const PurchaseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    date: { type: Date, default: Date.now },
    
    // subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    other: [
        {
            key: String,
            description: String,
            params: Object,
            price: Number
        }
    ],
    
    total: Number,
    refunded: { type: Boolean, default: false }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;