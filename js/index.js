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
    $('input[name*="data"]').change(function(obj){
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
        
        $("input[name*='start']").val(s);
        $("input[name*='end']").val(e);
    });
    $('input[name*="data"]').change();
    
    $("#mySlidenav a:nth-child(1)").click(function(){
        $("#atype").css('display', 'block');
        $('.momentumfunc').css('display', 'none');
    });
    
    $("#mySlidenav a:nth-child(2)").click(function(){
        $("#atype").css('display', 'none');
        $('.momentumfunc').css('display', 'block');
    });
});


function loadChart() {
    var ctx = document.getElementById('chart').getContext('2d');
    var chartsets = [];
    if( $('#ks200').is(':checked') ){
        chartsets.push({
            label: "KOSPI200",
            yAxisID: 'data',
            backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
            borderColor: chartColors.green,
            data: kospi200.filter(function(elem){
                return $("input[name*='start']").val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']").val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }

    if( $('#snp500').is(':checked') ){
        chartsets.push({
            label: "S&P500",
            yAxisID: 'data',
            backgroundColor: color(chartColors.red).alpha(0.5).rgbString(),
            borderColor: chartColors.red,
            data: snp.filter(function(elem){
                return $("input[name*='start']").val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']").val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }

    if( $('#hsi').is(':checked') ){
        chartsets.push({
            label: "HSI",
            yAxisID: 'data',
            backgroundColor: color(chartColors.blue).alpha(0.5).rgbString(),
            borderColor: chartColors.blue,
            data: hsi.filter(function(elem){
                return $("input[name*='start']").val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']").val();
            }).map(function(elem){
                return {x:new Date(elem.Date), y: elem.Close};
            })
        });
    }
    
    if( $('#kospi').is(':checked') ){
        chartsets.push({
            label: "KOSPI",
            yAxisID: 'data',
            backgroundColor: color(chartColors.green).alpha(0.5).rgbString(),
            borderColor: chartColors.green,
            data: kospi.filter(function(elem){
                return $("input[name*='start']").val() <= elem.Date &&
                    elem.Date <= $("input[name*='end']").val();
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
    
    var tradeFee = $("#fee").val();
    var upper = $("input[name*='upper']").val(), lower = $("input[name*='lower']").val();
    
    var dateStart = undefined, dateEnd = undefined;
    for( var i = 0 ; i < simulate.length ; i ++ ){
        if( !dateStart && simulate[i].Date >= $("input[name*='start']").val() )
            dateStart = i;
        if( !dateEnd && simulate[simulate.length - i - 1].Date <= $("input[name*='end']").val() )
            dateEnd = simulate.length - i;
        if( dateStart && dateEnd ) break;
    }
    
    if( dateStart == undefined || dateEnd == undefined ){
        alert('날짜 선택 오류');
        return;
    }
    
    for( var i = dateStart ; i < dateEnd ; i ++ ){
        // 지난 달 수익률
        var y = simulate[i].Date.split("-")[0],
            m = simulate[i].Date.split("-")[1],
            d = simulate[i].Date.split("-")[2];
        
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
            position = simulate[i].Open * (100 - tradeFee) / 100;
        }
        // -1 하락 및 청산
        if( beforeMonthPercentage <= lower && position !== undefined ){
            balance = balance + (simulate[i].Open - position) / position * balance;
            position = undefined;
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

    config.data.datasets.push({
        label: "balance",
        yAxisID: "balance",
        fill: false,
        capBeizierPoints: false,
        data: profitArray,
        backgroundColor: balanceColor ? color(chartColors.purple).alpha(1).rgbString() : color(chartColors.black).alpha(1).rgbString(),
        borderColor: balanceColor ? chartColors.purple : chartColors.black
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
    
    var tradeFee = $("#fee").val();
    var momentumLeft = $("input[name*='momentum_left']").val(),
        momentumRight = $("input[name*='momentum_right']").val();
    var avgType = $("input[name*='avgType']:checked").attr('id');
    
    var dateStart = undefined, dateEnd = undefined;
    for( var i = 0 ; i < simulate.length ; i ++ ){
        if( !dateStart && simulate[i].Date >= $("input[name*='start']").val() )
            dateStart = i;
        if( !dateEnd && simulate[simulate.length - i - 1].Date <= $("input[name*='end']").val() )
            dateEnd = simulate.length - i;
        if( dateStart && dateEnd ) break;
    }
    
    if( dateStart == undefined || dateEnd == undefined ){
        alert('날짜 선택 오류');
        return;
    }
    
    var monthly = [];
    
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
            position = simulate[i].Open * (100 - tradeFee) / 100;
        } else if( sum / avg > monthly[month-1].Close && position !== undefined ){
            balance = balance + (simulate[i].Open - position) / position * balance;
            position = undefined;
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
    
    
    config.data.datasets.push({
        label: "balance",
        yAxisID: "balance",
        fill: false,
        capBeizierPoints: false,
        data: profitArray,
        backgroundColor: balanceColor ? color(chartColors.purple).alpha(1).rgbString() : color(chartColors.black).alpha(1).rgbString(),
        borderColor: balanceColor ? chartColors.purple : chartColors.black
    });
    balanceColor = "black";
    chart.update();
}

function addData(){
    
    if( $('#atype').css('display') == 'block' ){
        proFPA();
    }
    else {
        momentumTrade();
    }
    
}