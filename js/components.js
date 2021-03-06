function listenToMDCMenuEvents(mdcMenu) {
  mdcMenu.listen('MDCMenuSurface:opened', function(e) {
    $(this).css('max-height', 192);
    if ($(this).hasClass('mdc-menu-surface--fixed')) {
      rectifyPosition(this);

      $(window).one('scroll', function() {
        mdcMenu.open = false;
      });
    }
  });
}

function rectifyPosition(menu) {
  let select = $(menu).prev();
  let padding = Number(select.css('padding-top').split('px')[0]);
  let position = select[0].getBoundingClientRect();

  $(menu).css('left', position.left + padding);
  $(menu).css('top', position.top + position.height + padding);
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

class MDCRadioButtonWrapper {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.wrapper).attr('data-name')));
    $(this.wrapper).append(this.hiddenInput);
    this.wrapper.component = this;
    let self = this;

    $(this.wrapper).find('.mdc-radio').each(function(i, radio) {
      radio.querySelector('input').mdc = mdc.radio.MDCRadio.attachTo(radio);
      const formField = mdc.formField.MDCFormField.attachTo(document.querySelector('.mdc-form-field'));
      formField.input = radio;
      $(radio).find('input').attr('name', `${ $(radio).find('input').attr('name') }-radio`);
      $(radio).change(function() {
        self.handleChange(this);
      });
    });
  }

  update(data) {
    $(this.wrapper).find('.mdc-radio').each(function(i, radio) {
      if ($(radio).find('input').val() === data) {
        radio.querySelector('input').mdc.checked = true;
        radio.dispatchEvent(new CustomEvent('change'));
        radio.querySelector('input').dispatchEvent(new CustomEvent('change', { detail: { show: true } }));
      }
    });
  }

  handleChange(radio) {
    this.updateHiddenInput(radio);
    $(this.wrapper).find('.mdc-radio input:not(:checked)[data-dynamic-cta-target]').each(function(i, input) {
      $($(input).attr('data-dynamic-cta-target')).addClass('initially-hidden');
    });
  }

  updateHiddenInput(radio) {
    this.hiddenInput.val($(radio).find('input').val());
    this.hiddenInput[0].dispatchEvent(new CustomEvent('change'));
  }
}

class SelectMenuWithSearch {
  constructor(select) {
    this.select = select;
    this.select.component = this;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.select).attr('data-name')));
    $(this.select).append(this.hiddenInput);

    let self = this;

    $(select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.select.mdc = mdc.select.MDCSelect.attachTo(this.select);

    this.select.mdc.listen('MDCSelect:change', function(e) {
      self.select.dispatchEvent(new CustomEvent('change', { detail: { show: true } }));
      self.updateHiddenInput(e.detail.value);
    });

    listenToMDCMenuEvents(this.select.mdc.menu_);
  }

  update(data) {
    this.select.mdc.value = data;
  }

  handleSearch(input) {
    this.select.mdc.menu_.list_.listElements.forEach(function(element) {
      let name = $(element).text().trim();
      if (input.length > 0 && name.toLowerCase().indexOf(input) === -1) {
        $(element).hide();
      } else {
        $(element).show();
      }
    });
  }

  updateHiddenInput(selectedItem) {
    this.hiddenInput.val(selectedItem);
    this.hiddenInput[0].dispatchEvent(new CustomEvent('change'));
  }
}

