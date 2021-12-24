for (let i = 1; i <= 100; i++) {
  let n = i;
  let str = "";
  while (n > 0) {
    let rem = n % 26;
    if (rem == 0) {
      str += "Z";
      n = Math.floor(n / 26) - 1;
    } else {
      str = String.fromCharCode(rem - 1 + 65) + str;
      n = Math.floor(n / 26);
    }
  }
  $("#columns").append(`<div class="column-name">${str}</div>`);
  $("#rows").append(`<div class="row-name">${i}</div>`);
}

let cellData = {"sheet1":[]};
let TotalSheets=1;
let selectedSheet="sheet1";
let firstSelected = false;
let startRowCol = {};
let endRowCol = {};


function loadNewSheets(){
  $('#cells').text("");

  for (let i = 0; i < 100; i++) {
    let row = $(`<div class="cell-row"></div>`);
    let rowArray = [];
    for (let j = 0; j < 100; j++) {
      row.append(
        `<div id="row-${i}-col-${j}" class="input-cell" contenteditable=false ></div>`
      );
      rowArray.push({
        "font-family": "Noto-Sans",
        "font-size": 14,
        text: "",
        bold: false,
        italic: false,
        underlined: false,
        alignment: "left",
        color: "black",
        bgcolor: "white",
      });
    }
    cellData[selectedSheet].push(rowArray);
    $("#cells").append(row);
  }
  
}


loadNewSheets();
addEvents();

function addEvents(){
 
$("#cells").scroll(function (e) {
  // console.log(this.scrollLeft);
  $("#columns").scrollLeft(this.scrollLeft);
  $("#rows").scrollTop(this.scrollTop);
});

$(".input-cell").dblclick(function (e) {
  $(".input-cell.selected").removeClass(
    "selected top-selected right-selected botoom-selected left-selected"
  );
  $(this).addClass("selected");
  $(this).attr("contenteditable", "true");
  $(this).focus();
});

$(".input-cell").blur(function (e) {
  $(this).attr("contenteditable", "false");
});

$(".input-cell").click(function (e) {
  let [row, col] = getRowCol(this);
  let [top, bottom, right, left] = getTBRL(row, col);

  if ($(this).hasClass("selected") && e.ctrlKey) {
    deSelect(this, e, top, bottom, right, left);
  } else {
    // $('.input-cell').removeClass("selected top-selected bottom-selected right-selected left-selected");
    selectCell(this, e, top, bottom, right, left);
  }
});


$(".input-cell").mouseenter(function (e) {
  e.preventDefault();
  if (e.buttons == 1) {
    // e.preventDefault();
    console.log("enter");
    if (firstSelected == false) {
      let [rowstrt, colstrt] = getRowCol(this);
      firstSelected = true;
      startRowCol = { rowId: rowstrt, colId: colstrt };
      selectByMouse(startRowCol, startRowCol);
    } else {
      let [rowstrt, colstrt] = getRowCol(this);
      endRowCol = { rowId: rowstrt, colId: colstrt };
      // console.log(startRowCol,"  ",endRowCol);
      selectByMouse(startRowCol, endRowCol);
    }
  } else {
    firstSelected = false;
  }
});

}



function deSelect(ele, e, topCell, bottomCell, rightCell, leftCell) {
  if ($(ele).attr("contenteditable") == "false") {
    if ($(ele).hasClass("top-selected")) {
      topCell.removeClass("bottom-selected");
      $(ele).removeClass("top-selected");
    }

    if ($(ele).hasClass("bottom-selected")) {
      bottomCell.removeClass("top-selected");
      $(ele).removeClass("bottom-selected");
    }
    if ($(ele).hasClass("right-selected")) {
      rightCell.removeClass("left-selected");
      $(ele).removeClass("right-selected");
    }
    if ($(ele).hasClass("left-selected")) {
      leftCell.removeClass("right-selected");
      $(ele).removeClass("left-selected");
    }
    $(ele).removeClass("selected");
  }
}

function getRowCol(ele) {
  let id = $(ele).attr("id");
  let idArray = id.split("-");
  let row = parseInt(idArray[1]);
  let col = parseInt(idArray[3]);
  return [row, col];
}

function getTBRL(rowid, colid) {
  let top = $(`#row-${rowid - 1}-col-${colid}`);
  let bottom = $(`#row-${rowid + 1}-col-${colid}`);
  let left = $(`#row-${rowid}-col-${colid - 1}`);
  let right = $(`#row-${rowid}-col-${colid + 1}`);
  return [top, bottom, right, left];
}

