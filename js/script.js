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

  $('.user-roles-wrapper input').change(roleSelection);
  roleSelection({ currentTarget: $('.user-roles-wrapper input[checked]') });

  //smoothscroll
  $('.mdc-drawer a[href^="#"]').on('click', smoothScroll);

  $('.cards--selectable .mdc-card').click(function(e) {
    let card = $(e.currentTarget);
    card.closest('.cards--selectable').find('.mdc-card').removeClass('mdc-card--selected');
    setoggleCardSelection(card);
  });

  $('.user-roles-wrapper').mousedown(onGrab);
  $('.collapse-link input').change(collapse);
  $('.mdc-top-app-bar__section#nav-menu-toggle input[type="checkbox"]').click(toggleNavMenu);
});

function smoothScroll(e) {
  e.preventDefault();
  $(window).off("scroll");
  
  $('.mdc-list-item').removeClass('mdc-list-item--activated');
  $(this).addClass('mdc-list-item--activated');

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
  fixed();
  updateDrawer();
}

function updateDrawer() {
  const scrollTop = $(this).scrollTop();
  
  let sections = $('.main-wrapper section');
  let sectionId;

  let threshold = header.height();

  if (scrollTop < threshold) {
    return;
  }

  sections.each(function(i, section) {
    section = $(section);
    if (scrollTop > section.position().top && section.position().top + section.height() - scrollTop >= 0) {
      sectionId = section.attr('id');
    } 
  });

  $('.mdc-list-item').each(function(i, item) {
    if ($(item).attr('data-section') == sectionId) {
      $(item).addClass('mdc-list-item--activated');
    } else {
      $(item).removeClass('mdc-list-item--activated');
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

function openDialog(dialogId) {
  if (dialog) {
    dialog.close();
  }

  if (dialogId) {
    dialog = new mdc.dialog.MDCDialog($(`.mdc-dialog#${ dialogId }`)[0]);
  } else  {
    dialog = new mdc.dialog.MDCDialog($('.mdc-dialog')[0]);
  }

  dialog.open();
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
  function updateSectionName(e) {
    let listItem = $(e.currentTarget).closest('.mdc-list-item');

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

  function toggleEditMode(e) {
    let listItem = $(e.currentTarget).closest('.mdc-list-item');
    listItem.find('.mdc-inline-editable__toggle').toggleClass('mdc-button--active');
    listItem.find('a, .mdc-inline-editable__input').toggle();
    updateSectionName(e);
  }

  let id = `nueva-seccion-${ $('.mdc-drawer .mdc-drawer__content .mdc-list-item').length + 1 }`;
  element.find('.mdc-list-item').attr('data-section', id);
  element.find('.mdc-list-item a').attr('href', `#${ id }`);
  element.find('.mdc-list-item a').on('click', smoothScroll);
  element.find('section').attr('id', id);
  element.find('.mdc-button--eye-toggle').click(function(e) {
    $(this).find('.mdc-icon').toggle();
    $(this).closest('.mdc-list-item').toggleClass('disabled-section');
  });
  element.find('.mdc-inline-editable__input').hide();
  element.find('.mdc-inline-editable__toggle').click(toggleEditMode);
  element.find('.mdc-inline-editable__input').keypress(function(e) {
    let keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13'){
      toggleEditMode(e);
    }
  });
}