class CheckBoxMenuSelect {
  constructor(select) {
    this.select = select;
    this.select.component = this;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.select).attr('data-name')));
    $(this.select).append(this.hiddenInput);

    let self = this;

    $(this.select).find('.mdc-list-item').each(function(i, option) {
      $(option).click(function(e) {
        e.stopPropagation();
        if ($(option).hasClass('mdc-list-item--disabled'))
          return;

        const index = $(e.currentTarget).index();
        // Mark checkbox as checked if user clicked on li element
        if (!$(e.target).is('label'))
          self.select.mdc.menu_.list_.foundation_.toggleCheckboxAtIndex_(index, e.target === e.currentTarget);

        // Handle selection
        self.handleSelection(index);
      });
    });

    $(this.select).find('.mdc-select__menu--search input').keyup(function(e) {
      self.handleSearch($(this).val().toLowerCase());
    });

    this.select.mdc = mdc.select.MDCSelect.attachTo(select);
    //this.select.mdc.menu_.list_.singleSelection = false;
    this.select.mdc.menu_.listen('MDCMenuSurface:opened', function(e) {
      $(this).css('max-height', 192);
    });

    this.select.mdc.menu_.listen('MDCMenuSurface:closed', function(e) {
      self.validate();
    });
  }

  refresh() {
    let self = this;
    $(self.select).find(`.mdc-list-item[aria-checked=true]`).each(function(i, item) {
      self.select.mdc.menu_.list_.foundation_.toggleCheckboxAtIndex_($(item).index(), true);
    });
    this.select.mdc.selectedIndex = -1;
    this.updateChipset();
  }

  update(data) {
    this.refresh();
    let self = this;
    let ids = (typeof data === 'string') ? data.split(',') : data.map((item) => item.id);
    ids.forEach(function(id) {
      let index = $(self.select).find(`.mdc-list-item[data-value=${ id }]`).index();
      if (index > -1) {
        self.select.mdc.menu_.list_.foundation_.toggleCheckboxAtIndex_(index, true);
        self.handleSelection(index);
        self.select.mdc.selectedIndex = index;
      }
    });
  }

  handleSearch(input) {
    this.select.mdc.menu_.list_.listElements.forEach(function(element) {
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

    let selectedIndex = this.select.mdc.menu_.list_.selectedIndex;
    let selectedText = selectedIndex.length > 0 ? `${ selectedIndex.length } selected` : '';
    let selectedItems = selectedIndex.map(function(i) {
      let item = $(self.select.mdc.menu_.list_.listElements[i]);
      //selectedText = selectedText + `${ item.attr('data-value') },`;
      return { name: item.text().trim(), id: item.attr('data-value'), index: i };
    })

    this.select.mdc.foundation_.adapter_.setSelectedText(selectedText);
    if (selectedIndex.indexOf(index) > -1) {
      this.select.mdc.foundation_.adapter_.addClassAtIndex(index, 'mdc-list-item--selected');
      this.select.mdc.foundation_.adapter_.setAttributeAtIndex(index, 'aria-selected', 'true');
    } else {
      this.select.mdc.foundation_.adapter_.removeClassAtIndex(index, 'mdc-list-item--selected');
      this.select.mdc.foundation_.adapter_.removeAttributeAtIndex(index, 'aria-selected');
    }

    this.updateChipset(selectedItems);
    this.updateHiddenInput(selectedItems);
    this.validate();
  }

  validate() {
    let selectedIndex = this.select.mdc.menu_.list_.selectedIndex;
    if ($(this.select).hasClass('mdc-select--required')) {
      if (selectedIndex.length > 0) {
        this.select.mdc.valid = true;
      } else {
        this.select.mdc.valid = false;
      }
    }
  }

  updateChipset(items) {
    let chipSet = $(this.select.mdc.root_).find('.mdc-chip-set');
    chipSet.empty();

    if (!items) return;

    items.forEach(function(item) {
      let html = CheckBoxMenuSelect.chipHtml.replace('%id%', item.id).replace('%name%', item.name).replace('%index%', item.index);
      chipSet.append(html);
    });
  }

  updateHiddenInput(selectedItems) {
    this.hiddenInput.val(selectedItems.map(item => item.id).join(','));
    this.hiddenInput.trigger('change');
  }
}

CheckBoxMenuSelect.chipHtml = `
  <div id='%id%' data-index='%index%' class='mdc-chip' role='row'>
    <span class='mdc-chip__text mdc-typography--body2'>%name%</span>
  </div>`;

class CustomSelect {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.wrapper).attr('data-name')));
    $(this.wrapper).append(this.hiddenInput);
    this.wrapper.component = this;
    this.handleSelection($(this.wrapper).find('.mdc-list-item--selected'));
    this.initMenu();
  }

  initMenu() {
    let self = this;

    this.mdcMenu = mdc.menu.MDCMenu.attachTo($(this.wrapper).find('.mdc-menu')[0]);
    listenToMDCMenuEvents(this.mdcMenu);
    this.mdcMenu.listen('MDCMenu:selected', function(e) {
      self.handleSelection($(e.detail.item));
    });
    $(this.wrapper).find('.custom-select--button').click(function(e) {
      self.handleClick();
    });
  }

  handleClick() {
    this.mdcMenu.open = !this.mdcMenu.open;
  }

  handleSelection(selected) {
    $(this.wrapper).find('.custom-select--button .mdc-button__label').text(selected.find('span').text().trim());
    $(this.wrapper).find('input[type=hidden]').val(selected.attr('data-value'));
  }
}

