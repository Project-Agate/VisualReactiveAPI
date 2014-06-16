/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./lib/utilities.ts" />

interface UserElement {
  uid: string;
  clientRect: ClientRect;
}

interface ElementDetail {
  uid: string;
  events: string[];
  attributes: string[];
  isPlaceholder: boolean;
}

class Webview {
  static widget: Element;
  static elements: Element[];
  static mouseX: number;
  static mouseY: number;
  static selectingMask: Element;
  static selecting: boolean = false;

  static init() {
    Webview.widget = $('body').children()[0];
    var collection = document.querySelector('[vrac-collection]');
    var viewTemplate = document.querySelector('template[vrac-view]');
    if(collection && viewTemplate) {
      var view = viewTemplate['content'].cloneNode(true);
      collection.appendChild(view);
    }

    Webview.elements = $('[id^=VRAC],[class^=VRAC]').toArray();
  }

  static userElementFromElement(element: Element): UserElement {
    return element ? {
      uid: Webview.findUID(element),
      clientRect: element.getBoundingClientRect(),
    } : null;
  }

  static elementDetailFromElement(element: Element): ElementDetail {
    return element ? {
      uid: Webview.findUID(element),
      isPlaceholder: $(element).attr("vrac-placeholder") !== undefined ? true : false,
      events: ['click', 'change', 'keypress'],
      attributes: ['value', 'innerHTML'],
    } : null; 
  }

  static findUID(element: Element): string {
    var uid;
    var id = $(element).attr('id');
    if(id.indexOf('VRAC') === 0) {
      uid = '#' + id;
    }
    else {
      $(element).attr('class').split(/\s+/).forEach(function(klass) {
        if(klass.indexOf('VRAC') !== 0)
          uid = '.' + klass;
      });
    }
    return uid;
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

  static startSelecting() {
    Webview.selecting = true;
    $(Webview.widget).on('mousemove', function(event) {
      var element: Element = Webview.getCurrentElement();
      Webview.setSelectingMask(element);
    });
  }

  static stopSelecting() {
    Webview.selecting = false;
    $(Webview.widget).off('mousemove');
    $(Webview.widget).off('mouseleave');
  }

  static clearSelection() {
    Webview.setSelectingMask(null);
  }

  static getCurrentElementDetail(): ElementDetail {
    return Webview.elementDetailFromElement(Webview.getCurrentElement());
  }

  static getCurrentElement(): Element {
    var element = null;
    Webview.elements.forEach(function(elem) {
      if(Webview.contains(elem.getBoundingClientRect(), Webview.mouseX, Webview.mouseY)) {
        if(!element || !isAncestor(elem, element)) {
          element = elem;
        }
      }
    });
    return element;
  }

  static contains(clientRect: ClientRect, x: number, y: number): boolean {
    return x >= clientRect.left && x <= clientRect.right &&
           y >= clientRect.top && y <= clientRect.bottom;
  }

  static setSelectingMask(element: Element) {
    var selectingClass = 'vrac-agate-selecting';

    $(Webview.selectingMask).remove();
    $('.'+selectingClass).removeClass(selectingClass);

    if(element) {
      $(element).addClass(selectingClass);

      var $selectingMask = $('<div>');
      var clientRect = element.getBoundingClientRect();
      $('body').append($selectingMask);
      $selectingMask.css({
        position: 'absolute',
        top: clientRect.top - 4,
        left: clientRect.left - 4,
        width: clientRect.width + 8,
        height: clientRect.height + 8,
        borderRadius: 4,
        backgroundColor: 'rgb(67, 127, 174)',
        opacity: 0.5,
      });
      $selectingMask.on('mouseleave', function(event) {
        if(Webview.selecting)
          Webview.clearSelection();
      });
      Webview.selectingMask = $selectingMask.get(0);
    }
  }
}

var VRAC = VRAC || {};
VRAC.Webview = Webview;

$(document).on('mousemove', function(event) {
  Webview.mouseX = event.clientX;
  Webview.mouseY = event.clientY;
});

Webview.init();
Webview.startSelecting();

