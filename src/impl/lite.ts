import {
  getEntriesForSubmitter,
  validateFormDataConstructorParameters,
} from "./utils.js";

export class FormData extends window["FormData"] {
  constructor(form?: HTMLFormElement, submitter: HTMLElement | null = null) {
    if (!form || !submitter) {
      super(form);
      return;
    }

    validateFormDataConstructorParameters(form, submitter);

    // Populate the dataset
    super(form);

    // Add the submitter entry(s) at the end
    const submitterEntries = getEntriesForSubmitter(submitter);
    for (let [name, value] of submitterEntries) {
      this.append(name, value);
    }
  }
}
