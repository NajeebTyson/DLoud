$(document).ready(function () {
    var quizCanvas = $("#quizStatCanvas");
    var quizData = JSON.parse(quizCanvas.attr('data-quiz'));

    function extractLabels(data) {
        var labels = [];
        for(var i=0; i<data.passed.length; i++) {
            labels.push(data.passed[i].location)
        }
        for(var i=0; i<data.failed.length; i++) {
            var isPresent = false;
            for (var j=0; j<labels.length; j++) {
                if(labels[j] === data.failed[i].location) {
                    isPresent = true;
                }
            }
            if (isPresent === false) {
                labels.push(data.failed[i].location);
            }
        }
        return labels;
    }

    function extractPassData(data, labels) {
        var pd = [];
        for(var l=0; l<labels.length; l++){
            var lv = 0;
            for(var i=0; i<data.passed.length; i++) {
                if(labels[l] === data.passed[i].location) {
                    lv = data.passed[i].counter;
                    break;
                }
            }
            pd.push(lv)
        }
        return pd;
    }

    function extractFailData(data, labels) {
        var fd = [];
        for(var l=0; l<labels.length; l++){
            var lv = 0;
            for(var i=0; i<data.failed.length; i++) {
                if(labels[l] === data.failed[i].location) {
                    lv = -1*data.failed[i].counter;
                    break;
                }
            }
            fd.push(lv)
        }
        return fd;
    }

    var labels = extractLabels(quizData);
    var passData = extractPassData(quizData, labels);
    var failData = extractFailData(quizData, labels);


    var quizChartData = {
        labels: labels,
        datasets: [{
            label: 'Pass',
            backgroundColor: "#1eab2f",
            data: passData
        }, {
            label: 'Fail',
            backgroundColor: "#cc2026",
            data: failData
        }]

    };

    var ctx = document.getElementById("quizStatCanvas").getContext("2d");
    window.myBar = new Chart(ctx, {
        type: 'bar',
        data: quizChartData,
        options: {
            title:{
                display:true,
                text:"Province wise stat of quiz: "+quizData.title
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            responsive: false,
            scales: {
                xAxes: [{
                    stacked: true,
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
/*
    document.getElementById('randomizeData').addEventListener('click', function() {
        quizChartData.datasets.forEach(function(dataset, i) {
            dataset.data = dataset.data.map(function() {
                return randomScalingFactor();
            });
        });
        window.myBar.update();
    });
*/
});