function selectCell(ele, e, topCell, bottomCell, rightCell, leftCell) {
  if (e.ctrlKey) {
    let topSelected;
    if (topCell) {
      topSelected = topCell.hasClass("selected");
    }

    let bottomSelected;
    if (bottomCell) {
      bottomSelected = bottomCell.hasClass("selected");
    }

    let rightSelected;
    if (rightCell) {
      rightSelected = rightCell.hasClass("selected");
    }

    let leftSelected;
    if (leftCell) {
      leftSelected = leftCell.hasClass("selected");
    }

    if (topSelected) {
      $(ele).addClass("top-selected");
      topCell.addClass("bottom-selected");
    }

    if (rightSelected) {
      $(ele).addClass("right-selected");
      rightCell.addClass("left-selected");
    }

    if (leftSelected) {
      $(ele).addClass("left-selected");
      leftCell.addClass("right-selected");
    }

    if (bottomSelected) {
      $(ele).addClass("bottom-selected");
      bottomCell.addClass("top-selected");
    }
  } else {
    $(".input-cell.selected").removeClass(
      "selected top-selected right-selected botoom-selected left-selected"
    );
  }
  $(ele).addClass("selected");
  changeHeader(getRowCol(ele));
}

function changeHeader([row, col]) {
  console.log("working");
  let data = cellData[selectedSheet][row][col];

  let aligned = data.alignment;
  $(".alignment.selected").removeClass("selected");
  $(`.alignment[data-type=${aligned}]`).addClass("selected");

  twowayBind(data, "bold");
  twowayBind(data, "underlined");
  twowayBind(data, "italic");

  let color = data.color;
  let bgcolor = data.bgcolor;
  $("#fill-color-icon").css("border-bottom", "5px solid " + bgcolor);
  $("#text-color-icon").css("border-bottom", "5px solid " + color);
}

function twowayBind(data, id) {
  let prop = data[id];
  if (prop) {
    $(`#${id}`).addClass("selected");
  } else {
    $(`#${id}`).removeClass("selected");
  }
}



function selectByMouse(start, end) {
  $(".input-cell.selected").removeClass(
    "selected top-selected bottom-selected right-selected left-selected"
  );
  for (
    let i = Math.min(start.rowId, end.rowId);
    i <= Math.max(end.rowId, start.rowId);
    i++
  ) {
    for (
      let j = Math.min(start.colId, end.colId);
      j <= Math.max(end.colId, start.colId);
      j++
    ) {
      let [top, bottom, right, left] = getTBRL(i, j);
      // console.log(top, bottom, left, right);
      selectCell(
        $(`#row-${i}-col-${j}`),
        { ctrlKey: true },
        top,
        bottom,
        right,
        left
      );
    }
  }
}

$(".alignment").click(function (e) {
  console.log("aligned");
  let alignment = $(this).attr("data-type");
  $(".alignment.selected").removeClass("selected");
  $(this).addClass("selected");
  $(".input-cell.selected").css("text-align", alignment);

  $(".input-cell.selected").each(function (index, data) {
    //  here data is element's reference (like this)
    let [row, col] = getRowCol(data);
    cellData[selectedSheet][row][col].alignment = alignment;
    console.log(cellData[selectedSheet][row][col]);
  });
});

$("#bold").click(function (e) {
  changeStyle(this, "font-weight", "bold", "bold");
});
$("#italic").click(function (e) {
  changeStyle(this, "font-style", "italic", "italic");
});
$("#underlined").click(function (e) {
  changeStyle(this, "text-decoration", "underline", "underlined");
});

function changeStyle(ele, prop, val, cellProp) {
  if ($(ele).hasClass("selected")) {
    $(ele).removeClass("selected");
    $(".input-cell.selected").css(`${prop}`, "");
    $(".input-cell.selected").each(function (index, data) {
      let [row, col] = getRowCol(data);
      cellData[selectedSheet][row][col][cellProp] = false;
    });
  } else {
    $(ele).addClass("selected");
    $(".input-cell.selected").css(`${prop}`, `${val}`);
    $(".input-cell.selected").each(function (index, data) {
      let [row, col] = getRowCol(data);
      cellData[selectedSheet][row][col][cellProp] = true;
    });
  }
}

