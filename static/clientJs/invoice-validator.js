let purchaseOrderFilled = false;
let signoPanelDisplayed = false;
let poSigned = false;
let invoiceSigned = false;

let updateFromExistingPo = false;

const user = document.getElementById("user").innerText;
let signed_at;
let poId;
let po_uid;


// Pdf viewer
const c2 = document.querySelector('#pdf-render');
const context2 = c2.getContext('2d');

const c3 = document.querySelector('#pdf-render2');
const context3 = c3.getContext('2d');

const c4 = document.querySelector('#pdf-render3');
const context4 = c4.getContext('2d');

const c5 = document.querySelector('#pdf-render4');
const context5 = c5.getContext('2d');

function pdfViewer(url, canvas2, ctx2) {

    let pdfDoc = null,
        pageNum = 1,
        pageIsRendering = false,
        pageNumIsPending = null;

    const scale = 1

    // Render the page
    const renderPage = num => {
        pageIsRendering = true;

        // Get page
        pdfDoc.getPage(num).then(page => {
            // Set scale
            const viewport = page.getViewport({ scale });

            canvas2.height = viewport.height;
            canvas2.width = viewport.width;

            let renderCtx = {
                canvasContext: ctx2,
                viewport
            };

            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;

                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });

            // Output current page
            document.querySelector('#page-num').textContent = num;
        });
    };

    // Check for pages rendering
    const queueRenderPage = num => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    // Show Prev Page
    const showPrevPage = () => {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    };

    // Show Next Page
    const showNextPage = () => {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    };


    pdfjsLib
        .getDocument(url)
        .promise.then(pdfDoc_ => {

            pdfDoc = pdfDoc_;

            document.querySelector('#page-count').textContent = pdfDoc.numPages;

            renderPage(pageNum);
        })
        .catch(err => {
            // Display error
            const div = document.createElement('div');
            div.className = 'error';
            div.appendChild(document.createTextNode(err.message));
            document.querySelector('body').insertBefore(div, canvas2);
            // Remove top bar
            document.querySelector('.top-bar').style.display = 'none';
        });

    // Button Events
    document.querySelector('#prev-page').addEventListener('click', showPrevPage);
    document.querySelector('#next-page').addEventListener('click', showNextPage);

}
let view_invoice = '../static/templates/orig_invoice.pdf';
pdfViewer(view_invoice, c2, context2)

// Generate PoId -------------------------------------
$(document).ready(function() {
    let dptLtr;
    $('#department').on('click', function() {
        dptLtr = $('#department option:selected').text()[0];
        poId = `${dptLtr}-${Math.round(Math.random() * (90000000000 - 10000000000) + 10000000000)}`;
        // setTimeout(function() {
        $('#po-ref').val(poId);
        // }, 500);
    });
});


function getPoTotal() {
    let itemsArr = []
    $("#products-table tr:gt(0)").each(function() {
        let this_row = $(this);
        let item_gross = $.trim(this_row.find('td:eq(4)').html())

        itemsArr.push({
            item_gross
        })
    });

    let sum = 0
    itemsArr.forEach(item => {
        sum += Number(item.item_gross)
    })
    $('#po-ttl').text('')
    $('#po-ttl').append(sum)

}
getPoTotal()

// ---------------------
$(document).ready(function() {
    $('#products-table').SetEditable({
        $addButton: $('#addNewRow')
    });
});
//-------------------------------------------------------------
// Save po to pdf
function savePo() {
    $('.process-loader').fadeIn('slow')

    let itemsArr = []
    let this_row
    $("#products-table tr:gt(0)").each(function() {
        this_row = $(this);
        itemsArr.push({
            item_descr: $.trim(this_row.find('td:eq(0)').html()),
            item_qty: parseFloat($.trim(this_row.find('td:eq(1)').html())),
            item_net: parseFloat($.trim(this_row.find('td:eq(2)').html())),
            item_vat: parseFloat($.trim(this_row.find('td:eq(3)').html())),
            item_gross: parseFloat($.trim(this_row.find('td:eq(4)').html())),

        })
    });

    const purchaseOrder = {
        poId: $('#po-ref').val(),
        supplier: $('#supplier').val(),
        attention: $('#attention').val(),
        department: $('#department option:selected').text(),
        orderDate: $('#order-date').val(),
        comments: $('#comments').val(),
        po_ttl: parseFloat($('#po-ttl').val()),
        itemsArr,
    }

    $.ajax({
        type: "POST",
        url: "/generate-purchase-order",
        data: {
            purchaseOrder,
            from: 'invoice-validator'
        }
    }).done(function(o) {
        purchaseOrderFilled = true
        stateControl()
    });

    setTimeout(function() {
        pdfViewer('../static/templates/merged.pdf', c3, context3)
        $('.process-loader').fadeOut('slow')
    }, 3000);

}
//----------------------------------------------------
// Add Signature to Docs

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

window.addEventListener('load', () => {

    canvas.height = window.innerHeight / 8;
    canvas.width = window.innerWidth / 2;

    let painting = false;


    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function finishedPosition() {
        painting = false;
        ctx.beginPath();
    }


    function draw(e) {

        ctx.textBaseline = 'Top';
        ctx.fillStyle = 'white';
        ctx.font = 'Regular 35px Sans-Serif';

        if (!painting) return;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.strokeStyle = 'white';


        let rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);

});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function addSignatureToPo() {

    $('.process-loader').fadeIn('slow')

    let signo = document.getElementById('canvas').toDataURL("image/png");

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            signo,
            invoicePageNum: 0,
            from: 'invoice-validator'
        }
    }).done(function(o) {
        poSigned = true;
        stateControl()
    });

    setTimeout(function() {
        clearCanvas()
        pdfViewer('../static/templates/output.pdf', c4, context4)
        $('.process-loader').fadeOut('slow')
    }, 3000);
}

