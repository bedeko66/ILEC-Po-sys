const mongoose = require('mongoose')

const DocItemSchema = new mongoose.Schema({
    item_descr: {
        type: String,
    },
    item_qty: {
        type: Number,
    },
    item_vat: {
        type: Number,
    },
    item_net: {
        type: Number,
    },
    item_gross: {
        type: Number,
    }

})

const DocumentSchema = new mongoose.Schema({
    document_user: {
        type: String,
    },
    poId: {
        type: String,
    },
    invoiceId: {
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
    invoice_signed_by: {
        type: String,
    },
    invoice_signed_at: {
        type: Date,
        default: Date.now
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
    invoice_date: {
        type: Date,
    },
    invoice_net: {
        type: Number,
    },
    vat_amount: {
        type: Number,
    },
    invoice_ttl: {
        type: Number,
    },
    po_ttl: {
        type: Number,
    },
    itemsArr: {
        type: [DocItemSchema],
    },
    orig_file_name: {
        type: String,
    }

})

module.exports = mongoose.model('Document', DocumentSchema)