function collapse(e) {
  let target = $(e.target);
  let parent = target.closest('.collapsable-wrapper');
  parent.find('.collapsable').slideToggle();
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
        console.log(section.attr('id'));
      } 
/*      console.log($(section).height());
      console.log($(section).offset().top - scrollTop);*/
      //if ($(section).position().top > 0) activeSection = section;
/*      if ($(section).offset().top < 0 && $(section).height() + scrollTop > 0) {
        console.log(section);

      }*/
    });

    $('.mdc-list-item').each(function(i, item) {
      if ($(item).attr('data-section') == sectionId) {
        console.log($(item).attr('data-section'));
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
