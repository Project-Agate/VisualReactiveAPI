/// <reference path="../definitions/jquery.d.ts" />

interface UserElement {
  uid: string;
  clientRect: ClientRect;
}

class Webview {
  static widget: Element;
  static elements: Array<Element>;
  static container() { return $('#main-widget-container') }
  static loadAndParseHTML(html: string, css: string): Array<UserElement> {
    var widget: Element = Webview.widget = $(html).get(0)
    var $style: JQuery = $('<style type="text/css">').html(css);

    Webview.container().append(widget);
    $('head').append($style);

    var elements: Array<HTMLElement> = Webview.elements = $('[id^=VRAC]').toArray();

    return elements.map(Webview.toUserElement).map(Webview.offsetUserElement);
  }
  static toUserElement(element: Element): UserElement {
    return {
      uid: $(element).attr('id'),
      clientRect: element.getBoundingClientRect(),
    };
  }

  static offsetUserElement(userElement: UserElement): UserElement {
    return {
      uid: userElement.uid,
      clientRect: Webview.offsetClientRect(userElement.clientRect,
                                           Webview.widget.getBoundingClientRect()),
    }
  }
  static offsetClientRect(clientRect: ClientRect, rootClientRect: ClientRect): ClientRect {
    return {
      width: clientRect.width,
      height: clientRect.height,
      top: clientRect.top - rootClientRect.top,
      bottom: clientRect.bottom - rootClientRect.top,
      left: clientRect.left - rootClientRect.left,
      right: clientRect.right - rootClientRect.left,
    }
  }
}

var VRAC = VRAC || {};
VRAC.Webview = Webview;

