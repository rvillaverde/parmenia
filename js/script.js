let dialog, drawer, header, appBar;

$(function() {
  $('.user-roles-wrapper .mdc-icon-button').click(function() { $(this).closest('.user-roles-wrapper').hide(); });
  $('.mdc-top-app-bar #nav-menu-toggle input[type=checkbox]').prop('checked', false);

  drawer = $('.mdc-drawer');
  header = $('.mdc-header');
  appBar = $('.mdc-top-app-bar');

  if (drawer) {
    $(window).scroll(function() {
      onScroll();
    });

    onScroll();
  }

  initDynamicCTAs();

  $('.user-roles-wrapper input').change(roleSelection);
  roleSelection({ currentTarget: $('.user-roles-wrapper input[checked]') });

  //smoothscroll
  if ($('.mdc-drawer a[href^="#"]').length > 0) {
    $('.mdc-drawer a[href^="#"]').on('click', smoothScroll);
  }

  $('.cards--selectable .mdc-card').click(function(e) {
    let card = $(e.currentTarget);
    card.closest('.cards--selectable').find('.mdc-card').removeClass('mdc-card--selected');
    setoggleCardSelection(card);
  });

  $('.user-roles-wrapper').mousedown(onGrab);
  $('.collapse-link input').change(collapse);
  $('.mdc-top-app-bar__section#nav-menu-toggle input[type="checkbox"]').click(toggleNavMenu);

  $(`.global-notification__wrapper`).find('.dismiss-button').click(function() {
    $(this).closest(`.global-notification__wrapper`).removeClass('visible');
  });

  $('#notificaciones-menu-toggle input').change(handleNotificationsToggle);
  $('.toggle-password-visibility').click(togglePasswordVisibility)
});

function togglePasswordVisibility(e) {
  let input = $(e.currentTarget).closest('.mdc-text-field').find('input');
  $(this).toggleClass('eye-off-icon eye-on-icon');
  if (input.attr('type') === 'text') {
    input.attr('type', 'password');
  } else {
    input.attr('type', 'text');
  }
}

function handleNotificationsToggle(e) {
  if ($(this).prop('checked')) {
    $(document).on('click', handleDocumentClick);
  } else {
    $(document).off('click', handleDocumentClick);
  }
}

function handleDocumentClick(e) {
  if ($('#notificaciones-menu-toggle').find($(e.target)).length === 0) {
    let input = $('#notificaciones-menu-toggle input');
    input.prop('checked', !input.prop('checked'));
    input.trigger('change');
  }
}

function showGlobalNotification(type) {
  $(`.global-notification__wrapper.${ type }`).addClass('visible');
  setTimeout(function(){ $(`.global-notification__wrapper.${ type }`).removeClass('visible') }, 3000);
}

function initDynamicCTAs() {
  $('[data-dynamic-cta-target]').change(function(e, detail) {
    if (detail) {
      let target = $($(this).attr('data-dynamic-cta-target')).toggleClass('initially-hidden', !detail.show);
    } else {
      let target = $($(this).attr('data-dynamic-cta-target')).toggleClass('initially-hidden');
    }
  });
}

function smoothScroll(e) {
  e.preventDefault();
  $(window).off("scroll");
  
  $('.mdc-list-item').removeClass('mdc-list-item--current');
  $(this).closest('.mdc-list-item').addClass('mdc-list-item--current');

  var target = this.hash;
  $target = $(target);
  $('html, body').stop().animate({
    'scrollTop': $target.offset().top-appBar.height() - 12
  }, 500, 'swing', function () {
    $(window).scroll("scroll", onScroll);
    onScroll();
    //window.location.hash = target;
  });
}

function toggleNavMenu(e) {
  let isChecked = $(e.currentTarget).prop('checked');
  if (isChecked) {
    $('body').addClass('nav-menu-open');
  } else {
    $('body').removeClass('nav-menu-open');
  }
}

function onScroll() {
  console.log();
  fixed();
  updateDrawer();
}

