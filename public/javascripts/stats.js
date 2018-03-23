$(document).ready(function () {

    var Months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    var Years = [];

    var pageHeader = document.getElementById("statHeader");

    var logYearOption = $("#logYear");
    var statYear = $("#statYear");
    var year = new Date().getFullYear();
    var fileId = pageHeader.getAttribute('data-fileid');
    var filename = pageHeader.getAttribute('data-filename');
    var titleText = "";
    var myBarChart;

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function updateStats(ctx, data) {
        var myBarChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    }

    function makeDataSet(data, labels) {
        var dataset = {};
        for (var p=0; p<data.length; p++) {
            var po = {};
            for (var l=0; l<labels.length; l++) {
                po[labels[l]] = 0;
            }
            for (var m=0; m<data[p].logs.length; m++) {
                po[labels[data[p].logs[m].month]] = data[p].logs[m].count;
            }
            dataset[data[p]._id] = po;
        }
        return dataset;
    }
    var fetchedData = { 'value': false};
    var yearlyData = 0;

    function changeTitle() {
        titleText = "Stats of "+filename+" of year "+year;
    }

    function drawChart(myData) {
        delete myBarChart;
        var APIarray = makeDataSet(myData, Months);
        var ctx = document.getElementById("statYearly").getContext('2d');
        var data = {
            labels: [],
            datasets: []
        };
        Chart.pluginService.register({
            beforeInit: function (chart) {
                data.labels = Months;
                for (var p in APIarray) {
                    var po = {};
                    var r = getRandomInt(0, 256);
                    var g = getRandomInt(0, 256);
                    var b = getRandomInt(0, 256);
                    po.label = p;
                    //po.backgroundColor = "rgba(75,192,192,0.4)";
                    //po.fill = false;
                    //po.borderColor = "rgba(" + r + "," + g + "," + b + ", 1)";
                    po.backgroundColor = "rgba(" + r + "," + g + "," + b + ", 1)";
                    po.data = [];
                    for (var m in APIarray[p]) {
                        po.data.push(APIarray[p][m]);

                    }
                    data.datasets.push(po);
                }
            }
        });
        myBarChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
                responsive: false,
                title: {
                    display: true,
                    text: titleText
                }
            }
        });
    }

    function fetchYearlyStat() {
        $.getJSON('/log_api/dloud/drive/stats-file', {
            filename: filename,
            fileId: fileId,
            year: year
        }).done(function (myData) {
            yearlyData = myData;
            //fetchedData.value = true;
            if (yearlyData.status) {
                if (yearlyData.status === 'ERROR')
                    console.log('operation failed!.');
            } else {
                changeTitle();
                drawChart(yearlyData);
            }
        });
    }

    if(window.location.pathname === '/dloud/stats') {
        $("#logYear option").each(function () {
            Years.push(parseInt($(this).val()));
        });
        year = Math.max.apply(Math, Years);
        fetchYearlyStat();
    }

    fetchedData.watch('value', function (id, oldval, newval) {
        if(newval === true) {
            fetchedData.value = false;
        }
        if (yearlyData.status) {
            if (yearlyData.status === 'ERROR')
                console.log('operation failed!.');
        } else {
            drawChart(yearlyData);
        }
    })
    
    logYearOption.on('change', function () {
        year = this.value;
        fetchYearlyStat();
    });

});





































/*
 var myData = [
 {

 '_id': "Gilgit",
 'count': 2,
 'logs': [{
 'count': 1,
 'month': 6
 },{
 'count': 2,
 'month': 7
 }, {
 'count': 4,
 'month': 9}]
 },
 {

 '_id': "Punjab",
 'count': 4,
 'logs': [{
 'count': 2,
 'month': 5
 },{
 'count': 4,
 'month': 6
 }, {
 'count': 8,
 'month': 2}]
 }
 ];
 console.log(myData);
 statYear.text(' - '+year);
 var APIarray = makeDataSet(myData, Months);
 console.log(APIarray);
 var ctx = document.getElementById("statYearly").getContext('2d');
 var data = {
 labels: [],
 datasets: []
 };
 Chart.pluginService.register({
 beforeInit: function (chart) {
 //var data = chart.config.data;
 // for(var p in APIarray) {
 //     for(var m in APIarray[p]) {
 //         data.labels.push(m)
 //     }
 //     break;
 // }
 data.labels = Months;
 for (var p in APIarray) {
 var po = {};
 var r = getRandomInt(0, 256);
 var g = getRandomInt(0, 256);
 var b = getRandomInt(0, 256);
 po.label = p;
 //po.backgroundColor = "rgba(75,192,192,0.4)";
 //po.fill = false;
 //po.borderColor = "rgba(" + r + "," + g + "," + b + ", 1)";
 po.backgroundColor = "rgba(" + r + "," + g + "," + b + ", 1)";
 po.data = [];
 for (var m in APIarray[p]) {
 po.data.push(APIarray[p][m]);

 }
 data.datasets.push(po);
 }
 console.log(data);
 }
 });
 var myBarChart = new Chart(ctx, {
 type: 'bar',
 data: data,
 options: {
 scales: {
 yAxes: [{
 ticks: {
 beginAtZero:true
 }
 }]
 },
 responsive: false,
 title: {
 display: true,
 text: titleText
 }
 }
 });
 */
