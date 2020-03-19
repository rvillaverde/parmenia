/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/
class SelectTable {
  constructor(table) {
    this.table = table;
    this.table.listen(mdc.dataTable.events.ROW_SELECTION_CHANGED, this.handleRowSelection);
  }

  handleRowSelection(e) {
    console.log(e);
    let id = e.detail.rowId;
    let selected = e.detail.selected;
    let row = $(this.table.root_).find(id);
    console.log(row); 
  }
}

function openMenu(menu) {
  menu.open = true;
}

function updateTableCounter(table, counter) {
  counter.find('#quantity').text(table.getSelectedRowIds().length);
}

function handleRowSelection(e) {
  let id = e.detail.rowId;
  let selected = e.detail.selected;
  let name = $(e.target).find(`[data-row-id='${ id }'] td:first-child span`).text();
  let select = $(e.target).closest('.mdc-select');
  let chipSet = select.find('.mdc-select__selected-text .mdc-chip-set');

  if (selected) {
    let html = $(`<div id='${ id }' class='mdc-chip' role='row'>${ name }</div>`);
    chipSet.append(html);
  } else {
    chipSet.find(`#${ id }`).remove();
  }

  console.log(chipSet.children().length);

  if (chipSet.children().length > 0) {
    console.log(select.find(".mdc-floating-label"));
    //select.find(".mdc-floating-label").addClass('mdc-floating-label--float-above');
  } else {
    //select.find(".mdc-floating-label").removeClass('mdc-floating-label--float-above');

  }
}

var menus = $('.mdc-menu');
for (var i = 0, menu; menu = menus[i]; i++) {
  mdc.menu.MDCMenu.attachTo(menu);
}

var textFields = $('.mdc-text-field');
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}

var tabScrollers = $('.mdc-tab-scroller');
for (var i = 0, tabScroller; tabScroller = tabScrollers[i]; i++) {
  mdc.tabScroller.MDCTabScroller.attachTo(tabScroller);
}
/*
const lists = mdc.list.MDCList.attachTo($('.mdc-list'));
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}
*/

var switchControls = $('.mdc-switch');
for (var i = 0, switchControl; switchControl = switchControls[i]; i++) {
  mdc.switchControl.MDCSwitch.attachTo(switchControl);
}

var dataTables = $('.mdc-data-table');
for (var i = 0, dataTable; dataTable = dataTables[i]; i++) {
  var table = mdc.dataTable.MDCDataTable.attachTo(dataTable);

  var counter = $(dataTable).find('.mdc-data-table__counter');
  if (counter.length) {
    table.listen(mdc.dataTable.events.ROW_SELECTION_CHANGED, function() { 
      updateTableCounter(table, counter);
    });
    table.listen(mdc.dataTable.events.SELECTED_ALL, function() { 
      updateTableCounter(table, counter);
    });
    table.listen(mdc.dataTable.events.UNSELECTED_ALL, function() { 
      updateTableCounter(table, counter);
    });
  }

  var select = $(dataTable).closest('.mdc-select');
  if (select.length) {
    console.log('inside select');
    //myComponent = new SelectTable(table);
    table.listen(mdc.dataTable.events.ROW_SELECTION_CHANGED, handleRowSelection);
  }
}

var selects = $('.mdc-select');
for (var i = 0, select; select = selects[i]; i++) {
  mdc.select.MDCSelect.attachTo(select);
}

var lists = $('.mdc-list:not(.mdc-checkbox-list)');
for (var i = 0, list; list = lists[i]; i++) {
  var list = mdc.list.MDCList.attachTo(list);
  list.singleSelection = true;
}

var checkBoxLists = $('.mdc-checkbox-list');
for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
  var mdcList = mdc.list.MDCList.attachTo(checkBoxList);
  mdcList.singleSelection = false;
  $(checkBoxList).find('.mdc-list-item').each(function(i, option) {
    $(option).click(function(e) {
      console.log(this);
      console.log(mdcList);
      console.log(e);
      e.stopPropagation();
    })
  });
  //mdcList.handleClickEvent_ = function() {console.log('lalala')};
}