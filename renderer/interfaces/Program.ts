module VRAC {
  export interface App {
    html: string;
    javascript: string;
  }

  export interface Program {
    widgets: Widgets;
    signals: Signals;
  }

  export interface Widget {
    uid: string;
    htmlPath: string;
  }

  export interface Widgets {
    [uid: string]: Widget; 
  }

  export interface Signals {
    [uid: string]: Signal;  
  }

  export interface Signal {
    type: string;
    uid: string;
    streamName?: string;
  }

  export interface Action extends Signal {
    name: string;
    parameters: Parameter[];
    body: string;
  }

  export interface Parameter {
    name: string;
    valueRef: string;
  }

  export interface Element {
    uid: string;
    widgetRef: string;
    selector: string;
  }

  export interface Event extends Signal {
    elementRef: string;
    eventType: string;
  }

  export interface Attribute extends Signal {
    elementRef: string;
    signalRef: string;
    name: string;
  }

  export interface Constant extends Signal {
    value: any;
    valueType: string;
  }
}