function addSignatureToInvoice() {
    $('.process-loader').fadeIn('slow')

    const timeElapsed = Date.now();
    signed_at = new Date(timeElapsed);
    ctx.fillText(`signed by -${user} at ${signed_at}`, (canvas.width / 15), (canvas.height / 4));

    let signo = document.getElementById('canvas').toDataURL("image/png");

    let from = 'invoice-validator'
    if (updateFromExistingPo) {
        from = 'invoice-validator-existing-po'
    }

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            signo,
            invoicePageNum: 1,
            from
        }
    }).done(function(o) {
        invoiceSigned = true;
        stateControl()
    });
    setTimeout(function() {
        clearCanvas()
        pdfViewer('../static/templates/output2.pdf', c5, context5)
        $('.process-loader').fadeOut('slow')
    }, 3000);
}

function validateDocs() {
    let id = $('.validate').attr('id').split('!')[0];
    let filename = $('.validate').attr('id').split('!')[1];

    if (updateFromExistingPo === false) {

        let itemsArr = []
        let this_row
        $("#products-table tr:gt(0)").each(function() {
            this_row = $(this);
            itemsArr.push({
                item_descr: $.trim(this_row.find('td:eq(0)').html()),
                item_qty: parseFloat($.trim(this_row.find('td:eq(1)').html())),
                item_net: parseFloat($.trim(this_row.find('td:eq(2)').html())),
                item_vat: parseFloat($.trim(this_row.find('td:eq(3)').html())),
                item_gross: parseFloat($.trim(this_row.find('td:eq(4)').html()))

            })
        });


        const purchaseOrder = {
            poId,
            supplier: $('#supplier').val(),
            manager: $('#attention').val(),
            department: $('#department option:selected').text(),
            orderDate: $('#order-date').val(),
            comments: $('#comments').val(),
            validated: true,
            status: 'po-accepted',
            invoice_signed_by: user,
            invoice_signed_at: signed_at,
            itemsArr
        }

        //Update invoice
        $.ajax({
            type: "PUT",
            url: `/invoice/${id}`,
            data: {
                purchaseOrder,
                filename
            }
        }).done(function(o) {
            alert('Your invoice is validated')
            location.assign('/dashboard')
        });

    } else { //validate from existing po
        console.log('hi')
            //Update invoice
        $.ajax({
            type: "PUT",
            url: `/invoice/${id}`,
            data: {
                purchaseOrder: {
                    validated: true,
                    status: 'po-accepted',
                    invoice_signed_by: user,
                    invoice_signed_at: signed_at,
                },
                filename
            }
        }).done(function(o) {
            //Update po status
            console.log(po_uid)
            $.ajax({
                type: "PUT",
                url: `/purchase-order/${po_uid}`,
                data: {
                    status: {
                        status: 'po-accepted'
                    }
                }
            }).done(function(o) {
                alert('Your invoice is validated')
                location.assign('/dashboard')
            })
        });
    }
}

//-------------------------------------------------------------
// State Controller

function reloadPage() {
    location.reload();
    return false;
}

function resetState() {

    purchaseOrderFilled = false;
    signoPanelDisplayed = false;
    poSigned = false;
    invoiceSigned = false;
    $('.purchase-order-form').show()
    $('.signature').hide()
    $('#po-sign-btn').show()
    $('#invoice-sign-btn').hide()

}

function validationMode() {

    if ($('#validation-type option:selected').text() === 'Create new purchase order') {
        $('.validation-mode-panel').hide()
        $('#process-msg').show()
        $('.purchase-order-form').show()

    }
    if ($('#validation-type option:selected').text() === 'Existing purchase order') {
        updateFromExistingPo = true;
        $('.validation-mode-panel').hide()
        $('#existing-po-sel').show()
    }
}

function processSelectedPo() {

    $('.process-loader').fadeIn('slow')

    $('#existing-po-sel').hide()
    let poId = $('#po-selection option:selected').text().split('_')[0]
    let id = $('#po-selection option:selected').attr('value')
    let invoice_id = $('.validate').attr('id').split('!')[0];
    po_uid = $('#po-selection option:selected').attr('value') //po-uid global

    //cp po to templates //get po -update db
    $.ajax({
        type: "POST",
        url: "/merge-from-existing-purchase-order",
        data: {
            poId,
            id, // <--> po db uid
            invoice_id
        }
    }).done(function(o) {
        setTimeout(function() {
            purchaseOrderFilled = true
            poSigned = true
            $('#process-msg').show()
            stateControl()
            pdfViewer('../static/templates/merged.pdf', c3, context3)
            $('#pdf-render2').show()
            $('.process-loader').fadeOut('slow')
        }, 3000);
    });
}

function stateControl() {

    if (purchaseOrderFilled) {

        $('#pdf-render').hide()
        $('.purchase-order-form').hide()
        $('#process-msg').text('');
        $('#process-msg').append('Step 2- Validate Purchase Order with your e-signature!')
        signoPanelDisplayed = true
        $('.signature').show()

    }

    if (signoPanelDisplayed) {
        if (poSigned) {
            $('#pdf-render2').hide()
            $('#process-msg').text('');
            $('#process-msg').append('Step 3- Validate Invoice with your e-signature! - on 2nd page ')
            $('#po-sign-btn').hide()
            $('#invoice-sign-btn').show()
        }
        if (invoiceSigned) {
            $('#pdf-render3').hide()
            $('#process-msg').text('');
            $('#process-msg').append('Step 4- Review and approve your documents!')
            $('#invoice-sign-btn').hide()
            $('.signature').hide()
            $('.validate-docs').show()
        }

    }
}