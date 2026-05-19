export const RenderSlice = Object.freeze({
  themeAppearance: "themeAppearance",
  settingsControls: "settingsControls",
  settingsState: "settingsState",
  sidebar: "sidebar",
  editorLines: "editorLines",
  editorLayout: "editorLayout",
  editorBlocks: "editorBlocks",
  editorCaret: "editorCaret",
  statusbar: "statusbar",
  saveUi: "saveUi",
});

function appendSlice(queue, slice) {
  if (!slice) {
    return;
  }

  if (Array.isArray(slice) || slice instanceof Set) {
    slice.forEach((entry) => appendSlice(queue, entry));
    return;
  }

  queue.add(slice);
}

export function createRenderPipeline({ flush }) {
  let pendingFrame = 0;
  const pendingSlices = new Set();

  function drainPendingSlices() {
    if (!pendingSlices.size) {
      return new Set();
    }

    const slices = new Set(pendingSlices);
    pendingSlices.clear();
    return slices;
  }

  function flushNow(...slices) {
    slices.forEach((slice) => appendSlice(pendingSlices, slice));
    if (pendingFrame) {
      window.cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
    }

    const nextSlices = drainPendingSlices();
    if (!nextSlices.size) {
      return;
    }

    flush(nextSlices);
  }

  function request(...slices) {
    slices.forEach((slice) => appendSlice(pendingSlices, slice));
    if (pendingFrame) {
      return;
    }

    pendingFrame = window.requestAnimationFrame(() => {
      pendingFrame = 0;
      const nextSlices = drainPendingSlices();
      if (!nextSlices.size) {
        return;
      }
      flush(nextSlices);
    });
  }

  function cancel() {
    if (pendingFrame) {
      window.cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
    }
    pendingSlices.clear();
  }

  return {
    request,
    flushNow,
    cancel,
  };
}
