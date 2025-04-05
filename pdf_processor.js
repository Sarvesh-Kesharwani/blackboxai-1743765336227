// PDF manipulation using PDF-lib
async function modifyResumeWithJD(pdfBytes, jobDescription) {
  try {
    // Dynamically import PDF-lib
    const { PDFDocument, rgb } = await import('https://unpkg.com/pdf-lib/dist/pdf-lib.min.js');
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    
    // Embed invisible text
    firstPage.drawText(jobDescription, {
      x: 0,
      y: 0,
      size: 1,
      color: rgb(1, 1, 1), // White color (invisible on white background)
      opacity: 0, // Fully transparent
    });

    // Save modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
  } catch (error) {
    console.error('PDF modification error:', error);
    throw error;
  }
}

// Expose to background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'modify_resume') {
    modifyResumeWithJD(request.pdfBytes, request.jobDescription)
      .then(modifiedBytes => sendResponse({ success: true, pdfBytes: modifiedBytes }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});