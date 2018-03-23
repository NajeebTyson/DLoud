$(document).ready(function () {
    var drivePath = [''];

    function  getDriveFiles(parent_folder, files) {
        var gdr;
        gdR = $.getJSON('/app_api/dloud/drive/files', {parentFolder: arguments[0]}).done(function (data) {
            files(data);
            gdr = null;
        });
        var text = ' <span class="drivePathListItem">..</span> /';
        for(var i=1; i<drivePath.length; i++){
            if(i === drivePath.length-1){
                text += ' '+drivePath[i] +" /";
                continue;
            }
            text += ' <span class="drivePathListItem">'+drivePath[i]+'</span> /';
        }
        $('#drivePath').html(text);
    }
    // file uploading

    $('#uploadFileId').on('click', function () {
        var filename = $('#uploadFilename').val();
        var newParent = drivePath[drivePath.length - 1];
        if(filename === '' || filename.length === 0) {
            var warningBar = $("#file-modal-warning");
            warningBar.css('display', 'block').html('<i class="fa fa-fw fa-warning"></i>Enter a name for file.')
            warningBar.delay(5000).fadeOut();
            return;
        }
        var data = new FormData();
        var files = $("#yoFile").get(0).files;
        if (files.length > 0) {
            data.append(filename, files[0]);
        }
        console.log(files);
        var ajaxRequest = $.ajax({
            type: "POST",
            url: "/uploadFile?parentFolder="+newParent,
            contentType: false,
            processData: false,
            data: data
        });
        ajaxRequest.done(function (xhr, textStatus) {
            $('#new-file-modal').modal('toggle');
            getDriveFiles(newParent, function (data) {
                addFilesToList('#driveList', data.files);
            });
        }).always(function () {
            $('#uploadFilename').val('');
        });
    });

    $("#upload").on('click', function () {
        $.post( "/updown", function( data ) {
            var url = data.url;
            $('#download').attr('href', url);
        });
    });
});