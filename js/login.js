function msieversion() {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf("MSIE ");

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    $('input').attr('disabled', true);
    $('#internet-explorer-message').css('top', 0);
    $('#internet-explorer-message').css('padding', '12px');
    $('.alerts-wrapper').hide();
    $('a').removeAttr('href');
  }

  return false;
}

msieversion();
