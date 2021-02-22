const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let url = '/uploads/sample.pdf';

window.addEventListener('load', () => {

    canvas.height = window.innerHeight / 8;
    canvas.width = window.innerWidth / 3;

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
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        ctx.textBaseline = 'Top';
        ctx.fillStyle = 'white';
        ctx.fillText(`signed by -Laszlo Bedekovics at ${today}`, (canvas.width / 15), (canvas.height / 4));

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


function downloadCanvas() {
    let signo = document.getElementById('canvas').toDataURL("image/png");

    // const timeElapsed = Date.now();
    // const today = new Date(timeElapsed);
    // // ctx.textBaseline = 'Top';
    // ctx.fillStyle = 'white';
    // ctx.fillText(`Laszlo Bedekovics ${today}`, (canvas.width / 4), (canvas.height / 4));

    $.ajax({
        type: "POST",
        url: "/getsigno",
        data: {
            imgBase64: signo
        }
    }).done(function(o) {
        console.log('saved');

    });
}

document.getElementById('upload').addEventListener('click', function() {
    $('.process-loader').fadeIn('slow')
    downloadCanvas();
    setTimeout(function() {
        window.location.reload()
    }, 3000);
}, false);

// Pdf viewer

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1,
    canvas2 = document.querySelector('#pdf-render'),
    ctx2 = canvas2.getContext('2d');

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
        document.querySelector('body').insertBefore(div, canvas);
        // Remove top bar
        document.querySelector('.top-bar').style.display = 'none';
    });

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);