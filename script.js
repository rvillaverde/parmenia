function collapse() {
  return false;
}

$(function() {
  const drawer = $('.mdc-drawer');
  const header = $('.mdc-header');
  const appBar = $('.mdc-top-app-bar');

  window.onscroll = fixed;
  fixed();

  function fixed() {
    const scrollTop = $(document).scrollTop();
    if (header.height() > scrollTop) {
      drawer.removeClass('fixed');
      drawer.css('top', `${ header.height() }px`);
    } else {
      drawer.addClass('fixed');
      drawer.css('top', `${ appBar.height() }px`);
    }
  }
});