function updateDrawer() {
  if ($('.mdc-drawer a[href^="#"]').length === 0) {
    return;
  }

  const scrollTop = $(this).scrollTop();
  const threshold = header.height();
  let sectionId;

  if (scrollTop < threshold) {
    $('.mdc-drawer .mdc-list-item').removeClass('mdc-list-item--current');
    $('.mdc-drawer .mdc-list-item:first-child').addClass('mdc-list-item--current');
  }

  $('.main-wrapper section').each(function(i, section) {
    let position = section.getBoundingClientRect();
    if (position.top < threshold && (position.top + position.height) >= threshold) {
      sectionId = $(section).attr('id');
      $(`.mdc-list-item[data-section='${ sectionId }']`).addClass('mdc-list-item--current');
      $(`.mdc-list-item:not([data-section='${ sectionId }'])`).removeClass('mdc-list-item--current');
    } else if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      $('.mdc-drawer .mdc-list-item').removeClass('mdc-list-item--current');
      $('.mdc-drawer .mdc-list-item:nth-last-child(2)').addClass('mdc-list-item--current');
    }
  });
}

function fixed() {
  const scrollTop = $(this).scrollTop();
  if (header.height() > scrollTop) {
    drawer.removeClass('fixed');
    drawer.css('top', `${ header.height() + appBar.height() }px`);
  } else {
    drawer.addClass('fixed');
    drawer.css('top', `${ appBar.height() }px`);
  }
};

function collapse(e) {
  e.stopPropagation();
  let target = $(e.target);
  let parent = target.closest('.collapsable-wrapper');

  if (target.closest('.mdc-top-app-bar').length > 0 && !$('body').hasClass('nav-menu-open'))
    return;

  if (target.is(":checked")) {
    parent.find('> .collapsable').slideDown();
  } else {
    parent.find('> .collapsable').slideUp();
  }
}

function removeTooltip() {
  $('.mdc-tooltip').remove();
}

function addToBag(element) {
  removeTooltip();
  if ($(element).hasClass('mdc-button--active')) {
    $(element).removeClass('mdc-button--active');
    $(element).attr('data-mdc-tooltip', 'Agregar a la mochila');
  } else {
    $(element).addClass('mdc-button--active');
    $(element).attr('data-mdc-tooltip', 'Quitar de mochila');
  }
}

function toggleView(element) {
  $(element).closest('.mdc-button--toggle').find('.mdc-button').removeClass('mdc-button--active');
  $(element).addClass('mdc-button--active');
  let view = $(element).attr('data-toggle-view');
  let toggable = $(element).closest('.toggable');
  toggable.find(`.toggle-target`).hide();
  toggable.find(`.toggle-target[data-toggle-view='${ view }']`).show();
}

function setoggleCardSelection(card) {
  card.toggleClass('mdc-card--selected');
}

function selectItems(wrapperId, dialogId) {
  let selectableId = wrapperId.split('#').join('');
  let ids = $(`.selection-wrapper__target[data-name=${ wrapperId }]`).find(`input[name=${ selectableId }]`).val();

  let data = {};
  data[wrapperId] = ids ? ids.split(',') : [];

  openDialog(dialogId, data);
}

function submitTable(table, dialogId) {
  let selectedRows = $(`.mdc-data-table[data-name=${ table }]`)[0].component.selectedRows();
  let data = {};
  data[table] = selectedRows;

  openDialog(dialogId, data);
}

function submitTreeSelection(treeSelection, dialogId, includeParent) {
  let multiSelectionList = $(`.mdc-multiselection-list[data-name=${ treeSelection }]`)[0];

  let data = {};
  data[treeSelection] = multiSelectionList.component.selectedItems(includeParent);

  openDialog(dialogId, data);
}

