$(document).ready(function() {

    var locations = ['AJK', 'Balochistan', 'Gilgit-Baltistan', 'KPK', 'Punjab', 'Sindh'];

    $("#show-pass").on("mousedown",function () {
        $("#pass").attr("type", "text");
    }).on("mouseup", function () {
        $("#pass").attr("type", "password");
    });

    var signupArea = $('#area');
    for (var i=0; i<locations.length; i++) {
        signupArea.append('<option val="'+locations[i]+'">'+locations[i]+'</option>');
    }

});