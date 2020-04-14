/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/

function formatDate(date) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var d = new Date(date);
  return `${ d.getDate() } de ${ months[d.getMonth()] } de ${ d.getFullYear() }`;

  var month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [day, month, year].join('/');
}

function formatTime(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  return `${ ('0' + (hours)).slice(-2) }:${ ('0' + (minutes)).slice(-2) }`; 
}

/*
function openMenu(menu) {
  menu.open = true;
}*/


var mdcDrawer = $('.mdc-drawer');
mdcDrawer.find('.mdc-button--eye-toggle').click(function(e) {
  $(this).closest('.mdc-list-item').toggleClass('disabled-section');
});

function initSortableWrappers() {
  var sortableWrappers = $('.sortable-wrapper');
  for (var i = 0, sortableWrapper; sortableWrapper = sortableWrappers[i]; i++) {
    new MDCSortable(sortableWrapper);
  }
}

function initChipsets() {
  var chipsets = $('.mdc-chip-set:not(.mdc-chip-set--filter):not(.mdc-chip-set--input)');
  for (var i = 0, chipset; chipset = chipsets[i]; i++) {
    chipset.mdc = mdc.chips.MDCChipSet.attachTo(chipset);
  }
}

function initInputChipsets() {
  var chipsets = $('.mdc-chip-set.mdc-chip-set--input');
  for (var i = 0, chipset; chipset = chipsets[i]; i++) {
    new MDCInputChipset(chipset);
  }
}

function initFilterChipsets() {
  var chipsets = $('.mdc-chip-set.mdc-chip-set--filter');
  for (var i = 0, chipset; chipset = chipsets[i]; i++) {
    new MDCFilterChipset(chipset);
  }
}

function initTextFields() {
  var textFields = $('.mdc-text-field:not(.mdc-text-field--search)');
  for (var i = 0, textField; textField = textFields[i]; i++) {
    textField.mdc = mdc.textField.MDCTextField.attachTo(textField);
  }
}

function initSearchTextFields() {
  var searchTextFields = $('.mdc-text-field.mdc-text-field--search');
  for (var i = 0, searchTextField; searchTextField = searchTextFields[i]; i++) {
    new MDCSearchTextField(searchTextField);
  }
}

function initCheckboxes() {
  var checkboxes = $('.mdc-checkbox');
  for (var i = 0, checkbox; checkbox = checkboxes[i]; i++) {
    mdc.checkbox.MDCCheckbox.attachTo(checkbox);
  }
}

function initRadioWrappers() {
  var radioWrappers = $('.mdc-radio-button__wrapper');
  for (var i = 0, radioWrapper; radioWrapper = radioWrappers[i]; i++) {
    new MDCRadioButtonWrapper(radioWrapper);
  }
}

function initTabScrollers() {
  var tabScrollers = $('.mdc-tab-scroller');
  for (var i = 0, tabScroller; tabScroller = tabScrollers[i]; i++) {
    mdc.tabScroller.MDCTabScroller.attachTo(tabScroller);
  }
}

function initSwitchControls() {
  var switchControls = $('.mdc-switch');
  for (var i = 0, switchControl; switchControl = switchControls[i]; i++) {
    mdc.switchControl.MDCSwitch.attachTo(switchControl);
  }
}

function initDataTables() {
  var dataTables = $('.mdc-data-table');
  for (var i = 0, dataTable; dataTable = dataTables[i]; i++) {
    new MDCDataTable(dataTable);
  }
}

function initSelects() {
  var selects = $('.mdc-select:not(.mdc-select--checkbox)');
  for (var i = 0, select; select = selects[i]; i++) {
    new SelectMenuWithSearch(select);
  }
}

function initCheckboxSelects() {
  var selects = $('.mdc-select.mdc-select--checkbox');
  for (var i = 0, select; select = selects[i]; i++) {
    new CheckBoxMenuSelect(select);
  }
}

function initMenus() {
  var menus = $('.mdc-menu').not('.mdc-select .mdc-menu').not('.time-picker__wrapper .mdc-menu');
  for (var i = 0, menu; menu = menus[i]; i++) {
    menu.mdc = mdc.menu.MDCMenu.attachTo(menu);
    listenToMDCMenuEvents(menu.mdc);
  }
}
/*
function initTreeCheckboxLists() {
  var checkBoxLists = $('.mdc-list.mdc-checkbox-list.mdc-list--parent:not(.mdc-list--nested)').not('.mdc-menu .mdc-list');
  for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
    new TreeCheckboxList(checkBoxList);
  }
}
*/
function initTreeCheckboxLists() {
  var checkBoxLists = $('.mdc-multiselection-list');
  for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
    new MultiSelectionList(checkBoxList);
  }
}

