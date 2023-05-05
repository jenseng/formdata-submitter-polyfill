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

Now you can reliably create `FormData` objects populated from both a form and a `submitter`. A common scenario for this is in form submission handlers, e.g.

```javascript
var myform = document.createElement("form");
myform.innerHTML = `
  <input name=foo value=FOO>
  <button name=go value=GO>go!</button>
  <input type=image>
  <input name=bar value=BAR>
`;
myform.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target, event.submitter);
  // If the button is the submitter:
  // ▸ FormData(3) { foo → "FOO", go → "GO", bar → "BAR" }
  // If the image button is the submitter:
  // ▸ FormData(4) { foo → "FOO", x → "0", y → "0", bar → "BAR" }

  // ... do something with formData ...
});
```

These `FormData` objects are equivalent to the form data sets constructed by equivalent native form submissions.

If you also need to polyfill the `submitter` property of the `SubmitEvent`, consider using the [`event-submitter-polyfill`](https://www.npmjs.com/package/event-submitter-polyfill) package alongside this one.

### TypeScript

The latest [TypeScript DOM types](https://www.npmjs.com/package/@types/web) support the `submitter` parameter. If you are using older DOM types (e.g. the ones that shipped with your version of TypeScript), you can get the latest by running:

```bash
npm install @typescript/lib-dom@npm:@types/web --save-dev
```

If for some reason you can't upgrade yet, in the meantime you can add a `// @ts-expect-error` comment to make TypeScript happy 🙈.

### Additional Exports

If you want more control over how/when the polyfill is activated, you can use the exports provided by `formdata-submitter-polyfill/impl`. For example:

```typescript
import {
  FormData,
  polyfillFormDataIfNecessary,
} from "formdata-submitter-polyfill/impl";

// this will replace window.FormData with the polyfill if necessary
polyfillFormDataIfNecessary(FormData);
```

### Lightweight mode

By default, the polyfill fully supports the [form entry list construction algorithm](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set), i.e. ensuring that image button and named button submitters are encoded in tree order. It accomplishes this by temporarily tweaking the form during submission to get the right entries.

While this performs well, you can get faster (but less compliant) behavior by doing:

```javascript
import "formdata-submitter-polyfill/lite";
```

This will instead create a `submitter`-less `FormData` object and then append `submitter` entries (as appropriate) to the end of the list, e.g.

```javascript
const formData = new FormData(event.target, event.submitter);
// If the button is the submitter:
// ▸ FormData(3) { foo → "FOO", bar → "BAR", go → "GO" }
// If the image button is the submitter:
// ▸ FormData(4) { foo → "FOO", bar → "BAR", x → "0", y → "0" }
```

#### Gotchas

1. If the entry order matters for consumers, this may lead to bugs (i.e. the order will differ from one created from a vanilla form submission).

2. Older versions of Safari will include `submitter` entries twice, due to [this bug](https://bugs.webkit.org/show_bug.cgi?id=239070).

The default polyfill mode does not have these issues.
