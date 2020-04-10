/*var buttons = $('.mdc-button, .mdc-fab');
for (var i = 0, button; button = buttons[i]; i++) {
  mdc.ripple.MDCRipple.attachTo(button);
}
*/

function listenToMDCMenuEvents(mdcMenu) {
  mdcMenu.listen('MDCMenuSurface:opened', function(e) {
    $(this).css('max-height', 192);
  });
}

class MDCSearchTextField {
  constructor(textField) {
    this.textField = $(textField);
    let self = this;
    this.textField.find('input').focus(function(e) {
      e.stopImmediatePropagation();
      self.textField.find('.mdc-floating-label').hide();
    });

    this.textField.find('input').blur(function(e) {
      e.stopImmediatePropagation();
      if ($(this).val().length === 0) {
        self.textField.find('.mdc-floating-label').show();
      } 
    });

    this.mdcTextField = mdc.textField.MDCTextField.attachTo(textField);
  }
}

class SelectMenuWithSearch {
  constructor(select) {
    this.select = select;
    let self = this;

    $(select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.mdcSelect = mdc.select.MDCSelect.attachTo(this.select);

    this.mdcSelect.listen('MDCSelect:change', function(e) {
      $(self.select).trigger('change', [{ show: true }]);
    });

    listenToMDCMenuEvents(this.mdcSelect.menu_);
  }

  handleSearch(input) {
    this.mdcSelect.menu_.list_.listElements.forEach(function(element) {
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
    this.select = select;
    let self = this;

    $(this.select).find('.mdc-list-item').each(function(i, option) {
      $(option).click(function(e) {
        e.stopPropagation();
        if ($(option).hasClass('mdc-list-item--disabled'))
          return;

        const index = $(e.currentTarget).index();
        // Mark checkbox as checked if user clicked on li element
        if (!$(e.target).is('label'))
          self.mdcSelect.menu_.list_.foundation_.toggleCheckboxAtIndex_(index, e.target === e.currentTarget);

        // Handle selection
        self.handleSelection(index);
      });
    });

    $(this.select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.mdcSelect = mdc.select.MDCSelect.attachTo(select);

    this.mdcSelect.menu_.listen('MDCMenuSurface:opened', function(e) {
      $(this).css('max-height', 192);
    });
  }

  handleSearch(input) {
    this.mdcSelect.menu_.list_.listElements.forEach(function(element) {
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

    let selectedIndex = this.mdcSelect.menu_.list_.selectedIndex;
    let selectedText = selectedIndex.length > 0 ? `${ selectedIndex.length } selected` : '';
    let selectedItems = selectedIndex.map(function(i) {
      let item = $(self.mdcSelect.menu_.list_.listElements[i]);
      //selectedText = selectedText + `${ item.attr('data-value') },`;
      return { name: item.text().trim(), id: item.attr('data-value'), index: i };
    })

    this.mdcSelect.foundation_.adapter_.setSelectedText(selectedText);
    if (selectedIndex.indexOf(index) > -1) {
      this.mdcSelect.foundation_.adapter_.addClassAtIndex(index, 'mdc-list-item--selected');
      this.mdcSelect.foundation_.adapter_.setAttributeAtIndex(index, 'aria-selected', 'true');
    } else {
      this.mdcSelect.foundation_.adapter_.removeClassAtIndex(index, 'mdc-list-item--selected');
      this.mdcSelect.foundation_.adapter_.removeAttributeAtIndex(index, 'aria-selected');
    }

    this.updateChipset(selectedItems);

/*    console.log(this.select)
    $(this.select).trigger('change');*/
  }

  updateChipset(items) {
    let chipSet = $(this.mdcSelect.root_).find('.mdc-chip-set');
    chipSet.empty();

    if (!items) return;

    items.forEach(function(item) {
      let html = CheckBoxMenuSelect.chipHtml.replace('%id%', item.id).replace('%name%', item.name).replace('%index%', item.index);
      chipSet.append(html);
    });
  }
}

CheckBoxMenuSelect.chipHtml = `
  <div id='%id%' data-index='%index%' class='mdc-chip' role='row'>
    <span class='mdc-chip__text mdc-typography--body2'>%name%</span>
  </div>`;

class TreeCheckboxList {
  constructor(list) {
    var mdcList = mdc.list.MDCList.attachTo(list);
    mdcList.singleSelection = false;

    let self = this;
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
  constructor(wrapper) {
    this.wrapper = $(wrapper);
    let self = this;

    var FontAttributor = Quill.import('attributors/class/font');
    FontAttributor.whitelist = [ 'poppins', 'lato' ];
    Quill.register(FontAttributor, true);

    this.wrapper.find('.draggable').draggable({
      helper: function() {
        return $(this).find('.actividad-component').clone().addClass('dragging').appendTo('.actividad-composer').show();
      },
      cursor: 'grabbing',
      containment: "document"
    });

    $(document).mousedown(function(e) {
      if (!self.wrapper.is(':visible'))
        return;

      if ($(e.target).closest('.actividad-component.edit-mode').length == 0) {
        if (self.wrapper.find('.actividad-component.edit-mode').length > 0) {
          self.wrapper.find('.actividad-component.edit-mode').removeClass('edit-mode');
          self.wrapper.find('.droppable').sortable("enable");
        }
        if ($(e.target).closest('.actividad-component').length == 0) {
          let activeItem = $('.actividad-composer .actividad-component:has(.actividad-component__actions.visible)');
          activeItem.find('.actividad-component__actions').removeClass('visible');
        }
      }
    });

    this.wrapper.find('.droppable').droppable({
      accept: '.draggable',
      activeClass: 'highlight',
      drop: function(event, ui) {
        let item = $(ui.draggable).find('.actividad-component').clone();
        item.find('.actividad-component__actions > .delete-button').click(function(e) {
          $(this).closest('.actividad-component').remove();
        });

        item.find('.actividad-component__actions > .edit-button').click(function(e) {
          self.wrapper.find('.droppable').sortable("disable");
          $(this).closest('.actividad-component').toggleClass('edit-mode');
        });

        $(this).append(item).ready(function() {
          item.on('touchstart', function(e) {
            let activeItem = item.closest('.actividad-composer').find('.actividad-component:has(.actividad-component__actions.visible)');
            activeItem.find('.actividad-component__actions').removeClass('visible');
            if (activeItem != item)
              item.find('.actividad-component__actions').toggleClass('visible');
          });

          if (item.find('#editor').length > 0) {
            let toolbar = [
              ['bold', 'italic', 'underline', 'strike'],
              ['blockquote'],
              [{ 'header': [1, 2, false] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              /*[{ 'size': ['small', false, 'large', 'huge'] }],*/
              [{ 'color': [] }/*, { 'background': [] }*/],
              [{ 'align': [] }],
              ['clean'] 
            ];
            var editor = new Quill(item.find('#editor')[0], {
              modules: { toolbar: toolbar },
              theme: 'snow'
            });
          } else if (item.find('.mdc-checkbox__wrapper').length > 0) {
            function handleDeleteOption(e) {
              deleteOption($(e.currentTarget));
              e.stopPropagation();
            }

            function deleteOption(option) {
              option.closest('.mdc-form-field').remove();
            }

            item.find('.mdc-form-field:not(#new-option) .delete-button').click(handleDeleteOption);

            let newOptionItem = item.find('#new-option');
            newOptionItem.click(function(e) {
              if (newOptionItem.closest('.edit-mode').length == 0)
                return;

              let newOption = newOptionItem.clone();
              newOption.attr('id', '');
              newOption.find('input.mdc-inline-editable__input').prop('disabled', false);
              newOption.addClass('mdc-inline-editable__wrapper');
              newOption.find('input.mdc-inline-editable__input').val(`Opción ${ item.find('.mdc-form-field:not(#new-option)').length + 1 }`);
              newOption.find('.delete-button').click(handleDeleteOption);
              newOption.find('.plus-icon').remove();
              newOption.insertBefore(newOptionItem);
            });
          }
        });
      }
    });

    this.wrapper.find('.droppable').sortable({
      //cancel: ".edit-mode",
      items: '.actividad-component:not(.edit-mode)',
      cursor: "grabbing"
    });
  }
}

class MDCSortable {
  constructor(wrapper) {
    $(wrapper).sortable({
      items: '> .sortable',
      handle: '.drag-button',
      connectWith: '.sortable-wrapper',
      cursor: 'grabbing',
      start: function() {
        $('body').addClass('dragging');
        $('.mdc-tooltip').remove();
      },
      stop: function() {
        $('body').removeClass('dragging');
      }
    });
  }
}

class TimePicker {
  constructor(wrapper) {
    this.wrapper = $(wrapper);
    this.generateHours();
    this.handleSelection(this.wrapper.find('.mdc-list-item--selected'));
    this.initMenu();
  }

  initMenu() {
    let self = this;

    this.mdcMenu = mdc.menu.MDCMenu.attachTo(this.wrapper.find('.mdc-menu')[0]);
    listenToMDCMenuEvents(this.mdcMenu);
    this.mdcMenu.listen('MDCMenu:selected', function(e) {
      self.handleSelection($(e.detail.item));
    });
    this.wrapper.find('.time-picker--button').click(function(e) {
      self.handleClick();
    });
  }

  generateHours(from = 0, to = 24) {
    let self = this;
    let nextTime = this.getNextTime();
    for (var hour = from; hour < to; hour++) {
      [0, 15, 30, 45].forEach(function(minute) {
        let id = `${ ('0' + hour).slice(-2) }${ ('0' + minute).slice(-2) }`;
        let label = `${ ('0' + hour).slice(-2) }:${ ('0' + minute).slice(-2) }`;
        let item = $(TimePicker.itemHTML.replace('%id%', id).replace('%label%', label));
        if (id == nextTime) {
          item.addClass('mdc-list-item--selected');
          item.attr('aria-selected', true);
        }
        self.wrapper.find('.mdc-list').append(item);
      });
    }
  }

  getNextTime() {
    let delta = this.wrapper.hasClass('from') ? 1 : 2;
    let hours = new Date().getHours() + delta;
    return `${ ('0' + (hours % 24)).slice(-2) }00`; 
  }

  handleClick() {
    this.mdcMenu.open = true;
  }

  handleSelection(selected) {
    this.wrapper.find('.time-picker--button .mdc-button__label').text(selected.find('span').text().trim());
    this.wrapper.find('input[type=hidden]').val(selected.attr('data-value'));
  }
}

TimePicker.itemHTML = `<li class="mdc-list-item" data-value="%id%" role="option">
                        <span class="mdc-typography--body2">%label%</span>
                      </li>`;

class DatePicker {
  constructor(datePicker) {
    this.datePicker = datePicker;
    let self = this;

    this.materialPicker = new MaterialDatepicker(this.datePicker, {
      color: '#6274E5',
      lang: 'es',
      orientation: 'portrait',
      outputElement: '.picker-output',
      outputFormat: 'DD/MM/YYYY',
      position: 'fixed',
      zIndex: 200,
      onNewDate: function(date) {
        self.updateButtonLabel(date);
      },
      onOpen: function(date) {
        self.rectifyPosition();
      }
    });
  }

  rectifyPosition() {
    let inputPadding = Number($(this.datePicker).css('padding-left').split('px')[0]);
    let inputPosition = this.datePicker.getBoundingClientRect();

    $(this.materialPicker.picker).css('left', inputPosition.left + inputPadding);

    if (this.spaceBelow() >= $(this.materialPicker.picker).outerHeight()) {
      $(this.materialPicker.picker).css('top', inputPosition.top + inputPosition.height + inputPadding);
    } else {
      let position = inputPosition.top - $(this.materialPicker.picker).outerHeight();
      $(this.materialPicker.picker).css('top', position - inputPadding);
    }
  }

  spaceBelow() {
    let inputPosition = this.datePicker.getBoundingClientRect();
    return $(window).height() - inputPosition.top - inputPosition.height;
  }

  updateButtonLabel(date) {
    $(this.datePicker).find('.mdc-button__label').text(this.formatDate(date));
  }

  formatDate(date) {
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
}

class MDCCalendarPreview {
  constructor(calendarPreview) {
    this.calendarPreview = calendarPreview;
    let self = this;

    this.materialPicker = new MaterialDatepicker(this.calendarPreview, {
      color: '#6274E5',
      lang: 'es',
      outputFormat: 'DD/MM/YYYY',
      position: 'static',
      openOn: 'direct',
      zIndex: 200,
      onNewDate: function(date) {
        // change calendar
      }
    });
  }
}

class InlineAppend {
  constructor(button) {
    this.button = button;
    let self = this;

    button.click(function(e) {
      let cloneSelector = self.button.attr('data-clone-element');
      let handlerFn = self.button.attr('data-clone-handler');
      let cloneElement = $(cloneSelector).clone();
      window[handlerFn](cloneElement);


      cloneElement.children().each(function(i, element) {
        let targetSelector = $(element).attr('data-clone-target');
        $(targetSelector).append($(element));
        initTooltips($(element));
        initInlineEdits($(element));
      });
    });
  }
}

class MDCTooltip {
  constructor(tooltip) {
    this.tooltip = $(tooltip);
    let self = this;

    this.tooltip.on('touchstart', function(e) {
      self.tooltip.off('mouseenter', self.handleMouseEnter);
    });
    this.tooltip.mouseenter(this, self.handleMouseEnter);
    this.tooltip.mouseleave(self.handleMouseLeave);
  }

  showTooltip() {
    if ($('body').hasClass('dragging'))
      return;

    let text = this.tooltip.attr('data-mdc-tooltip');
    let mdcTooltip = $(`<div class='mdc-typography--caption mdc-tooltip'>${ text }</div>`);
    let coords = this.tooltip[0].getBoundingClientRect();
    $('body').append(mdcTooltip);
    let left = coords.x - (mdcTooltip.outerWidth() - coords.width)/2;
    let top = coords.bottom + 8;
    mdcTooltip.css({top: top,left: left}).show();
    mdcTooltip.addClass('visible');
  }

  handleMouseEnter(e) {
    let self = e.data;
    self.showTooltip();
    $(window).scroll(function() {
      self.handleScroll();
    });
  }

  handleMouseLeave() {
    $('.mdc-tooltip').remove();
  }

  handleScroll() {
    $('.mdc-tooltip').remove();
  }
}

class MDCInlineEdit {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.target = this.wrapper.find(this.wrapper.attr('data-editable-target'));
    this.editing = false;

    if (this.wrapper.find('.mdc-rich-text-editor').length) {
      this.editor = new MDCRichTextEditor(this.wrapper.find('.mdc-rich-text-editor')[0]);
    }

    let self = this;

    if (!this.editor) {
      this.wrapper.find('.mdc-inline-editable__input').hide();
      this.wrapper.find('.mdc-inline-editable__input').keypress(function(e) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '13') {
          self.toggleMode(e);
        }
      });
    }

    this.wrapper.find('.mdc-inline-editable__toggle, .mdc-inline-editable__actions .edit-button').click(function(e) {
      self.toggleMode();
    });
  }

  toggleMode() {
    this.editing = !this.editing;
    this.wrapper.toggleClass('mdc-inline-editable__wrapper--edit-mode');
    this.wrapper.find('.mdc-inline-editable__toggle').toggleClass('mdc-button--active');
    let self = this;

    if (this.editor) {
      let isEmpty = $(this.target)
                    .find('.mdc-inline-editable__input .mdc-rich-text-editor .ql-editor')
                    .hasClass('ql-blank');

      if (isEmpty) {
        $(this.target).addClass('no-content');
        $(this.target).toggle();
      } else {
        $(this.target).removeClass('no-content');
      }

      if (this.editing) {
        this.editor.enable();
      } else {
        this.editor.disable();
      }
    } else {
      this.wrapper.find('.mdc-inline-editable__preview, .mdc-inline-editable__input').toggle();

      if (this.editing) {
        let value = this.wrapper.find('.mdc-inline-editable__preview').text();
        this.wrapper.find('.mdc-inline-editable__input').val(value);
        this.wrapper.find('.mdc-inline-editable__input').focus();
      } else {
        let newValue = this.wrapper.find('.mdc-inline-editable__input').val();
        this.wrapper.find('.mdc-inline-editable__preview').text(newValue);
      }
    }

    if (this.editing) {
      $(document).on('mousedown', self, MDCInlineEdit.handleDocumentMouseup);
    } else {
      $(document).off('mousedown', MDCInlineEdit.handleDocumentMouseup);
      if (this.wrapper.attr('data-edit-callback')) {
        let handlerFn = this.wrapper.attr('data-edit-callback');
        window[handlerFn](this.wrapper);
      }
    }
  }

  static handleDocumentMouseup(e) {
    let self = e.data;
    if (self.wrapper.find($(e.target)).length === 0) {
      self.toggleMode();
    }
  }
}

class MDCRichTextEditor {
  constructor(editor) {
    this.editor = $(editor);

    var LinkBlot = Quill.import('formats/link');
    LinkBlot.sanitize = function(url) {
      return url;
    };

    var ImageBlot = Quill.import('formats/image');
    ImageBlot.sanitize = function(url) {
      return url;
    };

    let toolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ 'header': [1, 2, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      /*[{ 'size': ['small', false, 'large', 'huge'] }],*/
      [{ 'color': [] }/*, { 'background': [] }*/],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean'] 
    ];

    this.mdcEditor = new Quill(editor, {
      modules: { 
        toolbar: toolbar,
        imageResize: {
          displaySize: true
        }
      },
      theme: 'snow'
    });

    this.disable();
  }

  enable() {
    this.editor.find('.overlay').show();
    this.editor.find('img').off('click');
    this.mdcEditor.enable();
  }

  disable() {
    this.editor.find('.overlay').hide();
    this.editor.find('img').click(function(e) {
      e.stopPropagation();
    });
    this.mdcEditor.disable();
    // aca habria que llamar al server para guardar la info
  }
}

class MDCFilterChipset {
  constructor(chipset) {
    this.chipset = $(chipset);
    this.mdcChipset = mdc.chips.MDCChipSet.attachTo(chipset);
    let self = this;

    this.mdcChipset.listen('MDCChip:selection', function(e) {
      self.handleSelection();
    });
  }

  handleSelection() {
    let selectedChipIds = this.mdcChipset.selectedChipIds.join(',');
    let targetSelector = this.chipset.attr('data-filter-target');

    if (!selectedChipIds.length) {
      $(targetSelector).show();
      return;
    }

    $(targetSelector).each(function(i, target) {
      if (selectedChipIds.indexOf($(target).attr('data-filter-value')) > -1) {
        $(target).show();
      } else {
        $(target).hide();
      }
    })
  }
}
/*
function openMenu(menu) {
  menu.open = true;
}*/


var mdcDrawer = $('.mdc-drawer');
mdcDrawer.find('.mdc-button--eye-toggle').click(function(e) {
  $(this).closest('.mdc-list-item').toggleClass('disabled-section');
});

var sortableWrappers = $('.sortable-wrapper');
for (var i = 0, sortableWrapper; sortableWrapper = sortableWrappers[i]; i++) {
  new MDCSortable(sortableWrapper);
}

var chipsets = $('.mdc-chip-set:not(.mdc-chip-set--filter)');
for (var i = 0, chipset; chipset = chipsets[i]; i++) {
  mdc.chips.MDCChipSet.attachTo(chipset);
}

var chipsets = $('.mdc-chip-set.mdc-chip-set--filter');
for (var i = 0, chipset; chipset = chipsets[i]; i++) {
  new MDCFilterChipset(chipset);
}

var textFields = $('.mdc-text-field:not(.mdc-text-field--search)');
for (var i = 0, textField; textField = textFields[i]; i++) {
  mdc.textField.MDCTextField.attachTo(textField);
}

var searchTextFields = $('.mdc-text-field.mdc-text-field--search');
for (var i = 0, searchTextField; searchTextField = searchTextFields[i]; i++) {
  new MDCSearchTextField(searchTextField);
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

function updateTableCounter(table, counter) {
  counter.find('#quantity').text(table.getSelectedRowIds().length);
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

var selects = $('.mdc-select:not(.mdc-select--checkbox)');
for (var i = 0, select; select = selects[i]; i++) {
  new SelectMenuWithSearch(select);
}

var selects = $('.mdc-select.mdc-select--checkbox');
for (var i = 0, select; select = selects[i]; i++) {
  new CheckBoxMenuSelect(select);
}

var menus = $('.mdc-menu').not('.mdc-select .mdc-menu').not('.time-picker__wrapper .mdc-menu');
for (var i = 0, menu; menu = menus[i]; i++) {
  var mdcMenu = mdc.menu.MDCMenu.attachTo(menu);
  listenToMDCMenuEvents(mdcMenu);
}

var checkBoxLists = $('.mdc-list.mdc-checkbox-list.mdc-list--parent:not(.mdc-list--nested)').not('.mdc-menu .mdc-list');
for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
  new TreeCheckboxList(checkBoxList);
}

var lists = $('.mdc-list:not(.mdc-checkbox-list):not(.mdc-list--nested):not(.mdc-list--parent)').not('.mdc-menu .mdc-list');
for (var i = 0, list; list = lists[i]; i++) {
  var mdcList = mdc.list.MDCList.attachTo(list);
  mdcList.singleSelection = true;
}

var checkBoxLists = $('.mdc-list.mdc-checkbox-list:not(.mdc-list--nested):not(.mdc-list--parent)').not('.mdc-menu .mdc-list');
for (var i = 0, checkBoxList; checkBoxList = checkBoxLists[i]; i++) {
  var mdcList = mdc.list.MDCList.attachTo(checkBoxList);
  mdcList.singleSelection = false;
}

var timePickers = $('.time-picker__wrapper');
for (var i = 0, timePicker; timePicker = timePickers[i]; i++) {
  new TimePicker(timePicker);
}

var datePickers = $('.date-picker--button');
for (var i = 0, datePicker; datePicker = datePickers[i]; i++) {
  new DatePicker(datePicker);
}

var calendarPreviews = $('.calendar-preview');
for (var i = 0, calendarPreview; calendarPreview = calendarPreviews[i]; i++) {
  new MDCCalendarPreview(calendarPreview);
}

var actividadComposers = $('.actividad-composer__wrapper');
for (var i = 0, actividadComposer; actividadComposer = actividadComposers[i]; i++) {
  new ActividadComposer(actividadComposer);
}

var eyeToggleButtons = $('.mdc-button--eye-toggle');
for (var i = 0, eyeToggleButton; eyeToggleButton = eyeToggleButtons[i]; i++) {
  $(eyeToggleButton).click(function(e) {
    $(this).find('.mdc-icon').toggle();
  });
}

var inlineAppendButtons = $('.inline-append__button');
for (var i = 0, inlineAppendButton; inlineAppendButton = inlineAppendButtons[i]; i++) {
  new InlineAppend($(inlineAppendButton));
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
/*
  if (wrapper && $(wrapper).hasClass('.mdc-inline-editable__wrapper')) {
    new MDCInlineEdit($(wrapper));
  }*/
}

initTooltips();
initInlineEdits();

/*var editors = $('.mdc-rich-text-editor');
for (var i = 0, editor; editor = editors[i]; i++) {
  new MDCRichTextEditor(editor);
}*/

