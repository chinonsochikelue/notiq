import { describe, it, expect, vi } from "vitest";
import { BlocksKit, SlashMenu, BlockHandle } from "../extensions/blocks-kit";

describe("BlocksKit headless & custom renderer support", () => {
  it("includes SlashMenu and BlockHandle plugins by default", () => {
    const context = { editor: {} as never, options: BlocksKit.options };
    const plugins = BlocksKit.getPlugins(context);
    const names = plugins.map((p) => (p as { displayName?: string }).displayName);

    expect(names).toContain("NotiqSlashMenu");
    expect(names).toContain("NotiqBlockHandle");
  });

  it("allows disabling SlashMenu and BlockHandle via BlocksKit.configure", () => {
    const configured = BlocksKit.configure({
      slashMenu: false,
      handles: false,
    });
    const context = { editor: {} as never, options: configured.options };
    const plugins = configured.getPlugins(context);
    const names = plugins.map((p) => (p as { displayName?: string }).displayName);

    expect(names).not.toContain("NotiqSlashMenu");
    expect(names).not.toContain("NotiqBlockHandle");
  });

  it("forwards headless: true from BlocksKit.configure to SlashMenu and BlockHandle", () => {
    const configured = BlocksKit.configure({ headless: true });
    const subExtensions = configured.config.addExtensions?.({
      options: configured.options,
    }) ?? [];

    const slashExt = subExtensions.find((ext) => ext.name === "slashMenu");
    const handleExt = subExtensions.find((ext) => ext.name === "blockHandle");

    expect(slashExt?.options.headless).toBe(true);
    expect(handleExt?.options.headless).toBe(true);
  });

  it("supports custom render and onStateChange options on SlashMenu and BlockHandle", () => {
    const slashRender = vi.fn(() => null);
    const slashOnStateChange = vi.fn();
    const handleRender = vi.fn(() => null);
    const handleRenderTargetLine = vi.fn(() => null);
    const handleOnStateChange = vi.fn();

    const configured = BlocksKit.configure({
      headless: true,
      slashMenu: {
        render: slashRender,
        onStateChange: slashOnStateChange,
      },
      handles: {
        render: handleRender,
        renderTargetLine: handleRenderTargetLine,
        onStateChange: handleOnStateChange,
      },
    });

    const subExtensions = configured.config.addExtensions?.({
      options: configured.options,
    }) ?? [];

    const slashExt = subExtensions.find((ext) => ext.name === "slashMenu");
    const handleExt = subExtensions.find((ext) => ext.name === "blockHandle");

    expect(slashExt?.options.headless).toBe(true);
    expect(slashExt?.options.render).toBe(slashRender);
    expect(slashExt?.options.onStateChange).toBe(slashOnStateChange);

    expect(handleExt?.options.headless).toBe(true);
    expect(handleExt?.options.render).toBe(handleRender);
    expect(handleExt?.options.renderTargetLine).toBe(handleRenderTargetLine);
    expect(handleExt?.options.onStateChange).toBe(handleOnStateChange);

    expect(SlashMenu.configure({ headless: true }).options.headless).toBe(true);
    expect(BlockHandle.configure({ headless: true }).options.headless).toBe(true);
  });
});
