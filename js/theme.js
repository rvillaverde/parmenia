/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/

const chipHtml = `
  <div id='%id%' data-index='%index%' class='mdc-chip' role='row'>
    <span class='mdc-chip__text mdc-typography--body2'>%name%</span>
  </div>`;

class SelectMenuWithSearch {
  constructor(select) {
    let self = this;

    $(select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.select = mdc.select.MDCSelect.attachTo(select);
  }

  handleSearch(input) {
    this.select.menu_.list_.listElements.forEach(function(element) {
      let name = $(element).text().trim();
      if (input.length > 0 && name.toLowerCase().indexOf(input) === -1) {
        $(element).hide();
      } else {
        $(element).show();
      }
    });
  }
}

class CheckBoxMenuSelect {
  constructor(select) {
    let self = this;
    $(select).find('.mdc-list-item').each(function(i, option) {
      $(option).click(function(e) {
        e.stopPropagation();
        if ($(option).hasClass('mdc-list-item--disabled'))
          return;

        const index = $(e.currentTarget).index();
        // Mark checkbox as checked if user clicked on li element
        if (!$(e.target).is('label'))
          self.select.menu_.list_.foundation_.toggleCheckboxAtIndex_(index, e.target === e.currentTarget);

        // Handle selection
        self.handleSelection(index);
      });
    });

    $(select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.select = mdc.select.MDCSelect.attachTo(select);
  }

  handleSearch(input) {
    this.select.menu_.list_.listElements.forEach(function(element) {
      let name = $(element).text().trim();
      if (input.length > 0 && name.toLowerCase().indexOf(input) === -1) {
        $(element).hide();
      } else {
        $(element).show();
      }
    });
  }

  handleSelection(index) {
    let self = this;

    let selectedIndex = this.select.menu_.list_.selectedIndex;
    let selectedText = selectedIndex.length > 0 ? `${ selectedIndex.length } selected` : '';
    let selectedItems = selectedIndex.map(function(i) {
      let item = $(self.select.menu_.list_.listElements[i]);
      //selectedText = selectedText + `${ item.attr('data-value') },`;
      return { name: item.text().trim(), id: item.attr('data-value'), index: i };
    })

    this.select.foundation_.adapter_.setSelectedText(selectedText);
    if (selectedIndex.indexOf(index) > -1) {
      this.select.foundation_.adapter_.addClassAtIndex(index, 'mdc-list-item--selected');
      this.select.foundation_.adapter_.setAttributeAtIndex(index, 'aria-selected', 'true');
    } else {
      this.select.foundation_.adapter_.removeClassAtIndex(index, 'mdc-list-item--selected');
      this.select.foundation_.adapter_.removeAttributeAtIndex(index, 'aria-selected');
    }

    this.updateChipset(selectedItems);
  }

  updateChipset(items) {
    let chipSet = $(this.select.root_).find('.mdc-chip-set');
    chipSet.empty();

    if (!items) return;

    items.forEach(function(item) {
      let html = chipHtml.replace('%id%', item.id).replace('%name%', item.name).replace('%index%', item.index);
      //let html = $(`<div id='${ item.id }' class='mdc-chip' role='row'><span class='mdc-chip__text mdc-typography--body2'>${ item.name }</span></div>`);
      chipSet.append(html);
    });
  }
}

class TreeCheckboxList {
  constructor(list) {
    var mdcList = mdc.list.MDCList.attachTo(list);
    mdcList.singleSelection = false;

    var self = this;
    mdcList.listen('MDCList:action', function(e) {
      self.handleSelection($(e.currentTarget), e.detail.index);
    });
  }

  handleSelection(target, index) {
    let item = target.find('.mdc-list-item').eq(index);
    let input = item.find('.mdc-checkbox input')[0];

    if (input) {
      if (item.next('.mdc-list').length > 0) {
        let isChecked = item.find('.mdc-checkbox input').prop('checked');
        input.indeterminate = undefined;
        input.checked = isChecked;
        this.triggerChangeEvent(input);

        this.toggleChildren(item.next('.mdc-list'), isChecked);
      }
    } else {
      input = item.find('.mdc-radio input');
      this.uncheckSiblings(input);
    }

    // toggle parent if target item is part of a nested list
    if (item.closest('.mdc-list').hasClass('mdc-list--nested')) {
      this.toggleParent(item);
    } 
  }

  toggleChildren(list, isChecked) {
    let self = this;

    list.find('.mdc-checkbox input').each(function(i, input) {
      input.indeterminate = undefined;
      input.checked = isChecked;
      self.triggerChangeEvent(input);
    });
  }

