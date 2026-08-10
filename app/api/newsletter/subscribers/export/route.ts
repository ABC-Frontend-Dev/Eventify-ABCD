import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const format = request.nextUrl.searchParams.get("format") ?? "csv";
        const showAll = request.nextUrl.searchParams.get("all") === "true";

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: showAll ? undefined : { isActive: true },
            orderBy: { subscribedAt: "desc" },
        });

        if (format === "csv") {
            const rows = [
                // Header row
                ["ID", "Email", "Status", "Subscribed At", "Unsubscribed At"].join(","),
                // Data rows
                ...subscribers.map((s) =>
                    [
                        s.id,
                        `"${s.email}"`,
                        s.isActive ? "Active" : "Unsubscribed",
                        `"${new Date(s.subscribedAt).toLocaleString("en-US")}"`,
                        s.unsubscribedAt ? `"${new Date(s.unsubscribedAt).toLocaleString("en-US")}"` : "",
                    ].join(","),
                ),
            ].join("\n");

            return new NextResponse(rows, {
                status: 200,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="newsletter-subscribers-${Date.now()}.csv"`,
                },
            });
        }

        if (format === "xlsx") {
            // Build a minimal xlsx file manually (no external dependency needed)
            // Using XML-based SpreadsheetML format which Excel/Sheets reads natively
            const escapeXml = (val: string) => val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

            const headers = ["ID", "Email", "Status", "Subscribed At", "Unsubscribed At"];

            const dataRows = subscribers.map((s) => [
                String(s.id),
                s.email,
                s.isActive ? "Active" : "Unsubscribed",
                new Date(s.subscribedAt).toLocaleString("en-US"),
                s.unsubscribedAt ? new Date(s.unsubscribedAt).toLocaleString("en-US") : "",
            ]);

            const toRow = (cells: string[], isHeader = false) => {
                const cellsXml = cells.map((c) => `<Cell${isHeader ? ' ss:StyleID="header"' : ""}><Data ss:Type="String">${escapeXml(c)}</Data></Cell>`).join("");
                return `<Row>${cellsXml}</Row>`;
            };

            const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#57068C" ss:Pattern="Solid"/>
      <Font ss:Color="#FFFFFF" ss:Bold="1"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Subscribers">
    <Table>
      ${toRow(headers, true)}
      ${dataRows.map((r) => toRow(r)).join("\n      ")}
    </Table>
  </Worksheet>
</Workbook>`;

            return new NextResponse(xml, {
                status: 200,
                headers: {
                    "Content-Type": "application/vnd.ms-excel",
                    "Content-Disposition": `attachment; filename="newsletter-subscribers-${Date.now()}.xls"`,
                },
            });
        }

        return NextResponse.json({ success: false, error: "Invalid format. Use csv or xlsx." }, { status: 400 });
    } catch (error) {
        console.error("GET /api/newsletter/subscribers/export error:", error);
        return NextResponse.json({ success: false, error: "Failed to export subscribers." }, { status: 500 });
    }
}
