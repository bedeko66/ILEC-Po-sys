const mongoose = require('mongoose')

const PoItemSchema = new mongoose.Schema({
    item_descr: {
        type: String,
    },
    item_gross: {
        type: Number,
    },
    item_net: {
        type: Number,
    },
    item_gty: {
        type: Number,
    },
    item_vat: {
        type: Number,
    }

})

const PurchaseOrderSchema = new mongoose.Schema({
    document_user: {
        type: String,
    },
    poId: {
        type: String,
    },
    supplier: {
        type: String,
    },
    department: {
        type: String,
    },
    manager: {
        type: String,
    },
    orderDate: {
        type: Date,
    },
    comments: {
        type: String,
    },
    validated: {
        type: Boolean,
    },
    status: {
        type: String,
    },
    po_signed_by: {
        type: String,
    },
    po_signed_at: {
        type: Date,
        default: Date.now
    },
    file_name: {
        type: String,
    },
    po_date: {
        type: Date,
    },
    po_net: {
        type: Number,
    },
    vat_amount: {
        type: Number,
    },
    po_ttl: {
        type: Number,
    },
    itemsArr: {
        type: [PoItemSchema],
    },
    orig_file_name: {
        type: String,
    }

})

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema)