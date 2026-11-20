import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageLightbox from "../../ui/image/image-lightbox";
import { ACCEPTABLE_IMAGE_TYPES } from "../plugins/DragDropPastePlugin";

describe("ImageLightbox", () => {
  it("does not render when closed", () => {
    render(
      <ImageLightbox
        src="https://example.com/photo.png"
        altText="Sample"
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders image preview and supports zoom in, zoom out, reset, and close", () => {
    const onClose = vi.fn();
    render(
      <ImageLightbox
        src="https://example.com/photo.png"
        altText="Architecture diagram"
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByAltText("Architecture diagram")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(screen.getByText("100%")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(screen.getByText("75%")).toBeTruthy();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Close lightbox" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("DragDropPastePlugin configuration", () => {
  it("supports standard and SVG vector image MIME types", () => {
    expect(ACCEPTABLE_IMAGE_TYPES).toContain("image/");
    expect(ACCEPTABLE_IMAGE_TYPES).toContain("image/webp");
    expect(ACCEPTABLE_IMAGE_TYPES).toContain("image/svg+xml");
  });
});
