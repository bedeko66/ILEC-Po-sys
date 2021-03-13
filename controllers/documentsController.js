// const firebaseDb = require('../config/firebase');
const Document = require('../models/Document')
const PurchaseOrder = require('../models/PurchaseOrder')
    // const firestore = firebaseDb.firestore();



const addDocument = async(req, res, next) => {
    try {
        const doc = new Document(req.body);
        await doc.save()
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(500).send(error);

    }
}



// const addInvoice = async(req, res, next) => {
//     try {
//         const data = req.body;
//         await firestore.collection('invoices').doc().set(data);
//         res.send('Record saved successfuly');
//     } catch (error) {
//         res.status(400).send(error.message);

//     }
// }
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

// const getInvoice = async(id) => {
//     try {
//         const invoice = await firestore.collection('invoices').doc(id);
//         const data = await invoice.get();

//         if (!data.exists) {
//             return ('Invoice with the given ID not found');

//         } else {
//             return (data.data());
//         }
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const updateDocument = async(req, res, next) => {
    try {
        await Document.findByIdAndUpdate(req.params.id, req.body.purchaseOrder)
        await Document.save()
        res.send('Invoice record updated successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// const updateInvoice = async(req, res, next) => {
//     try {
//         const id = req.params.id;
//         const data = req.body.purchaseOrder;
//         const invoice = await firestore.collection('invoices').doc(id);
//         await invoice.update(data);
//         res.send('Invoice record updated successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

// const updateInvoice = async(req, res, next) => {
//     try {
//         const id = req.params.id;
//         const data = req.body.purchaseOrder;

//         const invoice = await firestore.collection('invoices').doc(id);
//         await invoice.update(data);
//         res.send('Invoice record updated successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

// const updateInvoice = async(req, res, next) => {
//     try {
//         const id = req.params.id;
//         const data = req.body.purchaseOrder;
//         const invoice = await firestore.collection('invoices').doc(id);
//         await invoice.update(data);
//         res.send('Invoice record updated successfully');
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }


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

const updatePurchaseOrder = async(req, res, next) => {
    try {

        await PurchaseOrder.findByIdAndUpdate(req.params.po_uid, req.body.status)
        await PurchaseOrder.save()

        res.send('Invoice record updated successfully');
    } catch (error) {
        res.status(400).send(error.message);
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





//--------------------------------------------------------------
// const getInvoice = async(req, res, next) => {
//     try {
//         const id = req.params.id;
//         const invoice = await firestore.collection('invoices').doc(id);
//         const data = await invoice.get();

//         if (!data.exists) {
//             res.status(404).send('Invoice with the given ID not found');

//         } else {
//             res.send(data.data())
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }