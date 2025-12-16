export function createOption(control, value, innerText) {
  const opt = document.createElement("option");
  opt.value = value;
  opt.innerText = innerText;
  control.appendChild(opt);
}