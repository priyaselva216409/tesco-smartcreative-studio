import puppeteer from "puppeteer";

export const exportDesign = async (req, res) => {
  try {
    const { canvasJSON, format } = req.body;

    if (!canvasJSON || typeof canvasJSON !== "object") {
      return res.status(400).json({ message: "Canvas JSON data is required" });
    }
    const imageFormat = (typeof format === "string" && format.toLowerCase() === "jpeg") ? "jpeg" : "png";

    // Serialize canvasJSON to string and encode for embedding
    const canvasDataString = JSON.stringify(canvasJSON);

    // Launch puppeteer to render canvas JSON to image
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set viewport large enough for designs, can be adjusted or passed dynamically
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

    // HTML content to render canvas
    // We will embed the canvas JSON and use Fabric.js to render it
    // Use CDN for Fabric.js
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Canvas Export</title>
        <script src="https://cdn.jsdelivr.net/npm/fabric@5.2.4/dist/fabric.min.js"></script>
        <style>
          body, html {
            margin: 0; padding: 0; overflow: hidden;
            background: transparent;
          }
          canvas {
            background: white;
          }
        </style>
      </head>
      <body>
        <canvas id="c" width="1200" height="800"></canvas>
        <script>
          (function() {
            const canvas = new fabric.Canvas('c', {backgroundColor: 'white'});
            const canvasJSON = ${canvasDataString};
            canvas.loadFromJSON(canvasJSON, () => {
              // Need to wait for images to load too
              canvas.renderAll();
              window.status = 'ready';
            }, function(o, object) {
              // object loaded callback
            });
          })();
        </script>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Wait until canvas is ready (window.status === 'ready')
    await page.waitForFunction('window.status === "ready"', { timeout: 10000 });

    // Screenshot canvas element
    const canvasElement = await page.$("#c");
    if (!canvasElement) {
      await browser.close();
      return res.status(500).json({ message: "Canvas element not found" });
    }

    const buffer = await canvasElement.screenshot({ type: imageFormat, omitBackground: false });

    await browser.close();

    res.set("Content-Type", imageFormat === "jpeg" ? "image/jpeg" : "image/png");
    res.set("Content-Disposition", `attachment; filename="design.${imageFormat}"`);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Export design error:", error);
    return res.status(500).json({ message: "Server error exporting design" });
  }
};
