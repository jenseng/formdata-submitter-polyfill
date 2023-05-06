import {
  addTemporarySubmitterFieldsInTreeOrder,
  validateFormDataConstructorParameters,
} from "./utils.js";

export class FormData extends window["FormData"] {
  constructor(
    ...args: [HTMLFormElement | undefined, HTMLElement | null | undefined]
  ) {
    validateFormDataConstructorParameters(args);
    const [form, submitter] = args;

    if (!form || submitter == null) {
      super(form);
      return;
    }

    // Explicitly disable the submitter; some browsers (old Safari) unilaterally include it if it was activated,
    // and we don't want it in the FormData entry list twice 🙃
    let submitterDisabled = submitter.disabled;
    submitter.disabled = true;

    try {
      // Add temporary hidden field(s) with the appropriate value(s) next to the submitter; they need to be adjacent
      // so that the entries appear in tree-order 💪
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-the-form-data-set
      let tempFieldContainer = addTemporarySubmitterFieldsInTreeOrder(
        form,
        submitter
      );

      // Populate the dataset from our monkeyed form 🐒
      super(form);

      // Pretend none of this ever happened 🙈
      tempFieldContainer.remove();
    } finally {
      submitter.disabled = submitterDisabled;
    }
  }
}
