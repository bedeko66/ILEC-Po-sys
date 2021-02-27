const firebaseDb = require('../config/firebase');

const Invoice = require('../models/Invoice')

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

// const getAllInvoices = async(req, res, next) => {
//     try {
//         const invoices = await firestore.collection('invoices');
//         const data = await invoices.get();
//         const invoicesArray = [];

//         if (data.empty) {
//             res.status(404).send('No invoice record found');
//         } else {
//             data.forEach(doc => {
//                 const invoice = new Invoice(
//                     doc.id,
//                     doc.data().poId,
//                     doc.data().invoiceId,
//                     doc.data().supplier,
//                     doc.data().department,
//                     doc.data().manager,
//                     doc.data().orderDate,
//                     doc.data().description,
//                     doc.data().validated
//                 )
//                 invoicesArray.push(invoice)
//             })
//             res.send(invoicesArray)
//         }
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// }

const getAllInvoices = async() => {
    try {
        const invoices = await firestore.collection('invoices');
        const data = await invoices.get();
        const invoicesArray = [];

        if (data.empty) {
            return 'No invoice record found';
        } else {
            data.forEach(doc => {
                const invoice = new Invoice(
                    doc.id,
                    doc.data().poId,
                    doc.data().invoiceId,
                    doc.data().supplier,
                    doc.data().department,
                    doc.data().manager,
                    doc.data().orderDate,
                    doc.data().description,
                    doc.data().validated
                )
                invoicesArray.push(invoice)
            })
            return invoicesArray;
        }
    } catch (error) {
        console.log(error.message);
    }
}

const getInvoice = async(req, res, next) => {
    try {
        const id = req.params.id;
        const invoice = await firestore.collection('invoices').doc(id);
        const data = await invoice.get();

        if (!data.exists) {
            res.status(404).send('Invoice with the given ID not found');

        } else {
            res.send(data.data())
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateInvoice = async(req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const invoice = await firestore.collection('invoices').doc(id);
        await invoice.update(data);
        res.send('Invoice record updated successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteInvoice = async(req, res, next) => {
    try {
        const id = req.params.id;
        await firestore.collection('invoices').doc(id).delete();
        res.send('Record deleted successfully')
    } catch (error) {
        res.status(400).send(error.message);
    }
}

module.exports = {
    addInvoice,
    getAllInvoices,
    getInvoice,
    updateInvoice,
    deleteInvoice
}