/*var hsi = require('./raw/js/hsi.js');
var snp500 = require('./raw/js/snp.js');
var ks200 = require('./raw/js/kospi200.js');
var ks200inv = require('./raw/js/ks200inv.js');*/

var timeFormat = 'YYYY/MM/DD';

var chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};
var color = Chart.helpers.color;
var config;
var balanceColor = undefined;
var chart;
var dd;

// onload
$(function(){
    $('input[name*="data"]', '#single').change(function(obj){
        var s, e;
        if( obj.target.id == "kospi" ){
            s = kospi[0].Date;
            e = kospi[kospi.length - 1].Date;
        } else if( obj.target.id == "snp500" ){
            s = snp[0].Date;
            e = snp[snp.length - 1].Date;
        } else if( obj.target.id == "hsi" ){
            s = hsi[0].Date;
            e = hsi[hsi.length - 1].Date;
        } else if( obj.target.id == "ks200" ){
            s = kospi200[0].Date;
            e = kospi200[kospi200.length - 1].Date;
        }
        
        $("input[name*='start']", '#single').val(s);
        $("input[name*='end']", '#single').val(e);
    });
    $('input[name*="data"]', '#single').change();
    
    $("#mySlidenav a:nth-child(1)").click(function(){
        $("#single").css('display', 'block');
        $('#multiple').css('display', 'none');
        $("#atype").css('display', 'block');
        $('.momentumfunc').css('display', 'none');
        balanceColor = undefined;
    });
    
    $("#mySlidenav a:nth-child(2)").click(function(){
        $("#single").css('display', 'block');
        $('#multiple').css('display', 'none');
        $("#atype").css('display', 'none');
        $('.momentumfunc').css('display', 'block');
        balanceColor = undefined;
    });
    
    $("#mySlidenav a:nth-child(3)").click(function(){
        $("#single").css('display', 'none');
        $('#multiple').css('display', 'block');
        $("#atype").css('display', 'none');
        $('.momentumfunc').css('display', 'block');
        balanceColor = undefined;
        
        $("input[name*='start']", '#multiple').val("2000-01-01");
        var q = new Date();
        $("input[name*='end']", '#multiple').val(`${q.getFullYear()}-${("0"+(q.getMonth()+1)).slice(-2)}-${("0"+q.getDate()).slice(-2)}`);
    });
});