  toggleParent(item) {
    let parent = item.closest('.mdc-list--nested').closest('.mdc-nested-list__wrapper').find('> .mdc-list-item').find('.mdc-checkbox input, .mdc-radio input')[0];
    let list = item.closest('.mdc-list--nested');

    let inputs = list.find('> .mdc-list-item, > .mdc-nested-list__wrapper > .mdc-list-item').find('.mdc-checkbox input').length;
    let checkedInputs = list.find('> .mdc-list-item, > .mdc-nested-list__wrapper > .mdc-list-item').find('.mdc-checkbox input:checked').length;
    let mixedInputs = list.find('> .mdc-list-item, > .mdc-nested-list__wrapper > .mdc-list-item').find('.mdc-checkbox input[aria-checked=mixed]').length;

    if ($(parent).attr('type') === 'checkbox') {
      if (mixedInputs > 0) {
        parent.indeterminate = 'indeterminate';
      } else if (checkedInputs === 0) {
        parent.indeterminate = undefined;
        parent.checked = false;
      } else if (checkedInputs === inputs) {
        parent.indeterminate = undefined;
        parent.checked = true;
      } else {
        parent.indeterminate = 'indeterminate';
      }

      this.triggerChangeEvent(parent);

      if ($(parent).closest('.mdc-list').hasClass('mdc-list--nested')) {
        this.toggleParent($(parent));
      }
    } else if ($(parent).attr('type') === 'radio') {
      if (checkedInputs + mixedInputs > 0) {
        parent.checked = true;
        this.triggerChangeEvent(parent);
        this.uncheckSiblings($(parent));
      }
    }
  }

  uncheckSiblings(element) {
    let self = this;
    let siblings = $(element).closest('.mdc-list--parent').siblings();

    siblings.find('.mdc-checkbox input[type=checkbox]:checked, .mdc-checkbox input[type=checkbox][aria-checked=mixed]').each(function(i, input) {
      input.indeterminate = undefined;
      input.checked = false;
      self.triggerChangeEvent(input);
    });
  }

  triggerChangeEvent(element) {
    var event = document.createEvent('Event');
    event.initEvent('change', true, true);
    element.dispatchEvent(event);
  }
}

class ActividadComposer {
  constructor() {
    if (!$('.actividad-composer__wrapper .draggable').length)
      return;

    $('.draggable').draggable({
      helper: function() {
        return $(this).find('.actividad-component').clone().addClass('dragging').appendTo('.actividad-composer').show();
      },
      cursor: 'grabbing',
      containment: "document"
    });

    $('.droppable').droppable({
      accept: '.draggable',
      drop: function(event, ui) {
        let item = $(ui.draggable).find('.actividad-component').clone();
        item.find('.actividad-component__actions .mdc-icon-button').click(function(e) {
          $(this).closest('.actividad-component').remove();
        });

        $(this).append(item).ready(function() {
          if (item.find('#editor').length) {
            let toolbar = [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote', 'code-block'],
              [{ 'header': 1 }, { 'header': 2 }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'header': [1, 2, false] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              ['clean'] 
            ];
            var editor = new Quill(item.find('#editor')[0], {
              modules: { toolbar: toolbar },
              theme: 'snow'
            });
          }
        });
      }
    });

    //$('.droppable').sortable({ cursor: "grabbing" });
  }
}

function openMenu(menu) {
  menu.open = true;
}

function updateTableCounter(table, counter) {
  counter.find('#quantity').text(table.getSelectedRowIds().length);
}

var menus = $('.mdc-menu');
for (var i = 0, menu; menu = menus[i]; i++) {
  mdc.menu.MDCMenu.attachTo(menu);
}

var chipsets = $('.mdc-chip-set');
for (var i = 0, chipset; chipset = chipsets[i]; i++) {
  let mdcChipset = mdc.chips.MDCChipSet.attachTo(chipset);
}

var textFields = $('.mdc-text-field');
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}

var checkboxes = $('.mdc-checkbox');
for (var i = 0, checkbox; checkbox = checkboxes[i]; i++) {
  mdc.checkbox.MDCCheckbox.attachTo(checkbox);
}

var tabScrollers = $('.mdc-tab-scroller');
for (var i = 0, tabScroller; tabScroller = tabScrollers[i]; i++) {
  mdc.tabScroller.MDCTabScroller.attachTo(tabScroller);
}

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
}

var lists = $('.mdc-list:not(.mdc-checkbox-list):not(.mdc-list--nested):not(.mdc-list--parent)');
for (var i = 0, list; list = lists[i]; i++) {
  var list = mdc.list.MDCList.attachTo(list);
  list.singleSelection = true;
}

var checkBoxLists = $('.mdc-list.mdc-checkbox-list:not(.mdc-list--nested):not(.mdc-list--parent)');
for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
  var mdcList = mdc.list.MDCList.attachTo(checkBoxList);
  mdcList.singleSelection = false;
}

var checkBoxLists = $('.mdc-list.mdc-checkbox-list.mdc-list--parent:not(.mdc-list--nested)');
for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
  new TreeCheckboxList(checkBoxList);
}

var selects = $('.mdc-select:not(.mdc-select--checkbox)');
for (var i = 0, select; select = selects[i]; i++) {
  //mdc.select.MDCSelect.attachTo(select);
  new SelectMenuWithSearch(select);
}

var selects = $('.mdc-select.mdc-select--checkbox');
for (var i = 0, select; select = selects[i]; i++) {
  new CheckBoxMenuSelect(select);
}
