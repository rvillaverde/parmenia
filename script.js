let dialog;

function collapse(e) {
  let target = $(e.target);
  let parent = target.closest('.collapsable-wrapper');
  if (target.is(":checked")) {
    parent.find('.collapsable').slideUp();
  } else {
    parent.find('.collapsable').slideDown();
  }
}

function addToBag(element) {
  if ($(element).hasClass('mdc-button--active')) {
    $(element).removeClass('mdc-button--active');
  } else {
    $(element).addClass('mdc-button--active');
  }
  console.log('add to bag');
}

function openDialog(dialogId) {
  console.log(dialogId);
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

$(function() {
  const drawer = $('.mdc-drawer');
  const header = $('.mdc-header');
  const appBar = $('.mdc-top-app-bar');

  if (drawer) {
    $(window).scroll(function() {
      onScroll();
    });

    onScroll();
  }

  //smoothscroll
  $('a[href^="#"]').on('click', function (e) {
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
  });

/*  $('.mdc-menu--click').click(function(e) {
    console.log($(e.target));
    console.log($(e.target).closest('.mdc-menu--click'));
    $(e.target).closest('.mdc-menu--click').find('.mdc-menu').addClass('mdc-menu-surface--open');
  });*/

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

  $('.collapse-link').click(collapse);
});
