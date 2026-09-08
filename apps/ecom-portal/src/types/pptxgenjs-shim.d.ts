// Created by Sekar Nagarajan (2026-09-08 16:05)
/**
 * Ambient shim for pptxgenjs when the package is declared but not yet
 * installed (offline registry). Runtime falls back to the fflate OOXML builder.
 */
declare module "pptxgenjs" {
  interface PptxGenJsSlide {
    addText: (text: string, options?: Record<string, unknown>) => void;
    addImage: (options: Record<string, unknown>) => void;
  }

  interface PptxGenJsInstance {
    defineLayout: (layout: Record<string, unknown>) => void;
    layout: string;
    author: string;
    title: string;
    subject: string;
    company: string;
    addSlide: () => PptxGenJsSlide;
    writeFile: (options: { fileName: string }) => Promise<void>;
  }

  interface PptxGenJsConstructor {
    new (): PptxGenJsInstance;
  }

  const PptxGenJS: PptxGenJsConstructor;
  export default PptxGenJS;
}
