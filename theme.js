/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/
var textFields = $('.mdc-text-field');
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}
/*
const lists = mdc.list.MDCList.attachTo($('.mdc-list'));
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}
*/