$(document).ready(function() {
    $(".file").on('click', function(e) {
        $('.process-loader').fadeIn('slow')

        let id = e.target.id.split('!')[0];
        $.ajax({
            type: "DELETE",
            url: "/delete/" + id,
        }).done(function(o) {
            $('.process-loader').fadeOut('slow')
            window.location.reload();
        })
    });
});