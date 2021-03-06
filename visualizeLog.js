/// <reference path="typings/main.d.ts" />
function displayFileInfo(files, id) {
    var output = [];
    for (var i = 0; files[i]; ++i) {
        var f = files[i];
        var _a = [f.name, f.size, f.type, f.lastModifiedDate], fileName = _a[0], fileSize = _a[1], fileType = _a[2], fileLastMod = _a[3];
        var sizeUnit = ["B", "KB", "MB", "GB", "TB"];
        var sizeLevel = 0;
        while (fileSize >= Math.pow(2, 10)) {
            fileSize /= Math.pow(2, 10);
            sizeLevel += 1;
        }
        var entry = "<li><strong>" + fileName + "</strong>(" + (fileType || "N.A.") + "), " + fileSize.toFixed(2) + " " + sizeUnit[sizeLevel] + ", last modified: " + fileLastMod + " </li>";
        output.push(entry);
    }
    document.getElementById(id).innerHTML = "<ul>" + output.join('') + "</ul>";
}
function handleFileDrop(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    var files = ev.dataTransfer.files;
    displayFileInfo(files, "list_2");
    if (files[0]) {
        var file = files[0];
        var reader_1 = new FileReader();
        reader_1.readAsText(file);
        reader_1.onload = function () { plotLog(parseLog(reader_1.result)); };
    }
}
function handleFileSelect(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    var target = (ev.target);
    var files = target.files;
    displayFileInfo(files, "list_2");
    if (files[0]) {
        var file = files[0];
        var reader_2 = new FileReader();
        reader_2.readAsText(file);
        reader_2.onload = function () { plotLog(parseLog(reader_2.result)); };
    }
}
function handleDrag(ev) {
    ev.stopPropagation();
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
}
function plotLog(log_data) {
    var train_iter = log_data[0], test_iter = log_data[1], train_loss = log_data[2], test_loss = log_data[3], test_accuracy = log_data[4];
    var col1 = ['loss-train'];
    var col2 = ['train_iters'];
    var col3 = ['accuracy-val'];
    var col4 = ['loss-val'];
    var col5 = ['val_iters'];
    col1.push.apply(col1, train_loss.map(function (num) { return Math.log(num); }));
    col2.push.apply(col2, train_iter);
    col3.push.apply(col3, test_accuracy);
    col4.push.apply(col4, test_loss.map(function (num) { return Math.log(num); }));
    col5.push.apply(col5, test_iter);
    var data = {
        'xs': { 'accuracy-val': 'val_iters', 'loss-train': 'train_iters', 'loss-val': 'val_iters' },
        'axes': { 'accuracy-val': 'y2' },
        'names': { 'accuracy-val': 'accuracy (val)', 'loss-train': 'loss (train)', 'loss-val': 'loss (val)' },
        'columns': [col1, col2, col3, col4, col5]
    };
    drawCombinedGraph(data);
}
function parseLog(result) {
    var all_iter = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Iteration\s+\d+/g)
        .map(function (str) { return str.match(/Iteration \d+/)[0]; })
        .map(function (str) { return str.match(/\d+/)[0]; })
        .map(function (str) { return Number(str); });
    var train_loss = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Train net output #0: loss = \d+(\.\d+)?([eE][+-]\d+)?/g)
        .map(function (str) { return str.match(/loss = \d+(\.\d+)?([eE][+-]\d+)?/)[0]; })
        .map(function (str) { return str.match(/\d+(\.\d+)?([eE][+-]\d+)?/)[0]; })
        .map(function (str) { return Number(str); });
    var test_loss = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Test net output #1: loss = \d+(\.\d+)?([eE][+-]\d+)?/g)
        .map(function (str) { return str.match(/loss = \d+(\.\d+)?([eE][+-]\d+)?/)[0]; })
        .map(function (str) { return str.match(/\d+(\.\d+)?([eE][+-]\d+)?/)[0]; })
        .map(function (str) { return Number(str); });
    var test_accuracy = result.match(/I\d{4}\s\d{2}:\d{2}:\d{2}\.\d{6}\s+\d+\ssolver.cpp:\d+]\s+Test net output #0: accuracy =\s+\d+(\.\d+)?/g)
        .map(function (str) { return str.match(/accuracy =\s+\d+(\.\d+)?/)[0]; })
        .map(function (str) { return str.match(/\d+(\.\d+)?/)[0]; })
        .map(function (str) { return Number(str); });
    var _a = splitIter(all_iter), train_iter = _a[0], test_iter = _a[1];
    var train_iter_n;
    var train_loss_n;
    var test_iter_n;
    var test_loss_n;
    var test_accuracy_n;
    for (var i = 0; i < train_loss.length / 10; ++i) {
        if (train_loss[i] == 0 && (i == 0 || train_loss[i - 1] == 90))
            train_loss[i] = 90;
    }
    for (var i = 0; i < test_loss.length / 10; ++i) {
        if (test_loss[i] == 0 && (i == 0 || test_loss[i - 1] == 90))
            test_loss[i] = 90;
    }
    train_loss = train_loss.map(function (val) { return val == 0 ? 1e-10 : val; });
    test_loss = test_loss.map(function (val) { return val == 0 ? 1e-10 : val; });
    return [train_iter, test_iter, train_loss, test_loss, test_accuracy];
}
function setError() {
    document.getElementById("list_2").innerText = "This file is not a log file!";
}
function splitIter(iter) {
    var train_iter = [];
    var test_iter = [];
    for (var i = 0; i < iter.length; ++i) {
        if (iter[i] != iter[i + 1]) {
            train_iter.push(iter[i]);
        }
        else {
            test_iter.push(iter[i]);
        }
    }
    return [train_iter, test_iter];
}
function drawCombinedGraph(data) {
    // create instance of C3 chart
    var chart = c3.generate({
        data: data,
        bindto: '#chart',
        size: {
            height: 480
        },
        axis: {
            x: {
                label: {
                    text: 'Iteration',
                    position: 'outer-center'
                },
                tick: {
                    // 3 sig-digs
                    format: function (x) { return Math.round(x * 1000) / 1000; },
                    fit: false
                },
                min: 0,
                padding: { left: 0 }
            },
            y: {
                label: {
                    text: 'Loss',
                    position: 'outer-middle'
                },
                padding: { bottom: 10 },
                tick: {
                    format: function (x) { return (Math.pow(Math.E, x)).toFixed(6); }
                }
            },
            y2: {
                show: true,
                label: {
                    text: 'Accuracy',
                    position: 'outer-middle'
                },
                min: 0,
                //max: 1,
                padding: { top: 10, bottom: 10 }
            }
        },
        grid: { x: { show: true } },
        legend: { position: 'bottom' },
        transition: {
            duration: 0
        },
        subchart: {
            show: true
        },
        zoom: {
            rescale: true
        }
    });
}
var dropZone = document.getElementById('file_drop');
dropZone.addEventListener('drop', handleFileDrop, false);
dropZone.addEventListener('dragover', handleDrag, false);
var selectTab = document.getElementById('file_select');
selectTab.addEventListener('change', handleFileSelect, false);
