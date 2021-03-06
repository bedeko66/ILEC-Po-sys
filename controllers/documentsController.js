const firebaseDb = require('../config/firebase');
const { Document, DocumentItem } = require('../models/Document')
const firestore = firebaseDb.firestore();



const addInvoice = async(req, res, next) => {
    try {
        const data = req.body;
        await firestore.collection('invoices').doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);

    }
}


const getAllInvoices_ = async(req, res, next) => {
    try {
        const invoices = await firestore.collection('invoices');
        const data = await invoices.get();
        const invoicesArray = [];

        if (data.empty) {
            res.status(404).send('No invoice record found');
        } else {
            data.forEach(doc => {

                const invoice = new Document(
                    doc.id,
                    doc.data().poId,
                    doc.data().invoiceId,
                    doc.data().supplier,
                    doc.data().department,
                    doc.data().manager,
                    doc.data().orderDate,
                    doc.data().comments,
                    doc.data().validated,
                    doc.data().status,
                    doc.data().invoice_signed_by,
                    doc.data().invoice_signed_at,
                    doc.data().file_name,
                    doc.data().invoice_date,
                    doc.data().invoice_net,
                    doc.data().vat_amount,
                    doc.data().invoice_ttl,
                    doc.data().po_ttl,
                    doc.data().itemsArr,
                )
                invoicesArray.push(invoice)
            })
            res.send(invoicesArray)
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllInvoices = async(user) => {
    try {
        const invoices = await firestore.collection('invoices');
        const data = await invoices.get();
        const invoicesArray = [];

        if (data.empty) {
            return {}
        } else {
            data.forEach(doc => {
                if (doc.data().document_user === user.name) {
                    const invoice = new Document(
                        doc.id,
                        doc.data().document_user,
                        doc.data().poId,
                        doc.data().invoiceId,
                        doc.data().supplier,
                        doc.data().department,
                        doc.data().manager,
                        doc.data().orderDate,
                        doc.data().comments,
                        doc.data().validated,
                        doc.data().status,
                        doc.data().invoice_signed_by,
                        doc.data().invoice_signed_at,
                        doc.data().file_name,
                        doc.data().invoice_date,
                        doc.data().invoice_net,
                        doc.data().vat_amount,
                        doc.data().invoice_ttl,
                        doc.data().po_ttl,
                        doc.data().itemsArr,
                        doc.data().orig_file_name
                    )

                    invoicesArray.push(invoice)
                }

            })
            return invoicesArray;
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getInvoice = async(id) => {
    try {
        const invoice = await firestore.collection('invoices').doc(id);
        const data = await invoice.get();

        if (!data.exists) {
            return ('Invoice with the given ID not found');

        } else {
            return (data.data());
        }
    } catch (error) {
        console.log(error.message);
    }
}


const updateInvoice = async(req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body.purchaseOrder;
        const invoice = await firestore.collection('invoices').doc(id);
        await invoice.update(data);
        res.send('Invoice record updated successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deletePo = async(req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('purchase-orders').doc(id).delete();
        res.send('Record deleted successfully')
    } catch (error) {
        res.status(400).send(error.message);
    }
}

// ---- Filters ---------------------

function filterUnValidatedInvoices(invoices) {
    let UnValidatedInvoices = []
    invoices.forEach(invoice => {
        if (invoice.validated === false) {
            UnValidatedInvoices.push(invoice)
        }
    })
    return UnValidatedInvoices
}

function filterAwaitingPurchaseOrders(pos) {
    let AwaitingPurchaseOrders = []
    pos.forEach(po => {
        if (po.status === 'po-awaiting-for-invoice') {
            AwaitingPurchaseOrders.push(po)
        }
    })
    return AwaitingPurchaseOrders
}

// ------------- Pos -----------------------------------

const getPurchaseOrder = async(req, res, next) => {
    try {
        const id = req.params.id;
        const po = await firestore.collection('purchase-orders').doc(id);
        const data = await po.get();

        if (!data.exists) {
            res.status(404).send('Purchase Order with the given ID not found');

        } else {
            res.send(data.data())
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}


const getAllPurchaseOrders = async(user) => {
    try {
        const purchaseOrders = await firestore.collection('purchase-orders');
        const data = await purchaseOrders.get();
        const purchaseOrdersArray = [];

        if (data.empty) {
            return {};
        } else {
            data.forEach(doc => {

                if (doc.data().document_user === user.name) {

                    const po = new Document(
                        doc.id,
                        doc.data().document_user,
                        doc.data().poId,
                        doc.data().invoiceId,
                        doc.data().supplier,
                        doc.data().department,
                        doc.data().manager,
                        doc.data().orderDate,
                        doc.data().comments,
                        doc.data().validated,
                        doc.data().status,
                        doc.data().invoice_signed_by,
                        doc.data().invoice_signed_at,
                        doc.data().file_name,
                        doc.data().invoice_date,
                        doc.data().invoice_net,
                        doc.data().vat_amount,
                        doc.data().invoice_ttl,
                        doc.data().po_ttl,
                        doc.data().itemsArr,
                        doc.data().orig_file_name
                    )

                    purchaseOrdersArray.push(po)
                }

            })
            return purchaseOrdersArray;
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    addInvoice,
    getAllInvoices,
    getAllInvoices_,
    getInvoice,
    updateInvoice,
    deletePo,
    getAllPurchaseOrders,
    getPurchaseOrder,
    filterUnValidatedInvoices,
    filterAwaitingPurchaseOrders
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