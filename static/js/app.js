// from data.js
let tableData = data;

// YOUR CODE HERE!
var filtered = [];
var criteria = [];

function populateTable(lData) {

    let Table = document.getElementById("ufo-table");
    let old_tbody = document.getElementById("ufo-tbody");
    let columns = 8;
    
    let new_tbody = document.createElement("tbody")
    new_tbody.setAttribute("id", "ufo-tbody");
    for (rowNumber=0; rowNumber<lData.length; rowNumber++) {
        // Create an empty <tr> element and add it to the table:
        let tableRow = new_tbody.insertRow(rowNumber);
        let cell = [];
        let rowData = lData[rowNumber];

        // Insert new cells (<td> elements) of the "new" <tr> element:
        for (c=0; c<columns; c+=1){
            cell[c] = tableRow.insertCell(c);
        }

        // Populate the new cells:
        cell[0].innerHTML = rowData.datetime;
        cell[1].innerHTML = rowData.city;
        cell[2].innerHTML = rowData.state;
        cell[3].innerHTML = rowData.country;
        cell[4].innerHTML = rowData.shape;
        cell[5].innerHTML = rowData.durationMinutes;
        cell[6].innerHTML = rowData.converted;
        cell[7].innerHTML = rowData.comments;
    }
    Table.replaceChild(new_tbody, old_tbody);
}

function findMatches(date){
    if (date) {var dateValue = new Date(date + 'T00:00');}
    return tableData.filter(row => {
        for (i=0; i<criteria.length; i++) {
            if (criteria[i].wordToMatch) {
                const regex = new RegExp(criteria[i].wordToMatch, 'gi');
                if (row[criteria[i].property] && !(row[criteria[i].property].match(regex))){
                    return false;
                }
            }
        }
        if (date) {
            let rowDate = new Date(row.datetime);
            if (rowDate.getDate() != dateValue.getDate()) return false;
            if (rowDate.getMonth() != dateValue.getMonth()) return false;
            if (rowDate.getFullYear() != dateValue.getFullYear()) return false;
        }
        return true;
    });
}
function highlightMatches(){
    let columns = {
        "datetime": 0,
        "city": 1,
        "state": 2,
        "country": 3,
        "shape": 4,
        "reported_duration": 5,
        "converted_duration": 6,
        "comments": 7
    }
    for (ci=0; ci<criteria.length; ci++){
        column = columns[criteria[ci].property];
        let Rows = document.getElementById("ufo-table").getElementsByTagName("tr")
        let regex = new RegExp(criteria[ci].wordToMatch, 'gi');
        for (i=3; i<Rows.length; i++){  // Skip the header rows
            let Cells = Rows[i].getElementsByTagName("td");
            Cells[column].innerHTML = Cells[column].innerHTML.replace(regex, `<span class="hl">${criteria[ci].wordToMatch}</span>`);
        }
    }
}
function f_filter(){
    criteria = [];
    elements.forEach(element => {
        criteria.push({wordToMatch: element.value, property: element.id});
    });
    date = document.getElementById("datetime").value;

    filtered = findMatches(date);
    populateTable(filtered);
    highlightMatches();
}

function resetTable(){
    filtered = tableData;
    criteria = [];
    document.getElementById("select-state").selectedIndex = "0";
    document.getElementById("select-shape").selectedIndex = "0";
    populateTable(filtered);
}

