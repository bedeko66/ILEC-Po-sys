const Document = require('../models/Document')
const PurchaseOrder = require('../models/PurchaseOrder')

const addDocument = async(req, res, next) => {
    try {
        const doc = new Document(req.body);
        await doc.save()
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(500).send(error);

    }
}


const getAllDocuments = async(user) => {
    console.log(user)
    const docs = await Document.find().where('document_user').eq(user.lastName);
    try {
        return docs;
    } catch (err) {
        res.status(500).send(err);
    }
}


const getDocument = async(id) => {
    try {
        const doc = await Document.findById(id);

        if (!doc) {
            return ('Invoice with the given ID not found');

        } else {
            return (doc);
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateDocument = async(_id, purchaseOrder) => {
    try {
        console.log(purchaseOrder)
        await Document.findOneAndUpdate({ _id }, purchaseOrder)
            // await Document.save()
        return ('Invoice record updated successfully');
    } catch (error) {
        console.log(error.message);
    }
}



// ------------- Pos -----------------------------------

const getPurchaseOrder = async(req, res, next) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);

        if (!po) {
            res.status(404).send('Purchase Order with the given ID not found');

        } else { res.send(po) }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updatePurchaseOrder = async(_id, status) => {
    try {
        console.log('updPo->>', _id)
        console.log('updPo->>', status)
        await PurchaseOrder.findOneAndUpdate({ _id }, status)
            // await PurchaseOrder.save()
        return ('Po record updated successfully');
    } catch (error) {
        return (error);
    }
}

const deletePo = async(req, res, next) => {
    try {
        const po = await PurchaseOrder.findByIdAndDelete(req.params.id)
        if (!po) res.status(404).send("No item found")
        res.status(200).send('Record deleted successfully')
    } catch (error) {
        res.status(500).send(error.message);
    }
}
const getAllPurchaseOrders = async(document_user) => {
    try {
        const pos = await PurchaseOrder.find().where('document_user').eq(document_user);
        if (!pos) {
            return {}
        } else {
            return pos;
        }

    } catch (err) {
        res.status(500).send(err);
    }
}


// ---- Filter functions ---------------------

const filterUnValidatedInvoices = invoices => {
    let UnValidatedInvoices = []
    invoices.forEach(invoice => {
        if (invoice.validated === false) {
            UnValidatedInvoices.push(invoice)
        }
    })
    return UnValidatedInvoices
}

const filterAwaitingPurchaseOrders = pos => {
    if (Object.keys(pos).length !== 0) {
        let AwaitingPurchaseOrders = []
        pos.forEach(po => {
            if (po.status === 'po-awaiting-for-invoice') {
                AwaitingPurchaseOrders.push(po)
            }
        })
        return AwaitingPurchaseOrders
    }
    return {}
}

module.exports = {
    addDocument,
    getAllDocuments,
    getDocument,
    updateDocument,
    deletePo,
    getAllPurchaseOrders,
    getPurchaseOrder,
    filterUnValidatedInvoices,
    filterAwaitingPurchaseOrders,
    updatePurchaseOrder
}