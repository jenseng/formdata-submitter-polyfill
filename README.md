# FormData submitter polyfill

Support the `submitter` parameter to the [FormData constructor](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) in older browsers.

## Usage

```bash
npm install --save formdata-submitter-polyfill
```

Then import it early in your client entrypoint .js file, e.g.

```javascript
import "formdata-submitter-polyfill";
```

Now you can reliably create `FormData` objects populated from both a form and a `submitter`, e.g.

```javascript
var myform = document.createElement("form");
myform.innerHTML =
  "<input name=foo value=Foo><button name=go value=GO>go!</button><input type=image><input name=bar value=BAR>";
new FormData(myform, myform.querySelector("button"));
// ▸ FormData(3) { foo → "Foo", go → "GO", bar → "BAR" }
new FormData(myform, myform.querySelector("input[type=image]"));
// ▸ FormData(4) { foo → "Foo", x → "0", y → "0", bar → "BAR" }
```

These `FormData` entries are equivalent to the form data set constructed by native form submissions.

### TypeScript

The polyfill doesn't provide any _global_ `FormData` typings, as variable declarations cannot be changed (i.e. TypeScript's `lib/lib.dom.d.ts` defines the `FormData` constructor with a single parameter). Until TypeScript's built-in types are updated to support this new feature, you'll either want to use `window.FormData` (correctly typed by this polyfill) or add a `// @ts-expect-error` comment.

### Lightweight mode

By default, the polyfill fully supports the [form entry list construction algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), i.e. ensuring that image button and named button submitters are encoded in tree order. It accomplishes this by temporarily tweaking the form during submission to get the right entries.

While this performs well, you can get faster (but less compliant) behavior by doing:

```javascript
import "formdata-submitter-polyfill/lightweight";
```

This will instead create a `submitter`-less `FormData` object and then append `submitter` entries (as appropriate) to the end of the list, e.g.

```javascript
var myform = document.createElement("form");
myform.innerHTML =
  "<input name=foo value=Foo><button name=go value=GO>go!</button><input type=image><input name=bar value=BAR>";
new FormData(myform, myform.querySelector("button"));
// ▸ FormData(3) { foo → "Foo", bar → "BAR", go → "GO" }
new FormData(myform, myform.querySelector("input[type=image]"));
// ▸ FormData(4) { foo → "Foo", bar → "BAR", x → "0", y → "0" }
```

#### Gotchas

1. If the entry order matters for consumers, this may lead to bugs (i.e. the order will differ from one created from a vanilla form submission).

2. Older versions of Safari will include `submitter` entries twice, due to [this bug](https://bugs.webkit.org/show_bug.cgi?id=239070).

The default polyfill mode does not have these issues.
