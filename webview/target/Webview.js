/// <reference path="../definitions/jquery.d.ts" />

var Webview = (function () {
    function Webview() {
    }
    Webview.container = function () {
        return $('#main-widget-container');
    };
    Webview.loadAndParseHTML = function (html, css) {
        var $widget = $(html);
        var $style = $('<style type="text/css">').html(css);

        Webview.container().append($widget);
        $('head').append($style);

        return [];
    };
    return Webview;
})();

var VRAC = VRAC || {};
VRAC.Webview = Webview;
