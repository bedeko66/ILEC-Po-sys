let purchaseOrderFilled = false;
let signoPanelDisplayed = false;
let poSigned = false;
let invoiceSigned = false;

// Pdf viewer
const canvas2 = document.querySelector('#pdf-render');
const ctx2 = canvas2.getContext('2d');

const pdfViewer = url => {

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

            const renderCtx = {
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

    // Get Document
    if (pdfDoc) {
        console.log('destroy');
        pdfDoc.destroy();
    }

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
let view_invoice = '/uploads/orig_invoice.pdf';
pdfViewer(view_invoice)

//-------------------------------------------------------------
// Save po to pdf
function savePo() {
    $('.process-loader').fadeIn('slow')

    let purchaseOrder = {
        poId: $('#po-ref').val(),
        supplier: $('#supplier').val(),
        attention: $('#attention').val(),
        department: $('#department option:selected').text(),
        orderDate: $('#order-date').val(),
        description: $('#description').val()
    }

    $.ajax({
        type: "POST",
        url: "/generate-purchase-order",
        data: {
            purchaseOrder
        }
    }).done(function(o) {
        setTimeout(function() {
            pdfViewer('/uploads/merged.pdf')
            purchaseOrderFilled = true
            statusControl()
            $('.process-loader').fadeOut('slow')
        }, 3000);
    });


}
//----------------------------------------------------
// Add Signature to docs

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
    const today = new Date(timeElapsed);
    ctx.fillText(`signed by -Laszlo Bedekovics at ${today}`, (canvas.width / 15), (canvas.height / 4));

    let signo = document.getElementById('canvas').toDataURL("image/png");

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            signo,
            invoicePageNum: 0
        }
    }).done(function(o) {
        setTimeout(function() {
            pdfViewer('/uploads/output.pdf')
            poSigned = true;
            statusControl()
            clearCanvas()
            $('.process-loader').fadeOut('slow')
        }, 3000);
    });
}

function addSignatureToInvoice() {
    $('.process-loader').fadeIn('slow')
    let signo = document.getElementById('canvas').toDataURL("image/png");

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            signo,
            invoicePageNum: 1
        }
    }).done(function(o) {
        setTimeout(function() {
            pdfViewer('/uploads/output.pdf')
            invoiceSigned = true;
            statusControl()
            clearCanvas()
            $('.process-loader').fadeOut('slow')
        }, 3000);
    });
}

function validateDocs() {
    alert('Thank you')
    resetStatus()
    $('form :input').val('');
}

//-------------------------------------------------------------
// Status Controller

function resetStatus() {

    purchaseOrderFilled = false;
    signoPanelDisplayed = false;
    poSigned = false;
    invoiceSigned = false;
    $('.purchase-order-form').show()
    $('.signature').hide()
    $('#po-sign-btn').show()
    $('#invoice-sign-btn').hide()

}

function statusControl() {

    if (purchaseOrderFilled) {

        $('.purchase-order-form').hide()
        $('#process-msg').text('');
        $('#process-msg').append('Step 2-> Validate Purchase Order with your e-signature!')
        signoPanelDisplayed = true
        $('.signature').show()

    }

    if (signoPanelDisplayed) {
        if (poSigned) {
            $('#process-msg').text('');
            $('#process-msg').append('Step 3-> Validate Invoice with your e-signature! /on 2nd page ')
            $('#po-sign-btn').hide()
            $('#invoice-sign-btn').show()
        }
        if (invoiceSigned) {
            $('#process-msg').text('');
            $('#process-msg').append('4. Review and approve your Documents!')
            $('#invoice-sign-btn').hide()
            $('.signature').hide()
            $('.validate-docs').show()
        }

    }
}