function sorted(id) {
    switch (id) {
        case "date-down":
        case "date-up":
            f=function(rowA, rowB) {
                dateA = (new Date(rowA.datetime));
                dateB = (new Date(rowB.datetime));
                if (id=="date-down") {return dateB - dateA;}
                else {return dateA-dateB;}
                };
            break;
        case "city-up":
            f=function(rowA, rowB) {return (rowA.city > rowB.city) ? 1 : -1}; break;
        case "city-down":
            f=function(rowA, rowB) {return (rowA.city < rowB.city) ? 1 : -1}; break;
        case "state-up":
            f=function(rowA, rowB) {return (rowA.state > rowB.state) ? 1 : -1}; break;
        case "state-down":
            f=function(rowA, rowB) {return (rowA.state < rowB.state) ? 1 : -1}; break;
        case "shape-up":
            f=function(rowA, rowB) {return (rowA.shape > rowB.shape) ? 1 : -1}; break;
        case "shape-down":
            f=function(rowA, rowB) {return (rowA.shape < rowB.shape) ? 1 : -1}; break;
        case "duration-up":
            f=function(rowA, rowB) {return (rowA.converted > rowB.converted) ? 1 : -1}; break;
        case "duration-down":
            f=function(rowA, rowB) {return (rowA.converted < rowB.converted) ? 1 : -1}; break;            
        case "comments-up":
            f=function(rowA, rowB) {return (rowA.comments > rowB.comments) ? 1 : -1}; break;
        case "comments-down":
            f=function(rowA, rowB) {return (rowA.comments < rowB.comments) ? 1 : -1}; break;
    }
    return filtered.sort(f);
}

function sortTable() {
    populateTable(sorted(this.id));
    highlightMatches();
}

(function normalizeDuration(){
    for (rowNumber=0; rowNumber<tableData.length; rowNumber++) {
        let row = tableData[rowNumber];
        staged = row.durationMinutes.toString();
        regex = new RegExp("ab(ou)?t ", 'i');
        staged = staged.replace(regex, "");
        staged = staged.replace(":00", "");    
        staged = staged.replace("a few ", "3");
        staged = staged.replace("one", "1");
        staged = staged.replace("seven", "7");
        staged = staged.replace("nine", "9");
        staged = staged.replace("half an hour", "30")
        staged = staged.replace("approx.", "");
        regexSeconds = new RegExp("sec", "gi");
        regexHours = new RegExp("hour", "gi");
        regexWeeks = new RegExp("weeks", "gi");
        i = parseInt(staged);
        if (staged.match(regexSeconds)) { 
            row["converted"] = i/60;
        } else if (staged.match(regexHours)) {
            row["converted"] = i*60;
        } else if (staged.match(regexWeeks)) {
            row["converted"] = i*60*24*7;
        } else {
            row["converted"] = i;
        }
        row["converted"] = isNaN(row["converted"]) ? 0 : row["converted"];
    }    
})()

function getUnique(input){
    let out = [];
    input.forEach (i => {
        if (!out.includes(i)) {out.push(i);}
    })
    return out;
}

function selectColumn(table, column){
    let out = [];
    table.forEach (row => {out.push(row[column])});
    return out;
}

function fillDropdown(id, column){
    let element = document.getElementById(id);
    getUnique(selectColumn(tableData,column))
        .sort((a,b) => a>b ? 1 : -1)
        .forEach(v => {
            let option = document.createElement("option");
            option.text = v;
            element.add(option);
    });
}
function selectState(){
    document.getElementById("state").value = this.value;
    f_filter();
}
function selectShape(){
    document.getElementById("shape").value = this.value;
    f_filter();
}

fillDropdown("select-state", "state");
fillDropdown("select-shape", "shape");
resetTable();

var filters = ["datetime", "city", "state", "shape", "comments"];
var elements = [];

filters.forEach((filter, index) => {
    let element = document.getElementById(filter);
    element.addEventListener("change", f_filter);
    element.addEventListener("keyup", f_filter);
    if (index > 0) {elements.push(element);}
});

document.getElementById("reset-btn").addEventListener("click", resetTable);
document.getElementById("select-state").addEventListener("change", selectState);
document.getElementById("select-shape").addEventListener("change", selectShape);

buttons = document.getElementsByClassName("sort-button");
for (i=0; i<buttons.length; i++) {
    buttons[i].addEventListener("click", sortTable);
}