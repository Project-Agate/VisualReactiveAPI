module VRAC {
  export interface App {
    html: string;
    javascript: string;
  }

  export interface Program {
    widgets: {[uid: string]: Widget};
    signals: {[uid: string]: any};
  }

  export interface Widget {
    uid: string;
    htmlPath: string;
  }
}
