declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "@excalidraw/excalidraw/index.css" {
  const content: any;
  export default content;
}