function loadChart() {
    var ctx = document.getElementById('chart').getContext('2d');
    var chartsets = [];
    if( $('#ks200', '#single').is(':checked') ){
        chartsets.push({
            label: "KOSPI200",
            yAxisID: 'data',
            backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
            borderColor: chartColors.green,
            data: kospi200.filter(function(elem){
                return $("input[name*='start']", '#single').val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']", '#single').val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }

    if( $('#snp500', '#single').is(':checked') ){
        chartsets.push({
            label: "S&P500",
            yAxisID: 'data',
            backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
            borderColor: chartColors.red,
            data: snp.filter(function(elem){
                return $("input[name*='start']", '#single').val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']", '#single').val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }

    if( $('#hsi', '#single').is(':checked') ){
        chartsets.push({
            label: "HSI",
            yAxisID: 'data',
            backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
            borderColor: chartColors.blue,
            data: hsi.filter(function(elem){
                return $("input[name*='start']", '#single').val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']", '#single').val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }
    
    if( $('#kospi', '#single').is(':checked') ){
        chartsets.push({
            label: "KOSPI",
            yAxisID: 'data',
            backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
            borderColor: chartColors.green,
            data: kospi.filter(function(elem){
                return $("input[name*='start']", '#single').val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']", '#single').val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }

    config = config || {
        "type": "line",
        "data": {},
        "options":{
            "responsive": false,
            "title":{
                "text":"Chart.js Time Scale"
            },
            "elements":{
                "point":{
                    "radius": 0
                },
                "line":{
                    "fill": false,
                    "capBeizierPoints": false
                }
            },
            "scales":{
                "xAxes":[{
                    "type":"time",
                    "time":{"format":"MM/DD/YYYY HH:mm","tooltipFormat":"ll HH:mm"},
                    "scaleLabel":{"display":false,"labelString":"Date"}
                }],
                "yAxes":[{
                    id: "data",
                    type: "linear",
                    position: "left",
                    "scaleLabel":{"display":false,"labelString":"value"}
                },{
                    id: "balance",
                    type: "linear",
                    position: "right",
                    "scaleLabel": {"display": false, "labelString": "value"}
                }]
            }
        }
    };
    config.data.datasets = chartsets;
    !chart && (chart = new Chart(ctx, config));
    chart.update();
}

function proFPA(){
    var j;
    var ctx = document.getElementById('chart').getContext('2d');
    var simulate;
    if( config.data.datasets[0].label == "KOSPI200" ){
        simulate = kospi200;
    } else if( config.data.datasets[0].label == "S&P500" ){
        simulate = snp;
    } else if( config.data.datasets[0].label == "HSI" ){
        simulate = hsi;
    } else if( config.data.datasets[0].label == "KOSPI" ){
        simulate = kospi;
    }
    var profitArray = [];
    var balance = 100;
    var position = undefined;
    
    var tradeFee = parseFloat($("#fee", '#single').val());
    var upper = $("input[name*='upper']", '#single').val(), lower = $("input[name*='lower']", '#single').val();
    var delayDate = $("#delayDate", '#single').val();
    if( delayDate == 0 ) delayDate = undefined;
    
    var dateStart = undefined, dateEnd = undefined;
    for( var i = 0 ; i < simulate.length ; i ++ ){
        if( !dateStart && simulate[i].Date >= $("input[name*='start']", '#single').val() )
            dateStart = i;
        if( !dateEnd && simulate[simulate.length - i - 1].Date <= $("input[name*='end']", '#single').val() )
            dateEnd = simulate.length - i;
        if( dateStart && dateEnd ) break;
    }
    
    if( dateStart == undefined || dateEnd == undefined ){
        alert('날짜 선택 오류');
        return;
    }
    
    positionCount = undefined;
    for( var i = dateStart ; i < dateEnd ; i ++ ){
        // 지난 달 수익률
        var y = simulate[i].Date.split("-")[0],
            m = simulate[i].Date.split("-")[1],
            d = simulate[i].Date.split("-")[2];
        
        if( positionCount ){
            positionCount --;
            if( positionCount == 0 ){
                positionCount = undefined;
                if( position == undefined ){
                    position = simulate[i].Open * (100 + tradeFee) / 100;
                } else {
                    balance = balance + (simulate[i].Open - position) / position * balance;
                    position = undefined;
                }
            }
        }
        
        // 월 중에는 수익률 계산만 하자.
        if( i == 0 || m == simulate[i-1].Date.split("-")[1] ){
            if( position === undefined ){
                profitArray.push({x: new Date(simulate[i].Date), y: balance});
            }
            else{       // 매수를 했으면
                profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position)/position * balance});
            }
            
            continue;
        }
        
        for( j = i - 1 ; j >= 0 ; j -- ){
            if( simulate[j].Date.split("-")[1] != m ) break;   
        }
        
        var beforeMonthlastIndex = j;
        if( simulate[beforeMonthlastIndex].Date.split("-")[1] == m ){
            if( position === undefined ){
                profitArray.push({x: new Date(simulate[i].Date), y: balance});
                continue;
            }
            else{       // 매수를 했으면
                profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position) / position * balance});
                continue;
            }
            continue;
        } 
        
        for( j = beforeMonthlastIndex ; j >= 0 ; j -- ){
            if( simulate[j].Date.split("-")[1] != simulate[beforeMonthlastIndex].Date.split("-")[1] ) 
                break;
        }
        
        var beforeMonthFirstIndex = j + 1;
        if( j != -1 && simulate[j].Date.split("-")[1] == simulate[beforeMonthlastIndex].Date.split("-")[1] )
            beforeMonthFirstIndex = j;
        
        
        var beforeMonthPercentage = (simulate[beforeMonthlastIndex].Close - simulate[beforeMonthFirstIndex].Open) / simulate[beforeMonthFirstIndex].Open * 100;
        // 2% 상승 및 진입
        console.log(beforeMonthPercentage);
        if( beforeMonthPercentage >= upper && position === undefined ){
            positionCount = delayDate;
            if( !positionCount ) position = simulate[i].Open * (100 + tradeFee) / 100;
        }
        // -1 하락 및 청산
        if( beforeMonthPercentage <= lower && position !== undefined ){
            positionCount = delayDate;
            if( !positionCount ) {
                balance = balance + (simulate[i].Open - position) / position * balance;
                position = undefined;
            }
        }
        
        if( position === undefined ){
            profitArray.push({x: new Date(simulate[i].Date), y: balance});
            continue;
        }
        else{       // 매수를 했으면
            profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position)/position * balance});
            continue;
        }
    }
    
    var maximum = 100;
    var drawdownArray = [];
    for( var i = 0 ; i < profitArray.length ; i ++ ){
        if( maximum < profitArray[i].y )
            maximum = profitArray[i].y;
        drawdownArray.push({x: profitArray[i].x, y: (profitArray[i].y - maximum) / maximum * 100});
    }
    
    var dtx = document.getElementById('drawdown').getContext('2d');
    dd = dd || new Chart(dtx, {
        "type": "line",
        "data": {
            "datasets": [{
                yAxisID: "drawdown",
                backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                borderColor: chartColors.blue,
            }]
        },
        "options":{
            "legend": {
                "display": false
            },
            "responsive": false,
            "title":{
                "text":"Chart.js Time Scale"
            },
            "elements":{
                "point":{
                    "radius": 0
                },
                "line":{
                    "fill": false,
                    "capBeizierPoints": false
                }
            },
            "scales":{
                "xAxes":[{
                    "type":"time",
                    "time":{"format":"MM/DD/YYYY HH:mm","tooltipFormat":"ll HH:mm"},
                    "scaleLabel":{"display":false,"labelString":"Date"}
                }],
                "yAxes":[{
                    id: "drawdown",
                    type: "linear",
                    position: "left",
                    "scaleLabel":{"display":false,"labelString":"value"}
                }]
            }
        }
    });
    dd.data.datasets[0].data = drawdownArray;
    dd.update();

    var randomColor = 'rgb(' + parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ')';
    
    config.data.datasets.push({
        label: "balance",
        yAxisID: "balance",
        fill: false,
        capBeizierPoints: false,
        data: profitArray,
        backgroundColor: balanceColor ? color(randomColor).alpha(1).rgbString() : color(randomColor).alpha(1).rgbString(),
        borderColor: balanceColor ? randomColor : chartColors.black
    });
    balanceColor = "black";
    chart.update();
}

function momentumTrade(){
    var j;
    var ctx = document.getElementById('chart').getContext('2d');
    var simulate;
    if( config.data.datasets[0].label == "KOSPI200" ){
        simulate = kospi200;
    } else if( config.data.datasets[0].label == "S&P500" ){
        simulate = snp;
    } else if( config.data.datasets[0].label == "HSI" ){
        simulate = hsi;
    } else if( config.data.datasets[0].label == "KOSPI" ){
        simulate = kospi;
    }
    var profitArray = [];
    var balance = 100;
    var position = undefined;
    
    var tradeFee = parseFloat($("#fee", '#single').val());
    var momentumLeft = $("input[name*='momentum_left']", '#single').val(),
        momentumRight = $("input[name*='momentum_right']", '#single').val();
    var avgType = $("input[name*='avgType']:checked", '#single').attr('id');
    var delayDate = $("#delayDate", '#single').val();
    if( delayDate == 0 ) delayDate = undefined;
    
    var dateStart = undefined, dateEnd = undefined;
    for( var i = 0 ; i < simulate.length ; i ++ ){
        if( !dateStart && simulate[i].Date >= $("input[name*='start']", '#single').val() )
            dateStart = i;
        if( !dateEnd && simulate[simulate.length - i - 1].Date <= $("input[name*='end']", '#single').val() )
            dateEnd = simulate.length - i;
        if( dateStart && dateEnd ) break;
    }
    
    if( dateStart == undefined || dateEnd == undefined ){
        alert('날짜 선택 오류');
        return;
    }
    
    var monthly = [];
    var positionCount = undefined;
    for( var i = 0 ; i < simulate.length ; i ++ ){
        var y = simulate[i].Date.split("-")[0],
            m = simulate[i].Date.split("-")[1],
            d = simulate[i].Date.split("-")[2];
        
        if( monthly.length == 0 || m != simulate[i-1].Date.split("-")[1] ){
            monthly[monthly.length] = {
                Date: y+"-"+m,
                Open: simulate[i].Open,
                High: simulate[i].High,
                Low: simulate[i].Low,
                Close: simulate[i].Close
            };
        } else{
            if( monthly[monthly.length - 1].High < simulate[i].High ){
                monthly[monthly.length - 1].High = simulate[i].High;
            } 
            if( monthly[monthly.length - 1].Low > simulate[i].Low ){
                monthly[monthly.length - 1].Low = simulate[i].Low;
            }
            monthly[monthly.length - 1].Close = simulate[i].Close;
        }
    }
    
    var month = 0, q;
    var sum, avg;
    for( i = dateStart ; i < dateEnd ; i ++ ){
        // 지난 달 수익률
        var y = simulate[i].Date.split("-")[0],
            m = simulate[i].Date.split("-")[1],
            d = simulate[i].Date.split("-")[2];
        for( ; monthly[month] && monthly[month].Date != y+"-"+m ; month ++ );
        if( !monthly[month] ) break;
        
        if( positionCount ){
            positionCount --;
            if( positionCount == 0 ){
                positionCount = undefined;
                if( position == undefined ){
                    position = simulate[i].Open * (100 + tradeFee) / 100;
                } else {
                    balance = balance + (simulate[i].Open - position) / position * balance;
                    position = undefined;
                }
            }
        }
        
        // 월 중에는 수익률 계산만 하자.
        if( i == 0 || m == simulate[i-1].Date.split("-")[1] ){
            if( position === undefined ){
                profitArray.push({x: new Date(simulate[i].Date), y: balance});
            }
            else{       // 매수를 했으면
                profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position)/position * balance});
            }
            
            continue;
        }
        
        sum = 0;
        avg = 0;
        q = 1;
        for( j = month - momentumLeft ; j <= month - 1 - momentumRight ; j ++ ){
            if( j < 0 ) j = 0;
            sum += (monthly[j].Close) * q;
            avg += q;
            if( avgType == "weightAvg" ) q++;
        }
        if( avg == 0 ) {
            if( position === undefined ){
                profitArray.push({x: new Date(simulate[i].Date), y: balance});
            }
            else{       // 매수를 했으면
                profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position)/position * balance});
            }
            continue;
        }
        
        console.log( y+'-'+m +' = momentum ' + sum / avg + ' , close : ' + monthly[month-1].Close);
        
        if( sum / avg < monthly[month-1].Close && position === undefined ){
            positionCount = delayDate;
            if( !positionCount ) position = simulate[i].Open * (100 - tradeFee) / 100;
        } else if( sum / avg > monthly[month-1].Close && position !== undefined ){
            positionCount = delayDate;
            if ( !positionCount ){
                balance = balance + (simulate[i].Open - position) / position * balance;
                position = undefined;
            }
        }
        
        if( position === undefined ){
            profitArray.push({x: new Date(simulate[i].Date), y: balance});
            continue;
        }
        else{       // 매수를 했으면
            profitArray.push({x: new Date(simulate[i].Date), y: balance + (simulate[i].Close - position)/position * balance});
            continue;
        }
    }
    
    var maximum = 100;
    var drawdownArray = [];
    for( var i = 0 ; i < profitArray.length ; i ++ ){
        if( maximum < profitArray[i].y )
            maximum = profitArray[i].y;
        drawdownArray.push({x: profitArray[i].x, y: (profitArray[i].y - maximum) / maximum * 100});
    }
    
    var dtx = document.getElementById('drawdown').getContext('2d');
    dd = dd || new Chart(dtx, {
        "type": "line",
        "data": {
            "datasets": [{
                yAxisID: "drawdown",
                backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
                borderColor: chartColors.blue,
            }]
        },
        "options":{
            "legend": {
                "display": false
            },
            "responsive": false,
            "title":{
                "text":"Chart.js Time Scale"
            },
            "elements":{
                "point":{
                    "radius": 0
                },
                "line":{
                    "fill": false,
                    "capBeizierPoints": false
                }
            },
            "scales":{
                "xAxes":[{
                    "type":"time",
                    "time":{"format":"MM/DD/YYYY HH:mm","tooltipFormat":"ll HH:mm"},
                    "scaleLabel":{"display":false,"labelString":"Date"}
                }],
                "yAxes":[{
                    id: "drawdown",
                    type: "linear",
                    position: "left",
                    "scaleLabel":{"display":false,"labelString":"value"}
                }]
            }
        }
    });
    dd.data.datasets[0].data = drawdownArray;
    dd.update();
    
    var randomColor = 'rgb(' + parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ')';
    
    config.data.datasets.push({
        label: "balance",
        yAxisID: "balance",
        fill: false,
        capBeizierPoints: false,
        data: profitArray,
        backgroundColor: balanceColor ? color(randomColor).alpha(1).rgbString() : color(randomColor).alpha(1).rgbString(),
        borderColor: balanceColor ? randomColor : chartColors.black
    });
    balanceColor = "black";
    chart.update();
}

var multiple_chart = undefined;
// onclick
function multipleMomentum(){
    
    var dateStartStr = $("input[name*='start']", '#multiple').val();
    var dateStart = new Date(dateStartStr);
    var dateEndStr = $("input[name*='end']", '#multiple').val();
    var dateEnd = new Date(dateEndStr);
    
    window.fee = parseFloat($('#fee', '#multiple').val());
    window.portf = parseInt($('#portf', '#multiple').val());
    window.cash_rate = parseFloat($('#cash_per', '#multiple').val());
    window.momentum_dist = parseInt($('#momentum_var', '#multiple').val());
    
    // 13개
    window.dataset = {"NASDAQ":nasdaq_simple,
                   "JAPAN": japan_simple,
                   //"SINGAPORE": singapore_simple,
                   "MSCI Russia Index": russia_simple,
                   //"TAIWAN": taiwan_simple,
                   //"HONGKONG": hongkong_simple,
                   //"AUSTRAILLIA": austraillia_simple,
                   "MSCI India Index": india_simple,
                   "HANGSENG Index": hangseng_simple,
                   "BRAZIL": brazil_simple,
                   "KOREA": korea_simple,
                   "동양 고배당": dongyang_simple,
                   "신영 밸류 고배당": shinyoung_simple,
                   "Gold": gold_simple,
                   "high yield": high_yield_simple,
                   "삼성중소형 foucs": samsung_focus_simple};

    var ctx = document.getElementById('mul_chart').getContext('2d');

    window.figure = {
        "type": "line",
        "data": {
            "datasets": []
        },
        "options":{
            "responsive": false,
            "title":{
                "text":"Chart.js Time Scale"
            },
            "elements":{
                "point":{
                    "radius": 0
                },
                "line":{
                    "fill": false,
                    "capBeizierPoints": false
                }
            },
            "scales":{
                "xAxes":[{
                    "type":"time",
                    "time":{"format":"MM/DD/YYYY HH:mm", "tooltipFormat":"MM/DD/YYYY"},
                    "scaleLabel":{"display":false,"labelString":"Date"}
                }],
                "yAxes":[{
                    id: "data",
                    type: "linear",
                    position: "left",
                    "scaleLabel":{"display":false,"labelString":"value"}
                },{
                    id: "balance",
                    type: "linear",
                    position: "right",
                    "scaleLabel": {"display": false, "labelString": "value"}
                }]
            }
        }
    };

    Object.keys(dataset).forEach(function(key){
        var firstValue = dataset[key][0].Data;
        var dataArray = [];
        dataset[key].filter(function(elem){
            var elemDate = new Date(elem.Date);
            return dateStart.getTime() <= elemDate.getTime() && elemDate.getTime() <= dateEnd.getTime();
        }, this).forEach(function(elem){
            dataArray.push({x: new Date(elem.Date), y: elem.Data / firstValue * 1000});
        });

        var randomColor = 'rgb(' + parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ')';
        figure.data.datasets.push({
            label: key,
            yAxisID: "data",
            data: dataArray,
            backgroundColor: color(randomColor).alpha(1).rgbString(),
            borderColor: randomColor
        })
    });

    if( multiple_chart )
        multiple_chart.destroy();
    multiple_chart = new Chart(ctx, figure);
    
    
    window.monthly = {};
    $('#history', '#multiple').empty();
    $tr = $('<tr></tr>');
    $('#history', '#multiple').append($tr);
    $tr.append('<td>날짜</td>');
    for( key in dataset ){
        $tr.append(`<td>${key}</td>`);
    }
    Object.keys(dataset).forEach(function(key){
        // "2000-01" 월 데이터 채움
        var substr = dataset[key][0].Date.substring(0, 7);
        !monthly[substr] ? monthly[substr] = {} : null;
        monthly[substr][key] = {Open: dataset[key][0].Data,
                             Close: dataset[key][0].Data,
                             High: dataset[key][0].Data,
                             Low: dataset[key][0].Data};
        for( var i = 1 ; i < dataset[key].length ; i ++ ){
            substr = dataset[key][i].Date.substring(0, 7);
            
            if( dataset[key][i-1].Date.substring(0, 7) != substr ){   // 월초
                if( !monthly[substr] ) 
                    monthly[substr] = {}
                monthly[substr][key] = {Open: dataset[key][i].Data,
                             Close: dataset[key][i].Data,
                             High: dataset[key][i].Data,
                             Low: dataset[key][i].Data};
            } else{                 // 월중
                monthly[substr][key].Close = dataset[key][i].Data;
                if( monthly[substr][key].High < dataset[key][i].Data )
                    monthly[substr][key].Hight = dataset[key][i].Data;
                if( monthly[substr][key].Low > dataset[key][i].Data )
                    monthly[substr][key].Low = dataset[key][i].Data;
            }
        } 
    });
    
    window.momentum_history = new Array(Object.keys(monthly).length);
    Object.keys(monthly).sort().forEach(function(month, index, offset){
        !momentum_history[index] ? momentum_history[index] = {Date: month} : null;
        for( key in monthly[month] ){
            if( index < momentum_dist || monthly[offset[index - momentum_dist]][key] == undefined ){
                momentum_history[index][key] = undefined;
            } else{
                momentum_history[index][key] = (monthly[month][key].Close - monthly[offset[index - momentum_dist]][key].Close) / monthly[month][key].Close;
            }
        }
    });
    
    var $history_table = $('#history', '#multiple');
    var trade_port = {};
    var momentum_index = 0;
    for( month in monthly ){
        trade_port[month] = [];
        if( month == momentum_history[0].Date ) momentum_index = 0;
        $row = $('<tr></tr>');
        $history_table.append($row);
        $row.append('<td>' + month + '</td>');
        for( key in dataset ){
            if( momentum_index === undefined || momentum_history[momentum_index][key] == undefined ){
                $row.append('<td>-</td>');
            }else{
                $row.append('<td style="color:' + (momentum_history[momentum_index][key]<0?'blue':'red') + '">' + (100*momentum_history[momentum_index][key]+"").substring(0, 5) + '</td>');
                if( momentum_history[momentum_index][key] > 0 ){
                    trade_port[month].push({
                        key: key,
                        value: momentum_history[momentum_index][key]
                    });
                }
            }
        }
        
        trade_port[month] = trade_port[month].sort(function(l, r){
            return l.value < r.value;
        }).slice(0, 5);
        if( momentum_index !== undefined ) momentum_index++;
    }
    
    var balance = 100;
    var keyIndex = {};
    Object.keys(dataset).forEach(function(key){
        keyIndex[key] = undefined;
        if( new Date(dataset[key][0].Date).getTime() < dateStart.getTime() ){
            for( i = 0 ; i < dataset[key].length ; i ++ ){
                if( dateStartStr == dataset[key][i].Date ){
                    keyIndex[key] = i;
                    break;
                }                    
            }
        }
    }, this);
    var balanceArray = [];
    var position = {};
    var delayDate = undefined;
    var endRun = false;
    
    for( var dd = dateStart ; dd.getTime() < dateEnd ; dd.setDate(dd.getDate() + 1)){
        for( key in keyIndex ){
            if( keyIndex[key] == undefined && new Date(dataset[key][0].Date).getTime() == dd.getTime() ){
                keyIndex[key] = 0;
            }
            if( keyIndex[key] !== undefined && dataset[key].length <= keyIndex[key] )
                endRun = true;
        }
        if( endRun ) break;
        
        if( dd.getDate() == 1 ){
            for( k in position ){
                position[k].todo = "SELL";
            }
            var monthStr = `${dd.getFullYear()}-${("0"+(dd.getMonth()+1)).slice(-2)}`;
            // 포지션에 있는데 이번달에 없으면 판매, 포지션에 없는데 이번달에 있으면 매수
            for( item in trade_port[monthStr] ){
                var tKey = trade_port[monthStr][item].key;
                if(position[tKey]){
                    position[tKey].todo = "HOLD";
                }else{
                    position[tKey] = {
                        todo : "BUY"
                    };
                }
            }
            
            delayDate = parseInt($('#delayDate', '#multiple').val());
        }
        
        // BUY, SELL처리
        if( delayDate === 0 ){
            delayDate = undefined;
            var totalPLM = 0;
            
            
            for( k in position ){
                if( position[k].todo == "SELL" ){
                    balance += (dataset[k][keyIndex[k]].Data - position[k].value) * position[k].volume - (dataset[k][keyIndex[k]].Data * position[k].volume * fee / 100);
                    totalPLM += (dataset[k][keyIndex[k]].Data - position[k].value) * position[k].volume - (dataset[k][keyIndex[k]].Data * position[k].volume * fee / 100);
                    
                    console.log(`SELL ${k} value: ${position[k].value} 손익: ${(dataset[k][keyIndex[k]].Data - position[k].value) / position[k].value * 100 - 1}`);
                    
                    delete position[k];
                }
            }
            
            for( k in position ){
                if( position[k].todo == "BUY" ){
                    position[k].todo = "HOLD";
                    position[k].value = dataset[k][keyIndex[k]].Data;
                    position[k].volume = (balance * (100 - cash_rate) / portf / 100) / position[k].value;
                    console.log(`BUY ${k} value: ${position[k].value}`);
                }
            }
            console.log('------------------------------');
        }
        
        var portpolioEvaluate = 0;
        for( k in position ){
            if( position[k].todo != "BUY" ){
                portpolioEvaluate += (dataset[k][keyIndex[k]].Data - position[k].value) * position[k].volume;
            }
        }
        
        if( dd.getDate() == 1 ){
            var percen = portpolioEvaluate / balance * 100;
            var $rw = $(`#history tr:contains(${monthStr})`, '#multiple');
            if( $rw.length ){
                $rw.append('<td>' + (balance + portpolioEvaluate + "").substring(0,7) + '</td>')
                var ppp = (balance + portpolioEvaluate) - parseFloat($rw.prev().find('td').last().prev().text()) / (balance + portpolioEvaluate);
                $rw.append('<td>' + (ppp + "").substring(0,7) + '</td>');
            }
        }
        
        balanceArray.push({x: new Date(dd), y: balance + portpolioEvaluate});
            
        if( delayDate !== undefined ) delayDate--;
        for( key in keyIndex ){
            if( keyIndex[key] !== undefined  ){
                keyIndex[key]++;
            }
        }
    }
    
    for( k in position ){
        console.log(`HOLD ${k} 손익 : ${(dataset[k][dataset[k].length - 1].Data - position[k].value) / position[k].value * 100 - 1}`);
    }
    
    var randomColor = 'rgb(' + parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ', ' + 
                                parseInt(Math.random() * 256) + ')';
    
    figure.data.datasets.push({
        label: "balance",
        yAxisID: "balance",
        fill: false,
        capBeizierPoints: false,
        data: balanceArray,
        backgroundColor: balanceColor ? color(randomColor).alpha(1).rgbString() : color(randomColor).alpha(1).rgbString(),
        borderColor: balanceColor ? randomColor : chartColors.black
    });
    balanceColor = "black";
    multiple_chart.update();
}


function addData(){
    if( $('#atype').css('display') == 'block' ){
        proFPA();
    }
    else {
        momentumTrade();
    }
}