$(".color-pick").colorPick({
  initialColor: "#abcd",
  allowRecent: true,
  recentMax: 5,
  allowCustomColor: true,
  palette: [
    "#1abc9c",
    "#16a085",
    "#2ecc71",
    "#27ae60",
    "#3498db",
    "#2980b9",
    "#9b59b6",
    "#8e44ad",
    "#34495e",
    "#2c3e50",
    "#f1c40f",
    "#f39c12",
    "#e67e22",
    "#d35400",
    "#e74c3c",
    "#c0392b",
    "#ecf0f1",
    "#bdc3c7",
    "#95a5a6",
    "#7f8c8d",
  ],
  onColorSelected: function () {
    if (this.color != "#abcd") {
      // console.log(this.element.children()[1]);
      if ($(this.element.children()[1]).attr("id") == "fill-color-icon") {
        $(".input-cell.selected").css("background-color", this.color);
        let colorSelected = this.color;
        $(".input-cell.selected").each(function (index, ele) {
          let [row, col] = getRowCol(ele);
          cellData[selectedSheet][row][col]["bgcolor"] = colorSelected;
        });

        $("#fill-color-icon").css("border-bottom", "5px solid " + this.color);
      }
      if ($(this.element.children()[1]).attr("id") == "text-color-icon") {
        $(".input-cell.selected").css("color", this.color);
        let colorSelected = this.color;
        $(".input-cell.selected").each(function (index, ele) {
          let [row, col] = getRowCol(ele);
          cellData[selectedSheet][row][col]["color"] = colorSelected;
        });
        $("#text-color-icon").css("border-bottom", "5px solid " + this.color);
      }
    }
  },
});

$("#fill-color-icon").click(function (e) {
  setTimeout(() => {
    $(this).parent().click();
  }, 10);
});

$("#text-color-icon").click(function (e) {
  setTimeout(() => {
    $(this).parent().click();
  }, 10);
});

$(".sheet-tab").bind("contextmenu", function (e) {
  e.preventDefault();

  selectSheet(this);
  $(".sheet-options-modal").remove();
  let modal = ` <div class="sheet-options-modal">
              <div class="option sheet-rename" onfocus="console.log('hello')">Rename</div>
              <div class="option sheet-delete">Delete</div>
              </div>`;
  $(".container").append(modal);
  $(".sheet-options-modal").css({
    bottom: 0.04 * $(window).height(),
    left: e.pageX,
  });

  $(".sheet-rename").click(function (ele) {
    console.log("change");
    let modal = $(`  <div class="sheet-rename-modal">
    <h4 class="modal-title">Rename Sheet To:</h4>
    <input type="text" class="new-sheet-name" placeholder="Sheet Name" />
    <div class="action-buttons">
        <div class="submit-button">Rename</div>
        <div class="cancel-button">Cancel</div>
       </div>
       </div>`);
    $(".container").append(modal);
    $(".cancel-button").click(function (e) {
      modal.remove();
    });
    $(".submit-button").click(function (ele) {
      let newName = $(".new-sheet-name").val();
      console.log(newName);
      $(".sheet-tab.selected").attr("innerText",newName);
      modal.remove();
    });
  });

  $(".sheet-delete").click(function (ele) {
    console.log("change");
    let modal = $(` <div class="sheet-modal-parent">
    <div class="sheet-delete-modal">
        <h4 class="modal-title">Do you want to Delete Sheet</h4>
     
        <div class="action-buttons">
            <div class="delete-button">Confirm</div>
            <div class="cancel-button">Cancel</div>
        </div>
    </div>
</div>`);
    $(".container").append(modal);
    $(".cancel-button").click(function (e) {
      modal.remove();
    });
  });
});


$(".sheet-tab").click(function (e) {
  selectSheet(this);
});

function selectSheet(ele) {
  $(".sheet-tab.selected").removeClass("selected");
  $(ele).addClass("selected");
  selectedSheet=$(ele).text();

  
}

function loadSheet(){
  $('#cells').text("");
  let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for (let i of rowKeys) {
        let rowId = parseInt(i);
        let colKeys = Object.keys(data[rowId]);
        for (let j of colKeys) {
            let colId = parseInt(j);
            let cell = $(`#row-${rowId + 1}-col-${colId + 1}`); // first cell that have changes
            cell.text(data[rowId][colId].text);
            cell.css({
                "font-family": data[rowId][colId]["font-family"],
                "font-size": data[rowId][colId]["font-size"],
                "background-color": data[rowId][colId]["bgcolor"],
                "color": data[rowId][colId].color,
                "font-weight": data[rowId][colId].bold ? "bold" : "",
                "font-style": data[rowId][colId].italic ? "italic" : "",
                "text-decoration": data[rowId][colId].underlined ? "underline" : "",
                "text-align": data[rowId][colId].alignment,
            });
        }
    }
}




$('.add-sheet').click(function(ele){
  TotalSheets++;
  cellData[`sheet${TotalSheets}`]=[];
  selectedSheet=`sheet${TotalSheets}`;
  loadNewSheets();
  addEvents();
  $('.sheet-tab.selected').removeClass('selected');
  $('.sheet-tab-container').append(
    `  <div class="sheet-tab selected">Sheet${TotalSheets}</div>`
  );
});