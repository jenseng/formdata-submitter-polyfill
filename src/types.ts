// we can't redeclare the global FormData var, but we can explicitly
// define a FormData property on window
declare global {
  interface Window {
    FormData: {
      prototype: FormData;
      new (form?: HTMLFormElement, submitter?: HTMLElement): FormData;
    };
  }
}
