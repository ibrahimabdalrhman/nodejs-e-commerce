const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            productId: { type: Object, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    user: {
        name: { type: String, required: true },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        }
    },
    information: {
        name: String,
        address: String,
        phone: String,
        email: String,
        notes:String
    }
});

module.exports = mongoose.model('Order', orderSchema);