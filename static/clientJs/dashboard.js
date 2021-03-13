$(document).ready(function() {
    let id;
    let filename;
    $(".file").on('click', function(e) {
        // $('.process-loader').fadeIn('slow')
        id = e.target.id.split('!')[0];
        filename = e.target.id.split('!')[1];
        console.log(id);
        console.log(filename);
        // $.ajax({
        //     type: "POST",
        //     url: "/copy",
        //     data: {
        //         src: 'static/documents/to-validate/' + filename,
        //         dest: 'static/templates/orig_invoice.pdf'
        //     }
        // }).done(function(o) {
        //     location.assign(`/invoice-validator/` + id)
        $('.process-loader').fadeOut('slow')

    });
});