class MultiSelectionList {
  constructor(multiSelectionList) {
    this.multiSelectionList = multiSelectionList;
    this.multiSelectionList.component = this;
    this.parentLists = [];
    let self = this;

    $(this.multiSelectionList).find('> .mdc-list--parent').each(function(i, parentList) {
      let treeCheckboxList = new TreeCheckboxList(parentList);
      $(treeCheckboxList).change(function(e) {
        $(self.multiSelectionList).trigger('MultiSelectionList:change');
      });
      self.parentLists.push(treeCheckboxList);
    });
  }

  selectedItems(includeParent = false) {
    let selectedItems = [];
    this.parentLists.forEach(function(parent) {
      selectedItems = selectedItems.concat(parent.selectedItems(includeParent));
    });

    return selectedItems;
  }

  update(data) {
    this.parentLists.forEach(function(parent) {
      parent.update(data);
    });
  }
}

class TreeCheckboxList {
  constructor(list) {
    this.list = list;
    this.list.component = this;
    this.list.mdc = mdc.list.MDCList.attachTo(list);
    this.list.mdc.singleSelection = false;

    let self = this;
    this.list.mdc.listen('MDCList:action', function(e) {
      self.handleSelection($(e.currentTarget), e.detail.index);
    });
  }

  selectedItems(includeParent = false) {
    let self = this;
    let selectedItems = [];

    $(this.list).find('.mdc-list-item[aria-checked=true]').each(function(i, item) {
      let next = $(item).next();
      if (!next.hasClass('mdc-list')) {
        selectedItems.push({id: $(item).attr('data-item-id'), label: self.breadcrumLabel(item, includeParent) });
      }
    });

    return selectedItems;
  }

  breadcrumLabel(item, includeParent = false) {
    if ($(item).closest('.mdc-list.mdc-list--nested').length > 0) {
      if (!includeParent && $(item).closest('.mdc-list').prev().closest('.mdc-list').is('.mdc-list--parent')) {
       return `${ $(item).find('.mdc-list-item__text').text().trim() }`;
      } else {
       return `${ this.breadcrumLabel($(item).closest('.mdc-list').prev(), includeParent) } / ${ $(item).find('.mdc-list-item__text').text().trim() }`;
      }
    } else {
      if (includeParent) {
        return $(item).find('.mdc-list-item__text').text().trim();
      } else {
        return '';
      }
    }
  }

  update(data) {
    let self = this;

/*    $(self.list).find('.mdc-list-item').each(function(i, item) {
      let input = $(item).find('input')[0];
      if (data.indexOf($(item).attr('data-item-id')) > -1) {
        self.toggleItem(input, true);
      } else {
        self.toggleItem(input, false);
      }
    });*/
  }

  handleSelection(target, index) {
    let item = target.find('.mdc-list-item').eq(index);
    let input = item.find('.mdc-checkbox input')[0];

    if (input) {
      if (item.next('.mdc-list').length > 0) {
        let isChecked = item.find('.mdc-checkbox input').prop('checked');
        this.toggleItem(input, isChecked);
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

    $(this).trigger('change');
  }

  toggleItem(input, isChecked) {
/*    input.indeterminate = undefined;
    input.checked = isChecked;*/
    input.mdc.checked = isChecked;
    $(input).closest('.mdc-list-item').attr('aria-checked', isChecked);
    //item.toggleClass('mdc-list--selected', isChecked);
    //this.triggerChangeEvent(input);
  }

  toggleChildren(list, isChecked) {
    let self = this;

    list.find('.mdc-checkbox input').each(function(i, input) {
      self.toggleItem(input, isChecked);
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
        parent.mdc.indeterminate = 'indeterminate';
      } else if (checkedInputs === 0) {
        parent.mdc.indeterminate = undefined;
        parent.mdc.checked = false;
      } else if (checkedInputs === inputs) {
        parent.mdc.indeterminate = undefined;
        parent.mdc.checked = true;
      } else {
        parent.mdc.indeterminate = 'indeterminate';
      }

      //this.triggerChangeEvent(parent);

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
    this.wrapper = wrapper;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.wrapper).attr('data-name')));
    $(this.wrapper).append(this.hiddenInput);
    this.wrapper.component = this;
    this.generateHours(6,20);
    this.handleSelection($(this.wrapper).find('.mdc-list-item--selected'));
    this.initMenu();
  }

