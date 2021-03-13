const Document = require('../models/Document')


const addInvoice = async(req, res, next) => {
    try {
        const doc = new Document({

        });
        await doc.save()
            // await firestore.collection('invoices').doc().set(data);
        res.send('Record saved successfuly');
    } catch (error) {
        res.status(400).send(error.message);

    }
}