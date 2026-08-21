/**
 * Events that Chrome treats as scroll-blocking by default when registered
 * with no explicit `passive` option. Zrender (the renderer ECharts uses)
 * attaches all four during `echarts.init` without an options object, which
 * triggers the "Added non-passive event listener to a scroll-blocking
 * 'mousewheel' event" violation in DevTools on every chart mount.
 */
const SCROLL_BLOCKING_EVENTS: ReadonlySet<string> = new Set([
  'wheel',
  'mousewheel',
  'touchstart',
  'touchmove',
]);

/**
 * Briefly shadows `addEventListener` on a single element so any registration
 * for a scroll-blocking pointer event is forced to `{ passive: true }`.
 * Returns a function that removes the shadow and restores the prototype
 * method.
 *
 * Why this exists: ECharts/zrender attaches wheel and touch listeners
 * inside `echarts.init` without a `passive` flag. We never register the
 * `DataZoomInsideComponent`, so ECharts never calls `preventDefault` on
 * those events — marking them passive is purely a hint to Chrome that the
 * listener won't block scrolling, silencing the DevTools warning and
 * letting the compositor keep scroll responsive on touch devices.
 *
 * Scope notes:
 * - The override is an own-property on the element, so it does not affect
 *   any other DOM node or the global prototype.
 * - It is removed immediately after `echarts.init` returns — subsequent
 *   `container.addEventListener` calls (e.g. by us or other consumers) go
 *   straight to the prototype method again.
 * - `removeEventListener` matches on (type, listener, capture). Capture is
 *   `false` in both the add and remove call paths zrender uses, so
 *   listeners still detach cleanly on `chart.dispose()`.
 */
export function patchPassivePointerListeners(element: HTMLElement): () => void {
  const proto = HTMLElement.prototype.addEventListener;

  function patched(
    this: HTMLElement,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (SCROLL_BLOCKING_EVENTS.has(type)) {
      const normalized: AddEventListenerOptions =
        typeof options === 'object' && options !== null
          ? { ...options, passive: true }
          : { capture: Boolean(options), passive: true };
      proto.call(this, type, listener, normalized);
      return;
    }
    proto.call(this, type, listener, options);
  }

  Object.defineProperty(element, 'addEventListener', {
    configurable: true,
    writable: true,
    value: patched,
  });

  return () => {
    Reflect.deleteProperty(element, 'addEventListener');
  };
}