  initMenu() {
    let self = this;

    this.mdcMenu = mdc.menu.MDCMenu.attachTo($(this.wrapper).find('.mdc-menu')[0]);
    listenToMDCMenuEvents(this.mdcMenu);
    this.mdcMenu.listen('MDCMenu:selected', function(e) {
      self.handleSelection($(e.detail.item));
    });
    $(this.wrapper).find('.time-picker--button').click(function(e) {
      self.handleClick();
    });
  }

  generateHours(from = 0, to = 24) {
    let self = this;
    let nextTime = this.getNextTime(from, to);
    for (var hour = from; hour < to; hour++) {
      [0, 15, 30, 45].forEach(function(minute) {
        let time = `${ ('0' + hour).slice(-2) }:${ ('0' + minute).slice(-2) }`;
        let item = $(TimePicker.timeEl.split('%time%').join(time));
        if (time == nextTime) {
          item.addClass('mdc-list-item--selected');
          item.attr('aria-selected', true);
        }
        $(self.wrapper).find('.mdc-list').append(item);
      });
    }
  }

  update(data) {
    this.handleSelection($(this.wrapper).find(`.mdc-menu .mdc-list-item[data-value='${ data }']`));
  }

  getNextTime(from, to) {
    let delta = $(this.wrapper).hasClass('from') ? 1 : 2;
    let hours = new Date().getHours() + delta;
    if (hours < from || hours >= to) {
      hours = from + delta - 1;
    }
    return `${ ('0' + (hours % 24)).slice(-2) }:00`; 
  }

  handleClick() {
    this.mdcMenu.open = true;
  }

  handleSelection(selected) {
    $(this.wrapper).find('.time-picker--button .mdc-button__label').text(selected.find('span').text().trim());
    $(this.wrapper).find('input[type=hidden]').val(selected.attr('data-value'));
  }
}

TimePicker.timeEl = `<li class="mdc-list-item" data-value="%time%" role="option">
                      <span class="mdc-typography--body2">%time%</span>
                    </li>`;

class DatePicker {
  constructor(datePicker) {
    this.datePicker = datePicker;
    this.datePicker.component = this;
    this.button = $(this.datePicker).find('.date-picker--button')[0];
    this.hiddenInput = $("<input type='hidden' name='%id%'>".replace('%id%', $(this.datePicker).attr('data-name')));
    $(this.datePicker).append(this.hiddenInput);

    let self = this;

    this.materialPicker = new MaterialDatepicker(this.button, {
      color: '#6274E5',
      lang: 'es',
      minDate: new Date().setHours(0,0,0,0),
      orientation: 'portrait',
      outputElement: this.datePicker.querySelector('.picker-output'),
      outputFormat: 'YYYY-MM-DD',
      position: 'fixed',
      zIndex: 200,
      onNewDate: function(date) {
        self.updateButtonLabel(date);
        self.updateHiddenInput(date);
      },
      onOpen: function(date) {
        self.rectifyPosition();
      }
    });

    if (this.datePicker.querySelector('.mdc-button--delete')) {
      this.datePicker.querySelector('.mdc-button--delete').onclick = function() {
        self.updateButtonLabel();
        self.updateHiddenInput();
      };
    }
  }

  update(data) {
    this.materialPicker.newDate(new Date(data));
    this.materialPicker.callbackOnNewDate();
  }

  rectifyPosition() {
    let inputPadding = Number($(this.button).css('padding-left').split('px')[0]);
    let inputPosition = this.button.getBoundingClientRect();

    $(this.materialPicker.picker).css('left', inputPosition.left + inputPadding);

    if (this.spaceBelow() >= $(this.materialPicker.picker).outerHeight()) {
      $(this.materialPicker.picker).css('top', inputPosition.top + inputPosition.height + inputPadding);
    } else {
      let position = inputPosition.top - $(this.materialPicker.picker).outerHeight();
      $(this.materialPicker.picker).css('top', position - inputPadding);
    }
  }

  spaceBelow() {
    let inputPosition = this.button.getBoundingClientRect();
    return $(window).height() - inputPosition.top - inputPosition.height;
  }

  updateButtonLabel(date) {
    if (date) {
      $(this.button).find('.mdc-button__label').text(formatDate(date));
    } else {
      $(this.button).find('.mdc-button__label').text('Seleccionar fecha');
    }
  }

