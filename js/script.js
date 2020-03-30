let dialog, drawer, header, appBar;

$(function() {
  $('.user-roles-wrapper .mdc-icon-button').click(function() { $(this).closest('.user-roles-wrapper').hide(); });

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

  $('.draggable').mousedown(onGrab);
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
    drawer.css('top', `${ header.height() }px`);
  } else {
    drawer.addClass('fixed');
    drawer.css('top', `${ appBar.height() }px`);
  }
};

function collapse(e) {
  let target = $(e.target);
  let parent = target.closest('.collapsable-wrapper');

  if (target.closest('.mdc-top-app-bar').length > 0 && !$('body').hasClass('nav-menu-open'))
    return;

  if (target.is(":checked")) {
    parent.find('.collapsable').slideUp();
  } else {
    parent.find('.collapsable').slideDown();
  }
}

function addToBag(element) {
  if ($(element).hasClass('mdc-button--active')) {
    $(element).removeClass('mdc-button--active');
    $(element).attr('title', 'Agregar a mochila');
  } else {
    $(element).addClass('mdc-button--active');
    $(element).attr('title', 'Quitar de mochila');
  }
}

function toggleView(element) {
  $(element).closest('.mdc-button--toggle').find('.mdc-button').removeClass('mdc-button--active');
  $(element).addClass('mdc-button--active');
  let view = $(element).attr('data-toggle-view');
  let toggable = $(element).closest('.toggable');
  toggable.find(`.toggle-target`).hide();
  toggable.find(`.toggle-target[data-toggle-view='${ view }']`).show();
  console.log(view);
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