function initLists() {
  var lists = $('.mdc-list:not(.mdc-checkbox-list):not(.mdc-list--nested):not(.mdc-list--parent)').not('.mdc-menu .mdc-list');
  for (var i = 0, list; list = lists[i]; i++) {
    list.mdc = mdc.list.MDCList.attachTo(list);
    list.mdc.singleSelection = true;
  }
}

function initCheckboxLists() {
  var checkBoxLists = $('.mdc-list.mdc-checkbox-list:not(.mdc-list--nested):not(.mdc-list--parent)').not('.mdc-menu .mdc-list');
  for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
    list.mdc = mdc.list.MDCList.attachTo(checkBoxList);
    list.mdc.singleSelection = false;
  }
}

function initTimePickers() {
  var timePickers = $('.time-picker__wrapper');
  for (var i = 0, timePicker; timePicker = timePickers[i]; i++) {
    new TimePicker(timePicker);
  }
}

function initDatePickers() {
  var datePickers = $('.date-picker__wrapper');
  for (var i = 0, datePicker; datePicker = datePickers[i]; i++) {
    new DatePicker(datePicker);
  }
}

function initCalendarPreviews() {
  var calendarPreviews = $('.calendar-preview');
  for (var i = 0, calendarPreview; calendarPreview = calendarPreviews[i]; i++) {
    new MDCCalendarPreview(calendarPreview);
  }
}

function initActividadComposers() {
  var actividadComposers = $('.actividad-composer__wrapper');
  for (var i = 0, actividadComposer; actividadComposer = actividadComposers[i]; i++) {
    new ActividadComposer(actividadComposer);
  }
}

function initEyeToggleButtons() {
  var eyeToggleButtons = $('.mdc-button--eye-toggle');
  for (var i = 0, eyeToggleButton; eyeToggleButton = eyeToggleButtons[i]; i++) {
    $(eyeToggleButton).click(function(e) {
      removeTooltip();
      $(this).find('.mdc-icon').toggle();
      switch ($(this).attr('data-mdc-tooltip')) {
        case 'Mostrar':
          $(this).attr('data-mdc-tooltip', 'Ocultar');
          break;
        case 'Ocultar': 
          $(this).attr('data-mdc-tooltip', 'Mostrar');
          break;
        case 'Esconder para los alumnos':
          $(this).attr('data-mdc-tooltip', 'Hacer visible para los alumnos');
          break;
        case 'Hacer visible para los alumnos': 
          $(this).attr('data-mdc-tooltip', 'Esconder para los alumnos');
          break;
      }
    });
  }
}

function initInlineAppendButtons() {
  var inlineAppendButtons = $('.inline-append__button');
  for (var i = 0, inlineAppendButton; inlineAppendButton = inlineAppendButtons[i]; i++) {
    new InlineAppend($(inlineAppendButton));
  }
}

function initTooltips(wrapper = undefined) {
  var tooltips;
  if (wrapper) {
    tooltips = $(wrapper).find('[data-mdc-tooltip]');
  } else {
    tooltips = $('[data-mdc-tooltip]');
  }

  for (var i = 0, tooltip; tooltip = tooltips[i]; i++) {
    new MDCTooltip(tooltip);
  }
}

function initInlineEdits(wrapper = undefined) {
  var inlineEdits;
  if (wrapper) {
    inlineEdits = $(wrapper).find('.mdc-inline-editable__wrapper');
  } else {
    inlineEdits = $('.mdc-inline-editable__wrapper:visible');
  }

  for (var i = 0, inlineEdit; inlineEdit = inlineEdits[i]; i++) {
    new MDCInlineEdit($(inlineEdit));
  }
}

initSortableWrappers();
initChipsets();
initInputChipsets();
initFilterChipsets();
initTextFields();
initSearchTextFields();
initCheckboxes();
initRadioWrappers()
initTabScrollers();
initSwitchControls();
initDataTables();
initSelects();
initCheckboxSelects();
initMenus();
initTreeCheckboxLists();
initLists();
initCheckboxLists();
initTimePickers();
initDatePickers();
initCalendarPreviews();
initActividadComposers();
initEyeToggleButtons();
initInlineAppendButtons();
initTooltips();
initInlineEdits();
