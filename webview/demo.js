$(document).ready(function() {
  var html = $('#widget-template-exchange-rate-converter-html').html();
  var css =  $('#widget-template-exchange-rate-converter-css').html();
  var userElements = Webview.loadAndParseHTML(html, css);

  console.log(userElements);
});