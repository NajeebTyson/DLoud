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
    
    function addFilesToList(listDiv, files) {
        var myList = $(listDiv);
        myList.empty();
        for (var i=0; i<files.length; i++) {
            if (files[i].fType === 'folder')
                myList.append('<li class="driveListItem"><div class="btn-group drop-down"><i class="fa fa-ellipsis-v fa-fw dropdown-toggle " data-toggle="dropdown"aria-haspopup="true" aria-expanded="false"></i><ul class="dropdown-menu item-opt-dropdown" data-filename="' + files[i].name + '" data-fileId="' + files[i]._id + '"><li class="d-list-item">Info</li></ul></div><a data-filetype="' + files[i].fType + '"><h2 class="text-center doc-icon"><i class="fa fa-fw -text fa-folder-open"></i></h2><h2 class="text-center doc-name">' + files[i].name + '</h2></a></li>');
            else {
                myList.append('<li class="driveListItem"><div class="btn-group drop-down"><i class="fa fa-ellipsis-v fa-fw dropdown-toggle" data-toggle="dropdown"aria-haspopup="true" aria-expanded="false"></i><ul class="dropdown-menu item-opt-dropdown" data-filename="' + files[i].name + '" data-fileId="' + files[i]._id + '"><li class="d-list-item" ><a target="_blank" href="/app_api/dloud/drive/download-file?filename='+files[i].name+'&fileId='+files[i]._id+'">Download</a></li><li class="d-list-item" ><a target="_blank" href="/dloud/stats?filename='+files[i].name+'&fileId='+files[i]._id+'">Stats</a></li><li class="d-list-item" >Delete</li><li class="d-list-item" data-toggle="modal" data-target="#restrict-member-modal" role="button">Restict</li></ul></div><a data-filetype="' + files[i].fType + '"><h2 class="text-center doc-icon"><i class="fa fa-fw -text fa-file"></i></h2><h2 class="text-center doc-name">' + files[i].name + '</h2></a></li>');
            }
        }
    }
    
    function  getProjectMembers(pName) {
        var gpmR;
        gpmR = $.getJSON('/app_api/dloud/drive/members', {projectName: pName}).done(function (data) {
            var memList = $('#projectMembers');
            var restrictSelect = $("#restrictMemberSelect");

            for (var i=0; i<data.length; i++){
                var name = ''+data[i].local.name.first +' '+ data[i].local.name.last;
                memList.append('<li class="list-group-item" data-id="'+data[i]._id+'">'+name+'<i class="fa fa-fw fa-lg fa-remove pull-right text-danger rm-mem"></i></li>');
                restrictSelect.append($('<option>', {
                    value: data[i]._id,
                    text: name
                }));
            }
            gpmR = null;
        });
    }

    function getAllUsers(pName) {
        var gauR;
        gauR = $.getJSON('/app_api/dloud/drive/all-users', {projectName: pName}).done(function (data) {
            console.log(data);
            var memList = $('#addMemberSelect');
            for (var i=0; i<data.length; i++){
                var name = ''+data[i].local.name.first +' '+ data[i].local.name.last;
                memList.append($('<option>', {
                    value: data[i]._id,
                    text: name
                }));
            }
            gauR = null;
        });
    }

    function showNotify(title, message, type) {
        $.notify({
            title: '<strong>'+title+'!</strong>',
            message: message,
            animate: {
                enter: 'animated zoomInDown',
                exit: 'animated zoomOutUp'
            }
        },{
            type: type
        });
    }
    
    if(window.location.pathname === '/portal') {
        getDriveFiles('', function (data) {
            addFilesToList('#driveList', data.files);
        });
        // getting project member names
        var projectName = "DLoud";
        getAllUsers(projectName);
        var foo = 1;
        while(foo<1000){
            foo += 1;
        }
        getProjectMembers(projectName);

        //getting all users
    }

    //remove member
    $("#projectMembers").on('click', 'li i.rm-mem', function () {
        var memId = $(this).parent().attr('data-id');
        var rmR;
        rmR = $.getJSON('/app_api/dloud/drive/remove-member', {projectName: pName, user: memId}).done(function (data) {
            if(data.status === 'NA') {
                showNotify('Now Allowed', 'You are not authorized to remove any member.', 'warning');
            } else {
                showNotify('Removed', 'Member removed from group.', 'success');
                var memList = $('#addMemberSelect');
                for (var i=0; i<data.length; i++){
                    var name = ''+data[i].local.name.first +' '+ data[i].local.name.last;
                    memList.append($('<option>', {
                        value: data[i]._id,
                        text: name
                    }));
                }
            }
            rmR = null;
        }).always(function () {
            getProjectMembers(pName);
            getAllUsers(pName);
        });
    });

    //add member
    pName = 'DLoud';
    $("#addMemberBtn").on('click', function () {
        var user = $('#addMemberSelect').val();
        var addModal = $('#add-member-modal');
        if(user === null) {
            addModal.modal('toggle');
            return;
        }
        var amR;
        amR = $.getJSON('/app_api/dloud/drive/add-member', {projectName: pName, user: user}).done(function (data) {
            if(data.status === 'NA') {
                showNotify('Not Allowed', 'You are not authorized ot add member to this group.', 'warning');
            } else {
                showNotify('Added', 'Member is added to this group.', 'success');
                var memList = $('#addMemberSelect');
                for (var i=0; i<data.length; i++){
                    var name = ''+data[i].local.name.first +' '+ data[i].local.name.last;
                    memList.append($('<option>', {
                        value: data[i]._id,
                        text: name
                    }));
                }
            }
            amR = null;
        }).always(function () {
            getProjectMembers(pName);
            getAllUsers(pName);
        });
        addModal.modal('toggle');
    });

    // restrict member for file
    $("#restrictMemberBtn").on('click', function () {
        var user = $('#restrictMemberSelect').val();
        var restrictModal = $('#restrict-member-modal');
        if(user === null) {
            restrictModal.modal('toggle');
            return;
        }
        var rmR;
        rmR = $.getJSON('/app_api/dloud/drive/restrict-member', {fileName: pName, user: user}).done(function (data) {
            if(data.status === 'NA') {
                showNotify('Not Allowed', 'You are not authorized ot add member to this group.', 'warning');
            } else {
                showNotify('Added', 'Member is added to this group.', 'success');
                var memList = $('#addMemberSelect');
                for (var i=0; i<data.length; i++){
                    var name = ''+data[i].local.name.first +' '+ data[i].local.name.last;
                    memList.append($('<option>', {
                        value: data[i]._id,
                        text: name
                    }));
                }
            }
            rmR = null;
        }).always(function () {
            getProjectMembers(pName);
            getAllUsers(pName);
        });
        addModal.modal('toggle');
    });

    //make folder
    $("#addFolderBtn").on("click", function () {
        var folderName = $("#folderName").val();
        if (folderName.length > 0) {
            $.getJSON('/app_api/dloud/drive/make_folder', {newFolder: folderName, parentFolder: drivePath[drivePath.length-1]}).done(function (status) {
                var newParent = drivePath[drivePath.length - 1];
                var warningBar = $("#folder-modal");
                if(status.status === 'done') {
                    $('#new-folder-modal').modal('toggle');
                    getDriveFiles(newParent, function (data) {
                        addFilesToList('#driveList', data.files);
                    });
                } else if(status.status === 'already') {
                    warningBar.css('display', 'block').html('<i class="fa fa-fw fa-warning"></i>Folder already present with this name.')
                    warningBar.delay(5000).fadeOut();
                } else if(status.status === 'error' && status.status === 'errorSave') {
                    warningBar.css('display', 'block').html('<i class="fa fa-fw fa-warning"></i>something went wrong, try again.')
                    warningBar.delay(5000).fadeOut();
                } else if(status.status === 'fail') {
                    warningBar.css('display', 'block').html('<i class="fa fa-fw fa-warning"></i>something went wrong, try again.')
                    warningBar.delay(5000).fadeOut();
                }
            }).always(function () {
                $('#folderName').val('');
            });
        }
    });

    // download and remove
    $("#driveList").on('click', '.driveListItem .drop-down .item-opt-dropdown li', function () {
        var myData = $(this).parent();
        if(myData.parent().next().data('filetype') === 'file') {
            var newParent = drivePath[drivePath.length - 1];
            var fileName = myData.data("filename");
            var id = myData.data("fileid");
            if($(this).html() === 'Delete'){
                $.getJSON('/app_api/dloud/drive/delete-file', {filename: fileName, fileId: id}).done(function (data) {
                    if(data.status === 'removed') {
                        getDriveFiles(newParent, function (data) {
                            addFilesToList('#driveList', data.files);
                        });
                    }
                });
            }
        }
    });

    //click on drive path
    $("#drivePath").on('click', ".drivePathListItem", function () {
        var fname = $(this).text();
        while(drivePath.length > 1){
            if(fname === drivePath.pop()){
                drivePath.push(fname);
                break;
            }
        }
        console.log(drivePath);
        if(drivePath.length === 1){
            fname = "";
        } else {
            fname = drivePath[drivePath.length-1];
        }
        getDriveFiles(fname, function (data) {
            addFilesToList('#driveList', data.files);
        });
    });

    //click on folder
    $("#driveList").on('click', '.driveListItem a', function () {
        if($(this).data('filetype') === 'folder') {
            var fileName = $(this).children('h2').eq(1).html();
            $.getJSON('/app_api/dloud/drive/openFile', {filename: fileName}).done(function (file) {
                if (file.fType === 'folder') {
                    drivePath.push(fileName);
                    getDriveFiles(fileName, function (data) {
                        addFilesToList('#driveList', data.files);
                    });
                }
            });
        }
    });

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
    
    // download file
    $(".drop-down .dropdown-menu").on('click', 'li.d-list-item', function () {
        var filename = $(this).parent().data("filename");
        var id =$(this).parent().data("_id");
        console.log(filename);
        console.log(id);
        console.log($(this).html());
    });

    $("#yoFile").bind('change', function () {
        $("#fileSize").html( Math.round((this.files[0].size/1024)*100)/100 + ' KB');
    });

    //portal log script
    
    function  getLog(collection, count, skip, files) {
        var gdr;
        gdR = $.getJSON('/log_api/dloud/drive/', {collection: collection,count: count,skip: skip}).done(function (data) {
            files(data);
            // gdr = null;
        });
        // gdr = $.ajax({
        //     dataType: "json",
        //     url: '/log_api/dloud/drive/',
        //     data: {'collection': collection,'count': count,'skip': skip},
        //     async: "true",
        //     success: function (data) {
        //         files(data);
        //         gdr = null;
        //     }
        // });

    }

    function addLogToView(table, files) {
        var myTable = $(table[0]);
        for(var i=0; i<files.length; i++) {
            var row = '<tr>';
            row += '<td>'+(i+1)+'</td>';
            var keys = Object.keys(files[i]);
            for(var j=0; j<keys.length; j++) {
                if(keys[j] === 'updatedAt'){
                    continue;
                }
                if(keys[j]==='userIp'  && files[i][keys[j]]==='::1'){
                    row += '<td>127.0.0.1</td>';
                        continue;
                }
                row += '<td>'+files[i][keys[j]];
            }
            row += '</td>';
            myTable.append(row)
        }
    }

    //file download log

    var createFolderLogModel = "createFolderLog";
    var fileDeleteLogModel = "fileDeleteLog";
    var addMemberLogModel =     "addMemberLog";
    var removeMemberLogModel =     "removeMemberLog";
    var fileDownloadLogModel =     "fileDownloadLog";
    var fileUploadLogModel =     "fileUploadLog";
    var userLoginLogModel =     "userLoginLog";

    var logFileDownloadTable = ["#logFileDownload", 6];
    var logFileUploadTable = ["#logFileUpload", 6];
    var logFileDeleteTable = ["#logFileDelete", 6];
    var logLoginTable = ["#logLogin", 5];
    var logAddMemberTable = ["#logAddMember", 6];
    var logRemoveMemberTable = ["#logRemoveMember", 6];
    var logCreateFolderTable = ["#logCreateFolder", 6];

    /*if(window.location.pathname === '/portal') {
        var firstCount = 20;
        var firstSkip = 0;
        //file download
        getLog(fileDownloadLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logFileDownloadTable, data);
        });
        //file upload
        getLog(fileUploadLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logFileUploadTable, data);
        });
        //file delete
        getLog(fileDeleteLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logFileDeleteTable, data);
        });
        //login
        getLog(userLoginLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logLoginTable, data);
        });
        //add member
        getLog(addMemberLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logAddMemberTable, data);
        });
        //remove member
        getLog(removeMemberLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logRemoveMemberTable, data);
        });
        //create folder
        getLog(createFolderLogModel, firstCount, firstSkip, function (data) {
            addLogToView(logCreateFolderTable, data);
        });
    }*/

    var logActivity = {
        login: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        fileDownload: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        fileUpload: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        addMember: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        removeMember: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        createFolder: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        },
        fileDelete: {
            firstClick: false,
            firstCount: 20,
            firstSkip: 0
        }
    };

    /*$('#userLoginLogBtn').on('click', function () {
        if(logActivity.login.firstClick === true) {
            logActivity.login.firstCount += logActivity.login.firstCount;
        }
        logActivity.login.firstClick = true;
        getLog(userLoginLogModel, logActivity.login.firstCount, logActivity.login.firstSkip, function (data) {
            addLogToView(logLoginTable, data);
        });
    });*/
});