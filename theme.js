/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/
function openMenu(menu) {
  menu.open = true;
}

var menus = $('.mdc-menu');
for (var i = 0, menu; menu = menus[i]; i++) {
  const mdcMenu = mdc.menu.MDCMenu.attachTo(menu);
  //mdcMenu.open = true;
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
  mdc.dataTable.MDCDataTable.attachTo(dataTable);
}
