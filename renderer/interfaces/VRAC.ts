import Widget = require('./Widget');

export interface App {
  [filePath: string]: string;
}

export interface Program {
  widgets: Widgets;
  signals: Signals;
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

export interface Demuxer extends Signal {
  inputRef: string;
  outputs: {uid: string; key:string;}[];
  isOnArray: boolean;
}

export interface Placeholder extends Signal {
  widgetRef: string;
  selector: string;
}

export interface Element extends Signal {
  widgetRef: string;
  selector: string;
}

export interface Event extends Signal {
  elementRef: string;
  eventType: string;
}

export interface RAttribute extends Signal {
  elementRef: string;
  name: string;
}

export interface WAttribute extends Signal {
  elementRef: string;
  signalRef: string;
  name: string;
}

export interface DataSource extends Signal {
  initialValue: any;
  mutatorRefs: string[];
}

export interface Constant extends Signal {
  value: any;
  valueType: string;
}