function openDialog(dialogId, data) {
  closeDialog();

  let dialogEl;
  if (dialogId) {
    dialogEl = $(`.mdc-dialog#${ dialogId }`);
  } else  {
    dialogEl = $('.mdc-dialog')[0];
  }

  if (data) {
    Object.keys(data).forEach(function(key) {
      dialogEl.find(`[data-name=${ key }]`)[0].component.update(data[key]);
    });
  }

  dialog = new mdc.dialog.MDCDialog(dialogEl[0]);
  dialog.open();
}

function getSelectedRows(table) {
  let chips = [];
  let selectedRows = table.find('.mdc-data-table__row.mdc-data-table__row--selected');
  selectedRows.each(function(i, row) {
    let chip = $(chipHTML.replace('%ID%', $(row).attr('data-row-id')).replace('%LABEL%', $(row).attr('data-chip-label')));
    chips.push(chip);
  });
  return chips;
}

function closeDialog() {
  if (dialog) {
    dialog.close();
  }
}

function clearForm(form) {
  $(form).find("input[name][type=checkbox]").prop('checked', false);
  $(form).find("input[name][type=radio]").prop('checked', false);
  $(form).find("input[name][type=hidden]").val('');
  $(form).find("input[name][type=text]").val('');
  $(form).find("input[name]").trigger('change');
}

function getFormFields(form) {
  var fields = {};
  $(form).serializeArray().forEach(function(field) {
    if (fields[field.name]) {
      fields[field.name] = `${ fields[field.name] },${ field.value }`;
    } else {
      fields[field.name] = field.value;
    }
  });
  return fields;
}

function roleSelection(e) {
  var role = $(e.currentTarget).val();
  $('body').attr('data-role', role);
}

let dragTarget;
function onDrag(e) {
  if (!dragTarget) {
    console.log('Warning! No drag target.');
    return;
  }
  dragTarget.css('left', `${ dragTarget.position().left + e.originalEvent.movementX }px`);
  dragTarget.css('top', `${ dragTarget.position().top + e.originalEvent.movementY }px`);
}

function onLetGo() {
  dragTarget.removeClass('dragging');
  dragTarget = undefined;
  $(document).off('mousemove', onDrag);
  $(document).off('mouseup', onLetGo);
}

function onGrab(e) {
  dragTarget = $(e.currentTarget);
  dragTarget.addClass('dragging');
  $(document).on('mousemove', onDrag);
  $(document).on('mouseup', onLetGo);
}

function newDrawerSectionHandler(element) {
  /* aca estaria bueno que desde el backend venga un numero para usar como id y asegurarse que sea unico */
  let id = `nueva-seccion-${ $('.mdc-drawer .mdc-drawer__content .mdc-list-item').length + 1 }`;
  element.find('.mdc-list-item').attr('data-section', id);
  element.find('.mdc-list-item').removeClass('mdc-list-item--current');
  element.find('.mdc-list-item a').attr('href', `#${ id }`);
  element.find('.mdc-list-item a').on('click', smoothScroll);
  element.find('section').attr('id', id);
  element.find('.mdc-button--eye-toggle').click(function(e) {
    $(this).find('.mdc-icon').toggle();
    $(this).closest('.mdc-list-item').toggleClass('disabled-section');
  });

  element.find('.mdc-inline-editable__wrapper').each(function(i, wrapper) {
    new MDCInlineEdit($(wrapper));
  });
}

function updateSectionName(wrapper) {
  let listItem = wrapper.closest('.mdc-list-item');

  let oldValue = listItem.attr('data-section');
  let index = listItem.attr('data-section').split('-').pop();

  let newName = listItem.find('.mdc-inline-editable__input').val();
  let normalizedName = newName.toLowerCase().split(' ').join('-')
                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                      .replace("'", "").replace('"', '');
  let newId = `${ encodeURI(normalizedName) }-${ index }`;

  listItem.find('a .mdc-list-item__text').text(newName);
  listItem.attr('data-section', newId);
  listItem.find('a').attr('href', `#${ newId }`);
  $(`#${ oldValue }`).find('.headline-wrapper :header').text(newName);
  $(`#${ oldValue }`).attr('id', newId);
}
