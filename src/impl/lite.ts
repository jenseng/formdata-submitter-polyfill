import {
  getEntriesForSubmitter,
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

    // Populate the dataset
    super(form);

    // Add the submitter entry(s) at the end
    const submitterEntries = getEntriesForSubmitter(submitter);
    for (let [name, value] of submitterEntries) {
      this.append(name, value);
    }
  }
}
