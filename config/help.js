const _ = require('lodash')
const { produce } = require('immer')

const po = {
    poId: 'R-25159835050',
    document_user: 'Bedekovics',
    supplier: 'li',
    manager: 'li',
    department: 'Reception',
    orderDate: '2020-01-01',
    comments: 'ljhkh',
    status: 'po-awaiting-for-invoice',
    invoice_signed_by: 'Bedekovics',
    invoice_signed_at: 'Fri Mar 12 2021 18:43:08 GMT+0000 (Greenwich Mean Time)',
    po_ttl: '103.5',
    file_name: 'R-25159835050.pdf',
    itemsArr: [{
        item_descr: 'item10',
        item_qty: '10',
        item_net: '10.5',
        item_vat: '12.3',
        item_gross: '103.5'
    }]
}

function convertItemsType(po) {
    return produce(po, draftPo => {
        draftPo.po_ttl = parseFloat(draftPo.po_ttl)
        let dO;
        draftPo.itemsArr = draftPo.itemsArr.map(item => {
            dO = {
                item_qty: parseFloat(item.item_qty),
                item_net: parseFloat(item.item_net),
                item_vat: parseFloat(item.item_vat),
                item_gross: parseFloat(item.item_gross)
            }
            return dO
        })

    })
}


let updated = convertItemsType(po)
console.log(updated)

// let itemsArr_ = po.itemsArr.map(item => {
//     item.item_qty = parseFloat(item.item_qty)
//     item.item_net = parseFloat(item.item_net)
//     item.item_vat = parseFloat(item.item_vat)
//     item.item_gross = parseFloat(item.item_gross)
//     return item;
// })

// let clonedObject = {
//     ...po,
//     po_ttl: parseFloat(po_ttl),
//     itemsArr: po.itemsArr.map(item => {
//         item.item_qty = parseFloat(item.item_qty)
//         item.item_net = parseFloat(item.item_net)
//         item.item_vat = parseFloat(item.item_vat)
//         item.item_gross = parseFloat(item.item_gross)
//         return item;
//     })
// }

// const clonedObject = _.clone(po)
// po.po_ttl = parseFloat(po.po_ttl)
// po.itemsArr.map(item => {
//     item.item_qty = parseFloat(item.item_qty)
//     item.item_net = parseFloat(item.item_net)
//     item.item_vat = parseFloat(item.item_vat)
//     item.item_gross = parseFloat(item.item_gross)
// })
// console.log(po);
// console.log(clonedObject);