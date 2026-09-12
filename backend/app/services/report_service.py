import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.core.config import settings

class ReportService:
    def generate_pdf_report(self, analysis, output_pdf_path: str) -> str:
        """
        Generates a publication-grade scientific/clinical PDF report for an analysis record.
        """
        os.makedirs(os.path.dirname(output_pdf_path), exist_ok=True)
        doc = SimpleDocTemplate(output_pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        
        styles = getSampleStyleSheet()
        
        # Custom Paragraph Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0A1128')
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#475569')
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#0F172A'),
            spaceBefore=12,
            spaceAfter=6
        )

        normal_body = ParagraphStyle(
            'NormalBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#1E293B')
        )

        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748B')
        )

        elements = []

        # Header Block
        header_table_data = [
            [
                Paragraph("<b>NEUROSCAN AI</b><br/><font size=8 color='#2563EB'>RESEARCH • ANALYZE • DISCOVER</font>", title_style),
                Paragraph(f"<b>Report Date:</b> {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}<br/><b>Analysis ID:</b> {analysis.id[:8]}...", subtitle_style)
            ]
        ]
        header_table = Table(header_table_data, colWidths=[300, 240])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ]))
        elements.append(header_table)
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=15))

        # Classification Summary
        elements.append(Paragraph("1. Classification Results", section_heading))
        
        probs_dict = {}
        try:
            probs_dict = json.loads(analysis.class_probabilities)
        except Exception:
            pass

        probs_formatted = ", ".join([f"{k}: {v*100:.1f}%" for k, v in probs_dict.items()])

        class_table_data = [
            [Paragraph("<b>Predicted Tumor Category:</b>", normal_body), Paragraph(f"<b><font color='#2563EB'>{analysis.classification}</font></b>", normal_body)],
            [Paragraph("<b>Model Confidence:</b>", normal_body), Paragraph(f"{analysis.classification_confidence * 100:.1f}%", normal_body)],
            [Paragraph("<b>Class Probabilities:</b>", normal_body), Paragraph(probs_formatted, normal_body)],
            [Paragraph("<b>Classification Model:</b>", normal_body), Paragraph(analysis.classification_model_version, normal_body)]
        ]
        class_table = Table(class_table_data, colWidths=[160, 380])
        class_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(class_table)
        elements.append(Spacer(1, 15))

        # Segmentation Summary
        elements.append(Paragraph("2. Segmentation & Metrics", section_heading))
        tumor_status = "Detected" if analysis.tumor_detected else "No significant region detected"
        seg_table_data = [
            [Paragraph("<b>Tumor Region Status:</b>", normal_body), Paragraph(f"<b>{tumor_status}</b>", normal_body)],
            [Paragraph("<b>Tumor Area (Pixels):</b>", normal_body), Paragraph(f"{analysis.tumor_pixels:,} px", normal_body)],
            [Paragraph("<b>Area Percentage:</b>", normal_body), Paragraph(f"{analysis.tumor_area_percentage:.2f}% of brain slice", normal_body)],
            [Paragraph("<b>Segmentation Model:</b>", normal_body), Paragraph(analysis.segmentation_model_version, normal_body)],
            [Paragraph("<b>Inference Latency:</b>", normal_body), Paragraph(f"{analysis.inference_time_ms} ms", normal_body)],
        ]
        seg_table = Table(seg_table_data, colWidths=[160, 380])
        seg_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(seg_table)
        elements.append(Spacer(1, 15))

        # Visualizations Panel
        elements.append(Paragraph("3. MRI Analysis Visualizations", section_heading))
        
        img_w, img_h = 125, 125
        img_cells = []
        
        for label, path_attr in [
            ("Original MRI", "original_image_path"),
            ("Grad-CAM Heatmap", "gradcam_image_path"),
            ("Segmentation Mask", "mask_image_path"),
            ("Combined Overlay", "overlay_image_path")
        ]:
            img_path = getattr(analysis, path_attr, None)
            if img_path and os.path.exists(img_path):
                img_obj = RLImage(img_path, width=img_w, height=img_h)
                cell = [Paragraph(f"<b>{label}</b>", normal_body), img_obj]
            else:
                cell = [Paragraph(f"<b>{label}</b>", normal_body), Paragraph("N/A", normal_body)]
            img_cells.append(cell)

        visual_table_data = [
            [img_cells[0][0], img_cells[1][0], img_cells[2][0], img_cells[3][0]],
            [img_cells[0][1], img_cells[1][1], img_cells[2][1], img_cells[3][1]]
        ]
        
        visual_table = Table(visual_table_data, colWidths=[135, 135, 135, 135])
        visual_table.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        elements.append(visual_table)
        elements.append(Spacer(1, 20))

        # Medical Disclaimer
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceAfter=10))
        disclaimer_text = (
            "<b>IMPORTANT RESEARCH DISCLAIMER:</b> NeuroScan AI provides AI-assisted image analysis "
            "for research and educational purposes only. Results are generated by machine learning algorithms "
            "and do NOT constitute a clinical or medical diagnosis. This software should not replace evaluation "
            "by a qualified board-certified physician or healthcare professional."
        )
        elements.append(Paragraph(disclaimer_text, disclaimer_style))

        doc.build(elements)
        return output_pdf_path

report_service = ReportService()
