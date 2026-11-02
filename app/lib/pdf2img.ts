
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

// Load PDF.js
async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;

    if (loadPromise) return loadPromise;

    loadPromise = import("pdfjs-dist/build/pdf.mjs")
        .then((lib) => {
            // Configure worker using Vite URL import
            lib.GlobalWorkerOptions.workerSrc = pdfWorker;

            pdfjsLib = lib;
            return lib;
        })
        .catch((error) => {
            loadPromise = null;
            throw error;
        });

    return loadPromise;
}

// Convert PDF first page into PNG
export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();

        const pdf = await lib.getDocument({
            data: new Uint8Array(arrayBuffer),
        }).promise;

        const page = await pdf.getPage(1);

        // Scale 2 is faster than scale 4
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Could not create canvas context");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({
            canvasContext: context,
            viewport,
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) {
            throw new Error("Failed to create image blob");
        }

        const originalName = file.name.replace(/\.pdf$/i, "");

        const imageFile = new File(
            [blob],
            `${originalName}.png`,
            { type: "image/png" }
        );

        const imageUrl = URL.createObjectURL(blob);

        canvas.width = 0;
        canvas.height = 0;

        return {
            imageUrl,
            file: imageFile,
        };

    } catch (err) {
        console.error("PDF conversion error:", err);

        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${
                err instanceof Error ? err.message : String(err)
            }`,
        };
    }
}
