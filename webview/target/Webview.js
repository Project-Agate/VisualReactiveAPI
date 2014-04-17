/// <reference path="../definitions/jquery.d.ts" />

var Webview = (function () {
    function Webview() {
    }
    Webview.container = function () {
        return $('#main-widget-container');
    };
    Webview.loadAndParseHTML = function (html, css) {
        var widget = Webview.widget = $(html).get(0);
        var $style = $('<style type="text/css">').html(css);

        Webview.container().append(widget);
        $('head').append($style);

        var elements = Webview.elements = $('[id^=VRAC]').toArray();

        return elements.map(Webview.toUserElement).map(Webview.offsetUserElement);
    };
    Webview.toUserElement = function (element) {
        return {
            uid: $(element).attr('id'),
            clientRect: element.getBoundingClientRect()
        };
    };

    Webview.offsetUserElement = function (userElement) {
        return {
            uid: userElement.uid,
            clientRect: Webview.offsetClientRect(userElement.clientRect, Webview.widget.getBoundingClientRect())
        };
    };
    Webview.offsetClientRect = function (clientRect, rootClientRect) {
        return {
            width: clientRect.width,
            height: clientRect.height,
            top: clientRect.top - rootClientRect.top,
            bottom: clientRect.bottom - rootClientRect.top,
            left: clientRect.left - rootClientRect.left,
            right: clientRect.right - rootClientRect.left
        };
    };
    return Webview;
})();

var VRAC = VRAC || {};
VRAC.Webview = Webview;
