export function createOption(control: HTMLSelectElement, value: string, innerText: string): void {
  const opt = document.createElement("option");
  opt.value = value;
  opt.innerText = innerText;
  control.appendChild(opt);
}