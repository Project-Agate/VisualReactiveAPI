# API of Visual Reactive project

## Build & Start Server

    cd renderer
    node build.js
    node server.js

## Server API

By default, the server will listenon [localhost:3000](localhost:3000). 

### Compile

* URL: `/compile`
* Method: `POST`
* Parameters: No parameters. The body of request is a JSON-formatted [Program](#program).
* Response: The relative URL of generated website.

**Note:** Remember to set `Content-Type` header as `application/json; charset=utf-8`.

## Data Structures

### UID

The unique ID of almost everything. There are 3 kinds of UID:

1. 16-character random string that consists of numbers and uppercase letters, like `7AL0E139CJ31014A`.
2. User-defined HTML element ID/class. IDs must start with `#VRAC`, like `#VRAC-TWD-field` and classes must start with `.VRAC`, like `.VRAC-item-title-label`.
3. Reserved UID. Such as `document`(`document` of DOM), `timer`(simulating `setTimeout`), `initial`. 

### Program

The top-level structure representing the whole of a web app.

```javascript
{
  widgets: {
    "TT9FRYJJC6ELQLLA": ...,
  },
  signals: {
    "7AL0E139CJ31014A": ...,
    "8KAN1O015CGA10BK": ...,
    ...
  },
}
```

+ **widgets**: A dictionary of [Widget](#widget). For now it contains only one main widget.
+ **signals**: The other stuffs besides HTML code. An element can be a [Action](#action), an [Event](#event), a [RAttribute](#rattribute), a [WAttribute](#wattribute), an [Element](#element) or a [Constant](#constant).

### Widget

A widget, including its HTML and CSS code.

```javascript
{
  uid: "TT9FRYJJC6ELQLLA",
  htmlPath: "/Users/raincole/project/component/index.html",
  renderToRef: "#VRAC-profile",
  isCollection: false
}
```

+ **uid**: [UID](#uid).
+ **htmlPath**: String. The absolute path to the HTML file of this widget.
+ **renderToRef**: [UID](#uid). A reference to the placholder or collection this widget will replace.
+ **isCollection**: Boolean. Whether this widget is a collection? If so, it will be rendered multiple times. See [Collection](#collection).

### Collection

A collection is just a widget with `isCollection` set as `true`. But its HTML needs to satisfy some requirements. 

Collection Example:

```html
<ul id="todo-list" vrac-type="collection">
</ul>

<template vrac-type="view">
<div class="view">
  <input class="toggle VRAC-item-check" type="checkbox">
  <label class="VRAC-item-title-label"></label>
  <button class="VRAC-item-destroy" class="destroy"></button>
</div>
<input class="edit VRAC-item-title" value="Title">
</template>
```

As above code shows, the HTML of a collection consists of two parts: `collection` and `view`. The `collection` is a node with attribute `vrac-type="collection"`, and the `view` is a `<template>` with attribute `vrac-type="view"`. In the runtime, the `view` will be rendered into the `collection`.  

### Signal

When we mention [Signal](#signal) in this specification, it can be a [Action](#action), an [Element](#event), an [Event](#event), a [RAttribute](#rattribute), a [WAttribute](#wattribute), a [Mutable](#mutable) or a [Constant](#constant).

### Action

A general-purpose function.

```javascript
{
  type: "action",
  uid: "5TEJD01MWE4R5DG5",
  name: "twdToUsd",
  parameters: [...],
  body: "var rate = 30.1;\nreturn twd / rate;\n",
}
```

+ **uid**: [UID](#uid).
+ **name**: (optional) String. The name of this action.
+ **parameters**: An array of [Parameter](#parameter)s. The parameters of this action.
+ **body**: String. The body of this action.

### Demuxer

A multi-output mapping function that separate an signal into multiple ones.

```javascript
{
  type: "demuxer",
  uid: "DA74TCGFOJPEMVTI",
  inputRef: "UD0MH7GT7W7ZA0W4",
  outputs: [
    {uid: "JQXGSDQVCU25M60S", key: "date"},
    {uid: "O3MDS0WFTYKLU2PI", key: "toString()"},
  ],
  isOnArray: true
}
```

+ **uid**: [UID](#uid). **Note**: Currently, a demuxer doesn't really need an UID.
+ **inputRef**: [UID](#uid). A reference to the signal that will be separated.
+ **outputs**:
  + **uid**: [UID](#uid).
  + **key**: String. The key used to map the input signal to the output. For example, if the value of input is `{foo: "1", bar: "2"} and the key is `foo`, the value of output will be `"1"`.
+ **isOnArray**: Boolean. When it's `true`, this demuxer will treat input as an array of homogeneous objects instead of a single object. For example, if the value of input is `[{a: 1, b: 2}, {a: 3, b: 4}]` and the key is `a`, the value of output will be `[1, 3]`. If the value of input isn't an array, its behaviour is undefined.

### Parameter

A parameter of certain [Action](#action).

```javascript
{
  name: "twd",
  valueRef: "GDTKI0ANM4IR48US",
}
```

+ **name**: String. The name of this parameter.
+ **valueRef**: [UID](#uid). (optional) A reference to the [Signal](#signal) linked to this parameter. **Note:** If it's null, the value of parameter is `undefined`(not `null`!).

### Element

An HTML element in a certain [Widget](#widget).

```javascript
{
  uid: "#VRAC-twd-field",
  widgetRef: "TT9FRYJJC6ELQLLA",
  selector: "#VRAC-twd-field",
}
```

+ **uid**: [UID](#uid). Generally it's defined by user and with prefix `#VRAC`.
+ **widgetRef**: [UID](#uid). A reference to the widget this element belongs to.
+ **selector**: String. The selector used to select this element in its parent widget. For now it's the same as `uid`.

### Placeholder

In parent widget, a placeholder that will be replaced by child widget 

```javascript
{
  type: "placeholder",
  uid: "#VRAC-profile",
  widgetRef: "0WO8K4R55MPIE7BT",
  selector: "#VRAC-profile",
}
```

Example:

```html
<placeholder id="VRAC-profile"/>
```

+ **uid**: [UID](#uid). Generally it's defined by user and with prefix `#VRAC`.
+ **widgetRef**: [UID](#uid). A reference to the widget this element belongs to.
+ **selector**: String. The selector used to select this element in its parent widget. For now it's the same as `uid`.


### Event

An DOM Event of a certain [Element](#element) or `document`.

```javascript
{
  type: "event",
  uid: "AA9DH50KX81UES21",
  elementRef: "P4P8TIOTU9LGDSBF",
  eventType: "click",
}
```

+ **uid**: [UID](#uid).
+ **elementRef**: [UID](#uid). A reference to the element this event is emitted from.
+ **eventType**: String. The name of this event. Generally it should be equal to standard [Event.type](https://developer.mozilla.org/en-US/docs/Web/API/event.type).

### RAttribute

An attribute of a certain [Element](#element) or `document`. It can only be used as output port.

```javascript
{
  type: "rAttribute",
  uid: "O6ZWLUYPPXN042SK",
  elementRef: "P4P8TIOTU9LGDSBF",
  name: "value",
}
```

+ **uid**: [UID](#uid).
+ **elementRef**: [UID](#uid). A reference to the element this attribute belongs to.
+ **name**: String. The name of this attribute. See [Attribute Syntax](#attribute-syntax).

### WAttribute

An attribute of a certain [Element](#element) or `document`. It can only be used as an input port.

```javascript
{
  type: "wAttribute",
  uid: "O6ZWLUYPPXN042SK",
  elementRef: "P4P8TIOTU9LGDSBF",
  signalRef: "WZQ9KTF6KP9X64CW",
  name: "value",
}
```

+ **uid**: [UID](#uid).
+ **elementRef**: [UID](#uid). A reference to the element this attribute belongs to.
+ **signalRef**: [UID](#uid). A reference to the singal which updates this attribute when changed. For "read-only" attributes, leave this as `null`.
+ **name**: String. The name of this attribute. See [Attribute Syntax](#attribute-syntax).

#### Attribute Syntax 

There are 3 kinds of attribute names:

1. One of standard [HTML attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes).
e.g. `value`, `name`, etc. Under the hood, we use jQuery's `prop()` to read/write these attributes, so boolean attributes like `checked` work as expected.
2. `field:#{fieldName}`. They represent low-level fields of the DOM elements. For example, `field:innerHTML` represents [Element.innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element.innerHTML).
3. `class:#{className}`. They are boolean attributes to toggle classes. For example, if you set `class:checked` as `true`, the corresponding element will get `checked` class, without affect the other classes it has. 

### DataSource

A mutable data source. It holds its current value and pop a new value when a mutator comes.

```javascript
{
  type: "dataSource",
  uid: "VU977EDJ16NIWAI8",
  initialValue: [],
  mutatorRefs: ["2MXHYT6EOTBVF9A0", "3SGVS18V6MR0AUJ1"]
}
```

+ **uid**: [UID](#uid).
+ **initialValue**: Any. The initial value of this data source.
+ **mutatorRefs**: The references to the streams of mutators. A mutator is just a function that receives the current value of this data source and return a new value. Naturally a data source may have many different types of mutators, such as appending, removing, inserting and so on. That's why this field is an array of references.

### Constant

A constant.

```javascript
{
  type: "constant",
  uid: "HMZ3G30E5CNQ7D2N",
  valueType: "String",
  value: "post"
}
```

+ **uid**: [UID](#uid).
+ **valueType**: String. The type of this constant. 
+ **value**: The value of this constant.

### App

A rendered web app.

```javascript
{
  files: [
    { path: "index.html", content: "<html>\n<body>\n..." },
    { path: "main.js", content: "$(document).ready(function(){\n..." },
    { path: "main.css", content: ".twd-amount {\n..." }
  ]
}
```

+ **files**: A bunch of files that make up this web app.

# Predefine

Please check following files:

* [Action](https://github.com/raincole/VisualReactiveAPI/blob/master/renderer/predefines/actions.json)

# Webview Context

Just run [jquery.min.js](webview/lib/jquery.min.js) and [Webview.js](webview/target/Webview.js) in Webview context after loading user-defined widget.

## Function

`var Webview = VRAC.Webview`

### Webview.startSelecting()

To start selecting element in the Webview. The [UserElement](#userelement) under the cursor would be highlighten.

### Webview.stopSelecting()

To stop [startSelecting()](#startSelecting). **Note**: If you have selected an element, calling this doesn't clear the selection mask UI.

### Webview.clearSelection()

To clear the selection mask.

### Webview.getCurrentElementDetail()

Get the details of the innermost [UserElement](#userelement) under the cursor.

**return value**: 

```javascript
{
  uid: "#VRAC-TWD-field",
  isPlaceholder: false,
  events: ['click', 'change', ...],
  attributes: ['value', 'class', 'name', ...],
}
```

+ **uid**: The UID of current [UserElement](#userelement).
+ **isPlaceholder**: Boolean. Is this element a [Placholder](#placeholder).
+ **events**: The events that current element can emit. See also [Event](#event).
+ **attributes**: The attributes that current element has. See also [Attribute](#attribute).

## Data Structure

### UserElement

```javascript
{
  uid: "#VRAC-TWD-field",
  clientRect: {
    left: 10,
    top: 20,
    right: 15,
    bottom: 30,
    width: 5,
    height: 10,
  },
}
```
