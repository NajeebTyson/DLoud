$(document).ready(function () {

    function showNotify(title, message, type) {
        $.notify({
            title: title,
            message: message
        },{
            type: type
        });

    }
    // create quiz file
    var qId;

    function getQuestions(qId, files) {
        $.getJSON('/app_api/dloud/quiz/data', {qId: qId}).done(function (data) {
            files(data);
        });
    }

    function showQuestions(divId, files) {
        var divL = $(divId);
        if (files.countQuestions === 0) {
            divL.html('<p>No questions for this quiz yet. Add questions.</p>')
            $('#holdQuizSubmitBtn').css('display', 'none');
        } else{
            aq = '';
            for (var q=0; q<files.countQuestions;q++) {
                aq += '<h4><strong>Q: '+(q+1)+'.</strong> &nbsp;&nbsp;'+files.questions[q].question+'</h4><br>';
                for (var o=0; o<files.questions[q].qOptions.length; o++) {
                    if (files.questions[q].qOptions[o] === files.questions[q].correctOption) {
                        aq += '<p &nbsp;&nbsp;  class="que_opt text-success">'+files.questions[q].qOptions[o]+'</p>'
                    } else {
                        aq += '<p &nbsp;&nbsp;  class="que_opt">'+files.questions[q].qOptions[o]+'</p>';
                    }

                }
                aq += '<hr>';
            }
            divL.html(aq);
        }
    }

    function getAndShowQuiz(qId) {
        getQuestions(qId, function (data) {
            data = data[0];
            showQuestions("#quizQuestions", data);
        });
    }
    
    $("#addOptionBtn").on('click', function () {
        var addOptDiv = $("#newOption");
        addOptDiv.css("display", "block");
        $("#newOptionBtn").on('click', function () {
            var newOptionText = $("#newOptionText");
            if(newOptionText.val() === ""){
                showNotify("Oops!", "Enter an option", "warning");
            } else {
                $("#qOptions").append('<li><div class="radio"><label><input class="radioOption" name="rOpt" type="radio"/><span class="radioOptionText">'+newOptionText.val()+'</span></label></div></li>');
                newOptionText.val("");
            }
            addOptDiv.css("display", "none");
        });

    });

    $("#removeOptionBtn").on('click', function () {
        var optList = document.getElementById("qOptions");
        for (var i=0; i<optList.childNodes.length; i++) {
            if (optList.children[i].getElementsByClassName('radioOption')[0].checked) {
                optList.removeChild(optList.children[i]);
                break;
            }
        }
    });

    $("#addQuestionBtn").on('click', function () {
        var questionText = $("#qBox");
        var qId = $(this).attr('data-qId');
        if(questionText.val() === "") {
            showNotify("Oops!", "Enter the question", "warning");
            return;
        }
        var myOptionsRadio = $('.radioOption').toArray();
        var myOptionsText = $('.radioOptionText').toArray();
        if(myOptionsText.length <= 1) {
            showNotify("Oops!", "Enter more than one option", "warning");
            return;
        }
        var quizId = $("#quizId").text();
        var questionOptions = [];
        var correctOption = "";
        var anyRadioChecked = false;
        for (var i=0; i<myOptionsText.length; i++) {
            questionOptions.push(myOptionsText[i].innerHTML);
            if(myOptionsRadio[i].checked === true) {
                correctOption = myOptionsText[i].innerHTML;
                anyRadioChecked = true;
            }
        }
        if(anyRadioChecked === false) {
            showNotify("Oops!", "Select the correct option", "warning");
            return;
        }
        $('#add-option-modal').modal('toggle');
        $.ajax({
            url: "/app_api/dloud/quiz/add-question",
            type: 'POST',
            dataType: 'json',
            data: {
                question: questionText.val(),
                qOptions: questionOptions.join("&"),
                cOption: correctOption,
                quizId: quizId
            },
            done: function () {
                getAndShowQuiz(qId);
            }
        });
        questionText.val("");
        $("#qOptions").html("");
        $("#newOptionText").val("");
    });

    if(location.pathname.substr(0,10) === '/hold-quiz') {
        qId = $('#qBox').attr('data-qId');
        getAndShowQuiz(qId);
    }
    if(location.pathname.substr(0,14) === '/complete-quiz'){
        qId = $("#quizId").text();
        getAndShowQuiz(qId);
    }

    // if(location.pathname.substr(0,1) === '/') {
    //     $.getJSON('/latest-quizzes').done(function (data) {
    //
    //     });
    // }
});