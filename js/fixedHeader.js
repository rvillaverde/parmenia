$(function() {
  let headerHeight = $('.mdc-header').height();
  let navHeight = $('.mdc-top-app-bar').height();

  $(window).scroll(function() {
    let scrolled = $(window).scrollTop();

    if (scrolled > 200) {
      $('.mdc-header').addClass('sticky');
      //$('.top-nav').css(top: `${ navHeight }px`);
    } else {
      $('.mdc-header').removeClass('sticky');
    }
  });
});
