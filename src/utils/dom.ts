import closestx from 'closest';

export function removeNode(el: Node): void {
  const parent = el.parentNode;

  if (parent) {
    parent.removeChild(el);
  }
}

export function isHidden(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  const hidden = style.display === 'none';

  // offsetParent returns null in the following situations:
  // 1. The element or its parent element has the display property set to none.
  // 2. The element has the position property set to fixed
  const parentHidden = el.offsetParent === null && style.position !== 'fixed';

  return hidden || parentHidden;
}

export function closest(element: Element | EventTarget, selector: string, checkYoSelf?: boolean): Element | null {
  return closestx(element, selector, checkYoSelf);
}

export function hasClass(el: Element, className: string): boolean {
  return el.className.split(/\s+/).some((c) => c === className);
}

export function addClass(el: Element, className: string): void {
  if (hasClass(el, className)) {
    return;
  }
  const oldClassName = el.className;
  el.className = oldClassName ? oldClassName + ' ' + className : className;
}

export function removeClass(el: Element, className: string): void {
  let has = false;
  const cs = el.className.split(/\s+/).filter((c) => {
    if (c === className) {
      has = true;
      return false;
    }
    return true;
  });
  if (has) {
    el.className = cs.join(' ');
  }
}
