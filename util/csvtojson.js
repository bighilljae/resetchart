var fs = require('fs');
var parse = require('csv-parse');

// argument is process.argv[2]

var inputFile = process.argv[2];
process.stdout.write(inputFile);
var res = [];
var date;

var parser = parse({delimiter: ','}, function(err, data){
    date = new Date(data[1][0]);
    for( let i = 1 ; i < data.length ; i ++ ){
        while( new Date(data[i][0]).getTime() !== date.getTime() ){
			var cpy = {};
			for( k in res[res.length - 1] ){
				cpy[k] = res[res.length - 1][k];
			}
			cpy.Date = `${date.getFullYear()}-${("0"+(date.getMonth()+1)).slice(-2)}-${("0"+date.getDate()).slice(-2)}`;
            res.push(cpy);
            date.setDate(date.getDate() + 1);
            // process.stdout.write('* ' + res[res.length-1].Date + '\n');
        }
        
        var obj = {};
        for( key in data[0] ){
            obj[data[0][key]] = data[i][key];
        }
        // Data 필드 채워주기
        if( obj.Data == undefined )
            obj.Data = obj.Close;
        res.push(obj);
        // process.stdout.write(res[res.length-1].Date + '\n');
        date.setDate(date.getDate() + 1);
    }
    
    fs.writeFileSync(process.argv[2].split('.')[0] + '.js', `var ${process.argv[2].split('.')[0]}=${JSON.stringify(res)}`);
});
fs.createReadStream(inputFile).pipe(parser);