  updateHiddenInput(date) {
    if (date) {
      this.hiddenInput.val(moment(date).format("YYYY-MM-DD"));
    } else {
      this.hiddenInput.val('');
    }
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
      onChange: function(date) {
        $(self.calendarPreview).trigger('CalendarPreview:newDate', [{ date: date }]);
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
        // guardar en base de datos
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

class MDCInputChipset {
  constructor(chipset) {
    this.chipset = chipset;
    this.chipset.component = this;
    this.hiddenInput = $("<input type='hidden' name='%id%'>".split('%id%').join($(this.chipset).attr('data-name')));
    $(this.chipset).append(this.hiddenInput);

    let self = this;

    this.chipset.mdc = mdc.chips.MDCChipSet.attachTo(this.chipset);
    this.chipset.mdc.listen('MDCChip:removal', function(e) {
      console.log('chip removed')
      self.updateHiddenInput();
      $(`.quantity-wrapper[data-quantity=${ $(self.chipset).attr('data-quantity') }] span`).text(self.chipset.mdc.chips.length)
      if (self.chipset.mdc.chips.length === 0) {
        $(self.chipset).addClass('no-content');
      }
    });
  }

  update(data) {
    let self = this;

    $(this.chipset).find('.mdc-chip').remove();
    this.chipset.mdc.chips_ = [];

    if (data) {
      data.forEach(function(item) {
        let chipEl = $(MDCInputChipset.chipEl.split('%id%').join(item.id).split('%label%').join(item.label));
        $(self.chipset).append(chipEl);
        self.chipset.mdc.addChip(chipEl[0]);
      });
      $(this.chipset).removeClass('no-content');
    } else {
      $(this.chipset).addClass('no-content');
    }

    this.updateHiddenInput();

    let quantityWrapper = $(this.chipset).closest('.selection-wrapper').find('.quantity-wrapper');
    if (quantityWrapper.length > 0) {
      quantityWrapper.find('span').text(data.length);
    }
  }

  updateHiddenInput() {
    this.hiddenInput.val(this.chipset.mdc.chips.map((chip) => chip.id).join(','));
    this.hiddenInput.trigger('change');
  }
}

MDCInputChipset.chipEl = `<div class="mdc-chip" role="row" id="%id%">
                            <span role="gridcell">
                              <span role="button" tabindex="0" class="mdc-chip__primary-action">
                                <span class="mdc-chip__text mdc-typography--body2">%label%</span>
                              </span>
                            </span>
                            <span role="gridcell">
                              <i class="mdc-icon small mdc-chip__icon mdc-chip__icon--trailing chip-cross-icon" tabindex="-1" role="button"></i>
                            </span>
                          </div>`;

class MDCFilterChipset {
  constructor(chipset) {
    this.chipset = chipset;
    this.chipset.mdc = mdc.chips.MDCChipSet.attachTo(chipset);
    let self = this;

    this.chipset.mdc.listen('MDCChip:selection', (e) => self.handleSelection());
  }

  handleSelection() {
    let selectedChipIds = this.chipset.mdc.selectedChipIds.join(',');
    let targetSelector = $(this.chipset).attr('data-filter-target');

    if (!selectedChipIds.length) {
      $(targetSelector).show();
      return;
    }

    $(targetSelector).each(function(i, target) {
      $(target).toggle(selectedChipIds.indexOf($(target).attr('data-filter-value')) > -1);
    });
  }
}

class MDCDataTable {
  constructor(table) {
    this.table = table;
    this.counter = $(this.table).find('.mdc-data-table__counter');

    this.searchInput = $(`input[data-table=${ $(this.table).attr('data-table') }]`);
    this.table.component = this;
    this.table.mdc = mdc.dataTable.MDCDataTable.attachTo(this.table);
    let self = this;

    this.hiddenFilters = $(`input.table-filter[data-table=${ $(this.table).attr('data-table') }][type=hidden]`);
    this.hiddenFilters.each(function(i, filter) {
      $(filter).change(function(e) {
        self.handleSearch(self);
      });
    });

    if (this.counter.length) {
      this.table.mdc.listen(mdc.dataTable.events.ROW_SELECTION_CHANGED, function(e) {
        self.updateTableCounter();
      });
      this.table.mdc.listen(mdc.dataTable.events.SELECTED_ALL, function(e) { 
        self.updateTableCounter();
      });
      this.table.mdc.listen(mdc.dataTable.events.UNSELECTED_ALL, function(e) { 
        self.updateTableCounter();
      });
    }

    if (this.searchInput.length) {
      this.searchInput.keyup(function(e) {
        console.log('search')
        self.handleSearch(self);
      });
    }

    if ($(this.table).find('.mdc-data-table__header-cell--with-sort').length > 0) {
      // $(this.table).find('table').tablesorter({ 
      //   selectorSort: '.mdc-data-table__header-cell--with-sort',
      // });
      $(this.table).find('.mdc-data-table__header-cell--with-sort').click(function(e) {
        self.handleSort(e.currentTarget);
      });
    }
  }

  handleSort(button) {
    console.log('handle sort')
    $(button).find('.mdc-icon').toggleClass('sort-up-icon sort-down-icon');
  }

  handleSearch(self) {
    let search = self.searchInput.val().toLowerCase().trim();
    $(self.table).find('.mdc-data-table__content tr').each(function(i, row) {
      let content = $.trim($(row).text()).toLowerCase();

      if (content.indexOf(search) > -1) {
        let show = self.hiddenFilters.length === 0;
        self.hiddenFilters.each(function(i, filter) {
          show = show || $(row).find(`td:nth-of-type(${ $(filter).attr('data-col-index') })`).text().trim().indexOf($(filter).val()) > -1;
        });
        if (show) {
          $(row).show();
        } else {
          $(row).hide();
        }
      } else {
        $(row).hide();
      }
    });
  }

  selectedRows() {
    let selectedRows = [];
    $(this.table).find('.mdc-data-table__row.mdc-data-table__row--selected').each(function(i, row) {
      selectedRows.push({ id: $(row).attr('data-row-id'), label: $(row).attr('data-label') });
    });
    return selectedRows;
  }

  update(data) {
    let self = this;

    if (data.length === 0) {
      $('.mdc-data-table__header-cell--checkbox input')[0].mdc.checked = false;
      $('.mdc-data-table__header-cell--checkbox input')[0].mdc.indeterminate = false;
    } else if (data.length < this.table.mdc.content_.rows.length) {
      $('.mdc-data-table__header-cell--checkbox input')[0].mdc.checked = false;
      $('.mdc-data-table__header-cell--checkbox input')[0].mdc.indeterminate = true;
    }

    $(this.table.mdc.content_.rows).each(function(i, row) {
      let rowId = $(row).attr('data-row-id');
      let check = data.indexOf(rowId) > -1;
      let input = $(self.table).find(`tr[data-row-id=${ rowId }]`).find('.mdc-checkbox input[type=checkbox]');

      if (check != input[0].mdc.checked) {
        input[0].mdc.checked = !input[0].mdc.checked;
        $(row).toggleClass('mdc-data-table__row--selected');
      }
    });

    this.updateTableCounter();
  }

  updateTableCounter() {
    this.counter.find('#quantity').text(this.table.mdc.getSelectedRowIds().length);
  }
}

class MDCForm {
  constructor(form) {
    this.form = $(form);
    let id = this.form.attr('id');
    let submitButton = $(`form#${ id } button[type=submit], button[type=submit][form=${ id }]`);
    submitButton.attr('disabled', true);

    let that = this;
    this.form.find('input, textarea').on('change blur', function() {
      let valid = that.validateForm();
      submitButton.attr('disabled', !valid);
    });

    this.form.submit(function(e) {
      e.preventDefault();
      that.handleFormSubmit();
    });
  }

  handleFormSubmit() {
    let fields = getFormFields(this.form);
    console.log(fields);
  }

  validateForm() {
    let requiredFields = this.getRequiredFields();
    let valid = true;
    requiredFields.each(function(i, field) {
      valid = valid && $(field).val().length > 0 && $(field).closest('.mdc-text-field--invalid').length == 0;
    });
    return valid;
  }

  getRequiredFields() {
    let selector = `input[required][type=text],
                    input[required][type=email],
                    input[required][type=password],
                    textarea[required],
                    .mdc-radio-button__wrapper > input[type=hidden],
                    .selection-wrapper:visible > .mdc-chip-set--input > input[type=hidden],
                    .mdc-select.mdc-select--required:visible > input[type=hidden]`;
    return this.form.find(selector);
  }
}
