import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicantId = parseInt(id, 10);
    
    if (isNaN(applicantId)) {
      console.error(`Invalid applicant ID: ${id}`);
      return new Response(
        JSON.stringify({ error: "Invalid applicant ID" }),
        { status: 400 }
      );
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    });

    if (!applicant) {
      return new Response(
        JSON.stringify({ error: "Applicant not found" }),
        { status: 404 }
      );
    }

    // Check if fileData exists and is not empty
    const fileBuffer = applicant.fileData as Buffer | null;
    if (!fileBuffer || fileBuffer.length === 0) {
      console.error(`File not found for applicant ${applicantId}. FileData empty or null.`);
      // If there's a legacy fileUrl, try to redirect to it
      if (applicant.fileUrl) {
        console.log(`Redirecting to legacy fileUrl: ${applicant.fileUrl}`);
        return new Response(null, {
          status: 302,
          headers: { "Location": applicant.fileUrl }
        });
      }
      return new Response(
        `<html><body><h1>File Not Found</h1><p>The PDF file for applicant ${applicantId} has not been uploaded yet.</p><p>Please ask the applicant to re-upload their file.</p></body></html>`,
        { 
          status: 404,
          headers: { "Content-Type": "text/html" }
        }
      );
    }

    return new Response(applicant.fileData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${applicant.fileName || 'document.pdf'}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving PDF:", error);
    return new Response(
      `<html><body><h1>Error</h1><p>${error instanceof Error ? error.message : "Failed to serve file"}</p></body></html>`,
      { 
        status: 500,
        headers: { "Content-Type": "text/html" }
      }
    );
  }
}
