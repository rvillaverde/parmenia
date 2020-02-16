$(function() {
  if ($('.parallax')) {
    initParallax();
    parallaxScroll();
  }
});

function parallaxScroll() {
  console.log('lalala');  
  let scrolled = $(window).scrollTop();

  $('.parallax-image').css('top', function() {
    return 0 - (scrolled * Number($(this).attr('data-speed'))) + 'px';
  });
}

function initParallax() {
  $(window).scroll(parallaxScroll);
}
