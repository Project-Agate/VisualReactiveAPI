/// <reference path="../definitions/jquery.d.ts" />

interface UserElement {
  uid: string;
  clientRect: ClientRect;
}

class Webview {
  static container() { return $('#main-widget-container') }
  static loadAndParseHTML(html: string, css: string): Array<UserElement> {
    var $widget = $(html);
    var $style = $('<style type="text/css">').html(css);

    Webview.container().append($widget);
    $('head').append($style);

    return [];
  }
}

var VRAC = VRAC || {};
VRAC.Webview = Webview;

