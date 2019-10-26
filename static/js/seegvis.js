// 外部的 js 文件可以使用html中 js 定义的变量、函数等，不同js文件中的函数也可以相互调用！
var formatNum = (float) => parseFloat(parseFloat(float).toFixed(4));
function statisticExceptZero(data) {
    /**
     * 计算除去0后数组的中值、均值、最大值、最小值及数组长度
     */
    let dataExcept0 = [];
    for(let i = 0; i < data.length; i++){
        if (data[i] > 0) {
            dataExcept0.push(data[i])
        }
    }
    if (dataExcept0.length){
        return [d3.median(dataExcept0),d3.mean(dataExcept0),d3.max(dataExcept0),d3.min(dataExcept0),dataExcept0.length];
    }
    return [0,0,0,0,0];
}
function operateMarks() {
        if ($("#operate_type").text() == "新增"){
            addMarks($("#add_name").val(),$("#add_start").val(),$("#add_end").val(),$("#add_desc").val());
        } else{
            modifyMarks();
        }
        cancel();
    }
function cancel() {
    $("#add_name").val("");
    $("#add_start").val("");
    $("#add_end").val("");
    $("#add_desc").val("");
}
function addMarks(name,start,end,desc){
    let tr = document.createElement("tr");
    let td_name = document.createElement("td");
    td_name.innerText = name;
    let td_start = document.createElement("td");
    td_start.innerText = start;
    let td_end = document.createElement("td");
    td_end.innerText = end;
    let td_desc = document.createElement("td");
    td_desc.innerText = desc;
    let td_apply = document.createElement("td");
    let apply_button = document.createElement("button");
    apply_button.innerText = "应用";
    apply_button.setAttribute("class","btn btn-warning apply");
    let modify_button = document.createElement("button");
    modify_button.innerText = "修改";
    modify_button.setAttribute("class","btn btn-warning modify");
    modify_button.setAttribute("data-toggle","modal");
    modify_button.setAttribute("data-target","#myModal");

    let delete_button = document.createElement("button");
    delete_button.innerText = "删除";
    delete_button.setAttribute("class","btn btn-warning delete");

    td_apply.appendChild(modify_button);
    td_apply.appendChild(delete_button);
    td_apply.appendChild(apply_button);
    tr.appendChild(td_name);
    tr.appendChild(td_start);
    tr.appendChild(td_end);
    tr.appendChild(td_desc);
    tr.appendChild(td_apply);
    $("#time_marks").append(tr);
    // $("#modify_button").on("onclick", modifyMarks(td_name.innerText,td_start.innerText,td_end.innerText,td_desc.innerText));
}
function modifyMarks() {
    mark_select.siblings()[0].innerText = $("#add_name").val();
    mark_select.siblings()[1].innerText = $("#add_start").val();
    mark_select.siblings()[2].innerText = $("#add_end").val();
    mark_select.siblings()[3].innerText = $("#add_desc").val();
}
function saveMarks() {
    //alert("此功能暂未实现！") [0].childNodes[1].innerText
    let all_marks = $("#time_marks").children();
    if (all_marks.length == 0){
        alert("当前没有任何标记！");
        return;
    }
    /*
    marks_list = all_marks.map(function (mark) {
        return [mark.childNodes[0].innerText,mark.childNodes[1].innerText,mark.childNodes[2].innerText,mark.childNodes[3].innerText];
    });
    */
    let marks_list = [['Name','Start','End','Description']];
    for (let i=0;i<all_marks.length; i++){
        marks_list.push([all_marks[i].childNodes[0].innerText,all_marks[i].childNodes[1].innerText,all_marks[i].childNodes[2].innerText,all_marks[i].childNodes[3].innerText])
    }
    // console.log(marks_list);
    exportToCsv('time_marks.csv', marks_list);
}
function readToArray(data) {
    for (let i=1; i<data.length;i++){
        addMarks(data[i][0],data[i][1],data[i][2],data[i][3]);
    }
}

