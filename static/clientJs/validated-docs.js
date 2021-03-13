$(document).ready(function() {
    $(".file").on('click', function(e) {
        $('.process-loader').fadeIn('slow')
        let id = e.target.id.split('!')[0];
        let filename = e.target.id.split('!')[1];

        $.ajax({
            type: "POST",
            url: "/copy",
            data: {
                src: 'static/documents/to-validate/' + filename,
                dest: 'static/templates/orig_invoice.pdf'
            }
        }).done(function(o) {
            location.assign(`/invoice-validator/` + id)
            $('.process-loader').fadeOut('slow')
        })
    });
});