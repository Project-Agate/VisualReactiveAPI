module VRAC {
  export interface Program {
    widget: Widget[];
    signal: any[];
  }

  export interface Widget {
    uid: string;
    htmlPath: string;
  }
}