function showCoordinate(files) {
    //console.log(files);
    if (files[0]) {
        var reader = new FileReader();
        reader.readAsText(files[0]);
        /*
        reader.onload = function () {
            globaldata = this.result;
        }
        reader.onloadend = function (evt) {
            if(evt.target.readyState == FileReader.DONE){
                globaldata.push(csv2array(reader.result.toString()));
            }
        };
        */
        let electrode_names = fc_info['electrode_names'];
        reader.onload = function (f) {
            //var result = document.getElementById("result");
            //显示文件
            one_elect.clear();
            for(var i=0;i<electrode_names.length;i++){
                var two_e = electrode_names[i].split("-");
                one_elect.add(two_e[0]);
                one_elect.add(two_e[1]);
            }
            var co_data={"ez":[],"pz":[],"niz":[], "unknown":[]};
            var relArr = null;
            if (this.result.includes("\r\n")){
                relArr= this.result.split("\r\n"); // windows 是 回车换行
            }else{
                relArr= this.result.split("\n"); // linux 和 mac 是换行
            }
            //var regp = new RegExp(".*,\".*,.*\"$");
            var regp = /[^\w\s,.-]/;
            if (!$.isEmptyObject(relArr) && relArr.length > 1) {
                for (var cokey in one_elect_co){
                    //delete one_elect_co.cokey; 清空字典，只能使用下面的方法
                    delete one_elect_co[cokey];
                }
                // var title_key = relArr[0].split(" ");
                for (var key = 1, len = relArr.length; key < len; key++) {
                    var values = relArr[key];
                    if (regp.test(values)) {
                        alert("文件中此行内容含有非法符号，请修改后再上传！\n" + values);
                        return;
                    }
                    if (!$.isEmptyObject(values)) {
                        var objArr = null;  // electrode x y z type (type可以为空)
                        if (values.includes(",")) {
                            objArr = values.split(",");
                        }else{
                            objArr = values.split(" ");
                        }
                        /*
                        for (var j=1;j<objArr.length;j++){
                            obj.push(objArr[j].replace(/\s/ig,'')); //过滤空白字符
                        }
                        */
                        if (objArr.length >= 5){
                            if (objArr[4] === "ez"){
                                co_data.ez.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            } else if (objArr[4] === "pz"){
                                co_data.pz.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            }else if (objArr[4] === "niz"){
                                co_data.niz.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            } else{
                                co_data.unknown.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                            }
                        }else if(objArr.length == 4){
                            co_data.unknown.push([objArr[1],objArr[2],objArr[3],objArr[0]]);
                        }else{
                            alert("文件中此行内容信息不全，请补全后再上传！\n" + values);
                            return;
                        }
                        if (isInSet(objArr[0],one_elect)){
                            one_elect_co[objArr[0]] = [parseFloat(objArr[1]),parseFloat(objArr[2]),parseFloat(objArr[3])];
                        }
                    }
                }
            }
            $("#codination").remove();
            var newM = $("<div id='codination' style='width: 85%;height:500px;' align='center'></div>");
            newM.appendTo($("#electrodes"));
            // console.log(co_data);
            scatter3D(co_data,'codination');
            /*
            var s1 = $("#s1").val();
            var s2 = $("#s2").val();
            if (typeof(s1)==="number"&&typeof(s2)==="number"){
            }
            */
            ez_p.length = 0;
            pz_p.length = 0;
            niz_p.length = 0;
            //console.log(co_data)
            for(var ii=0;ii<electrode_names.length;ii++){
                var one_e = electrode_names[ii].split("-")[0];
                //console.log(one_e)
                var flag = true;
                for (var jj=0;jj<co_data["ez"].length;jj++){
                    if (co_data["ez"][jj][3].includes(one_e)){
                        ez_p.push(ii);
                        flag = false;
                        break;
                    }
                }
                if (flag){
                    for (var jj=0;jj<co_data["pz"].length;jj++){
                        if (co_data["pz"][jj][3].includes(one_e)){
                            pz_p.push(ii);
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag){
                    for (var jj=0;jj<co_data["niz"].length;jj++){
                        if (co_data["niz"][jj][3].includes(one_e)){
                            niz_p.push(ii);
                            //flag = false;
                            break;
                        }
                    }
                }
            }
            //console.log(ez_p,pz_p,niz_p)
        };
    }
}
function assignZone() {
    if (one_elect.size === 0){
        alert("您未上传空间坐标文件,\n无法默认取值！");
        return;
    }
    if (ez_p.length+pz_p.length+niz_p.length === 0){
        alert("您上传的空间坐标文件与基本信息中的电极不符,\n无法默认取值！");
        return;
    }
    var ez_s="";
    var pz_s="";
    var niz_s="";
    for (i of ez_p){
        ez_s += ", "+i;
    }
    for (i of pz_p){
        pz_s += ", "+i;
    }
    for (i of niz_p){
        niz_s += ", "+i;
    }
    if (ez_s.length){
        $("#EZ").val(ez_s.slice(1))
    }
    if (pz_s.length){
        $("#PZ").val(pz_s.slice(1))
    }
    if (niz_s.length){
        $("#NIZ").val(niz_s.slice(1))
    }
}
function isInSet(item,set) {
    for (var si of set){
        if (item === si){
            return true;
        }
    }
    return false;
}
function strArr2floatArr(strArr) {
    var floatArr = [];
    for (var sai of strArr){
        floatArr.push(parseFloat(sai));
    }
    return floatArr;
}
function twoElectCO(signal,co) {
    /*
     返回电极对的中心坐标
     signal的格式例如： ['C4-C5', 'C6-C7']
      */
    var s1 = signal[0].split('-');
    var s2 = signal[1].split('-');
    return [centerPoint(co[s1[0]],co[s1[1]]),centerPoint(co[s2[0]],co[s2[1]])]
}
function centerPoint(co1,co2) {
    if (!(co1&&co2)){
        return null;
    }
    return [(co1[0]+co2[0])/2,(co1[1]+co2[1])/2,(co1[2]+co2[2])/2]
}

function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            }
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=UTF-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
function readFromCsv(file_e, callback) {
    // var file = document.getElementById(file_name).files[0];
    var file = file_e.files[0];
    var reader = new FileReader();
    reader.readAsText(file,'UTF-8');
    //读取完文件之后，执行下面这个回调函数：
    reader.onload = function (evt) {
        let data = csv2array(reader.result.toString());
        // console.log(data);
        callback && callback(data);
    }
}
function csv2array(data, delimeter) {
    // Retrieve the delimeter
    if (delimeter == undefined)
        delimeter = ',';
    if (delimeter && delimeter.length > 1)
        delimeter = ',';

    // initialize variables
    var newline = '\n';
    var eof = '';
    var i = 0;
    var c = data.charAt(i);
    var row = 0;
    var col = 0;
    var array = new Array();

    while (c != eof) {
        // skip whitespaces
        while (c == ' ' || c == '\t' || c == '\r') {
            c = data.charAt(++i); // read next char
        }

        // get value
        var value = "";
        if (c == '\"') {
            // value enclosed by double-quotes
            c = data.charAt(++i);

            do {
                if (c != '\"') {
                    // read a regular character and go to the next character
                    value += c;
                    c = data.charAt(++i);
                }

                if (c == '\"') {
                    // check for escaped double-quote
                    var cnext = data.charAt(i+1);
                    if (cnext == '\"') {
                        // this is an escaped double-quote.
                        // Add a double-quote to the value, and move two characters ahead.
                        value += '\"';
                        i += 2;
                        c = data.charAt(i);
                    }
                }
            }
            while (c != eof && c != '\"');

            if (c == eof) {
                throw "Unexpected end of data, double-quote expected";
            }

            c = data.charAt(++i);
        }
        else {
            // value without quotes
            while (c != eof && c != delimeter && c!= newline) {
                value += c;
                c = data.charAt(++i);
            }
        }

        // add the value to the array
        if (array.length <= row)
            array.push(new Array());
        array[row].push(value);

        // skip whitespaces
        while (c == ' ' || c == '\t' || c == '\r') {
            c = data.charAt(++i);
        }

        // go to the next row or column
        if (c == delimeter) {
            // to the next column
            col++;
        }
        else if (c == newline) {
            // to the next row
            col = 0;
            row++;
        }
        else if (c != eof) {
            // unexpected character
           throw "Delimiter expected after character " + i;
        }

        // go to the next character
        c = data.charAt(++i);
    }

    return array;
}

function downloadFCStatistic() {
    let rows=[];
    rows.push(["zone","median","mean","max","min","num"]);
    if (databyType.ez) rows.push(["ez"].concat(databyType.ez));
    if (databyType.pz) rows.push(["pz"].concat(databyType.pz));
    if (databyType.niz) rows.push(["niz"].concat(databyType.niz));
    if (databyType.ez_pz) rows.push(["ez_pz"].concat(databyType.ez_pz));
    if (databyType.ez_niz) rows.push(["ez_niz"].concat(databyType.ez_niz));
    if (databyType.pz_niz) rows.push(["pz_niz"].concat(databyType.pz_niz));
    exportToCsv("FCStatisticResult.csv",rows);
}