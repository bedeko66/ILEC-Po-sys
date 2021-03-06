let purchaseOrderFilled = false;
let signoPanelDisplayed = false;
let poSigned = false;

const user = document.getElementById("user").innerText;
let signed_at;
let poId;


// Pdf viewer
const c2 = document.querySelector('#pdf-render');
const context2 = c2.getContext('2d');

const c3 = document.querySelector('#pdf-render2');
const context3 = c3.getContext('2d');

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
let dptLtr;
$(document).ready(function() {
    $('#department').on('click', function() {
        dptLtr = $('#department option:selected').text()[0];
        poId = `${dptLtr}-${Math.round(Math.random() * (90000000000 - 10000000000) + 10000000000)}`;
        $('#po-ref').val(poId);
    });
});

function getPoTotal() {
    let itemsArr = []
    $("#products-table tr:gt(0)").each(function() {
        let this_row = $(this);
        let item_gross = parseFloat($.trim(this_row.find('td:eq(4)').html()))

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
        // console.log(parseFloat($('#po-ttl').text()));
}
getPoTotal()
    //-------------------------------------------------------------
$('#products-table').SetEditable({
    $addButton: $('#addNewRow')
});
//-------------------------------------------------------------
// Save po to pdf
function savePo() {
    $('.process-loader').fadeIn('slow')
    getPoTotal()
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

    const po_ttl = parseFloat($('#po-ttl').text());
    const purchaseOrder = {
        poId: $('#po-ref').val(),
        supplier: $('#supplier').val(),
        attention: $('#attention').val(),
        department: $('#department option:selected').text(),
        orderDate: $('#order-date').val(),
        comments: $('#comments').val(),
        po_ttl,
        itemsArr,
    }

    $.ajax({
        type: "POST",
        url: "/generate-purchase-order",
        data: {
            purchaseOrder,
            from: 'po-creator'
        }
    }).done(function(o) {
        setTimeout(function() {
            purchaseOrderFilled = true
            stateControl()
            pdfViewer('../static/templates/purchase-order.pdf', c2, context2)
            $('.process-loader').fadeOut('slow')
        }, 3000);
    });


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

    const timeElapsed = Date.now();
    signed_at = new Date(timeElapsed);
    ctx.fillText(`signed by -${user} at ${signed_at}`, (canvas.width / 15), (canvas.height / 4));


    let signo = document.getElementById('canvas').toDataURL("image/png");

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            signo,
            invoicePageNum: 0,
            from: 'po-creator'
        }
    }).done(function(o) {
        poSigned = true;
        stateControl()
    });

    setTimeout(function() {
        clearCanvas()
        pdfViewer('../static/templates/output.pdf', c3, context3)
        $('.process-loader').fadeOut('slow')
    }, 3000);
}


function validateDocs() {

    $('.process-loader').fadeIn('slow')
    getPoTotal()
    let file_name = poId + '.pdf'
    let itemsArr = []
    let this_row;
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
        poId: poId,
        document_user: user,
        supplier: $('#supplier').val(),
        manager: $('#attention').val(),
        department: $('#department option:selected').text(),
        orderDate: $('#order-date').val(),
        comments: $('#comments').val(),
        status: 'po-awaiting-for-invoice',
        po_signed_by: user,
        po_signed_at: signed_at,
        po_ttl: parseFloat($('#po-ttl').text()),
        file_name,
        itemsArr
    }
    $.ajax({
        type: "POST",
        url: '/add-purchase-order',
        data: {
            purchaseOrder,
            src: 'static/templates/output.pdf',
            dest: 'static/documents/purchase-orders/' + file_name
        }
    }).done(function(o) {
        location.assign('/purchase-orders')
        $('.process-loader').fadeOut('slow')
    });

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
    $('.purchase-order-form-new').show()
    $('.signature').hide()
    $('#po-sign-btn').show()
    $('#invoice-sign-btn').hide()

}

function stateControl() {

    if (purchaseOrderFilled) {
        $('#pdf-render').hide()
        $('.purchase-order-form-new').hide()
        $('#process-msg').text('');
        $('#process-msg').append('Step 2- Validate purchase order with your e-signature!')
        signoPanelDisplayed = true
        $('.signature').show()
        $('.po-viewer').show()

    }

    if (signoPanelDisplayed) {
        if (poSigned) {

            $('#process-msg').text('');
            $('#po-sign-btn').hide()

            $('#process-msg').text('');
            $('#process-msg').append('Step 3- Review and approve your purchase order!')
            $('#invoice-sign-btn').hide()
            $('.signature').hide()
            $('.validate-docs').show()
        }

    }
}