var buttons = document.querySelectorAll('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}

var textFields = document.querySelectorAll('.mdc-text-field');
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}

const list = mdc.list.MDCList.attachTo(document.querySelector('.mdc-list'));

//const drawer = mdc.drawer.MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
