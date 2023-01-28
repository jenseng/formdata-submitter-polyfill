export type SubmitButton =
  | (HTMLInputElement & { type: "submit" | "image" })
  | (HTMLButtonElement & { type: "submit" });
export function isSubmitButton(
  formControl: unknown
): formControl is SubmitButton {
  return (
    (formControl instanceof HTMLInputElement &&
      (formControl.type === "submit" || formControl.type === "image")) ||
    (formControl instanceof HTMLButtonElement && formControl.type === "submit")
  );
}

const SELECTED_COORDINATE = Symbol();
type ImageButton = HTMLInputElement & {
  type: "image";
  [SELECTED_COORDINATE]: { x: number; y: number };
};
function isImageButton(formControl: unknown): formControl is ImageButton {
  return (
    formControl instanceof HTMLInputElement && formControl.type === "image"
  );
}

// Track each Image Button's most recently selected coordinate, in case we pass it as a FormData submitter
// https://html.spec.whatwg.org/multipage/input.html#image-button-state-(type=image):input-activation-behavior
function trackImageButtonActivation() {
  // last node during bubbling, so we're as close to activation as possible
  window.addEventListener("click", (e) => {
    if (isImageButton(e.target)) {
      e.target[SELECTED_COORDINATE] = {
        x: e.offsetX,
        y: e.offsetY,
      };
    }
  });
}

export function addTemporarySubmitterFieldsInTreeOrder(
  form: HTMLFormElement,
  submitter: SubmitButton
) {
  let tempFieldContainer = document.createElement("span");
  submitter.insertAdjacentElement("afterend", tempFieldContainer);

  let isExternalSubmitter = !form.contains(submitter); // i.e. associated to the form but not a descendant
  function addSubmitterTempField(name: string, value: string | number) {
    let field = document.createElement("input");
    field.type = "hidden";
    field.name = name;
    field.value = String(value);
    if (isExternalSubmitter) field.setAttribute("form", form.id);
    tempFieldContainer.insertAdjacentElement("beforeend", field);
  }

  const submitterEntries = getEntriesForSubmitter(submitter);
  for (let [name, value] of submitterEntries) {
    addSubmitterTempField(name, value);
  }

  submitter.insertAdjacentElement("afterend", tempFieldContainer);
  return tempFieldContainer;
}

export function getEntriesForSubmitter(
  submitter: SubmitButton
): [string, string][] {
  if (isImageButton(submitter)) {
    const coordinate = submitter[SELECTED_COORDINATE] ?? { x: 0, y: 0 };
    let prefix = submitter.name ? `${submitter.name}.` : "";
    return [
      [`${prefix}x`, String(coordinate.x)],
      [`${prefix}y`, String(coordinate.y)],
    ];
  } else if (submitter.name) {
    return [[submitter.name, submitter.value]];
  }
  return [];
}

export function validateFormDataConstructorParameters(
  form: HTMLFormElement,
  submitter: unknown
): asserts submitter is SubmitButton {
  if (!(form instanceof HTMLFormElement)) {
    throw new TypeError(
      "Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'"
    );
  }
  if (!isSubmitButton(submitter)) {
    throw new TypeError(
      "Failed to construct 'FormData': The specified element is not a submit button."
    );
  }
  if (submitter.form !== form) {
    throw new DOMException(
      "Failed to construct 'FormData': The specified element is not owned by this form element",
      "NotFoundError"
    );
  }
}

export function polyfillFormDataIfNecessary(NewFormData: typeof FormData) {
  if (typeof document === "undefined") return; // not in a browser, so 🤷‍♂️
  if (window.FormData.length >= 2) return; // maybe already polyfilled? 🤞
  try {
    // otherwise we have to do this silliness, since native functions don't expose an arity 🙃
    new window.FormData(
      document.createElement("form"),
      document.createElement("button")
    );
  } catch (e) {
    if (e instanceof DOMException) return; // yey it's supported, our work is done here 🚀
    throw e; // something else happened 🤔
  }

  // it didn't validate the invalid submitter, so let's do this 🥳
  window.FormData = NewFormData;
  trackImageButtonActivation();
}
