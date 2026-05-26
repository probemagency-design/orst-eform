/**
 * pdf-gen.js — สร้าง PDF สำหรับ E-Form ราชบัณฑิตยสภา
 * ใช้ jsPDF (โหลดจาก CDN)
 * ภาษาไทยแสดงผ่าน HTML → print CSS (วิธีที่ไม่ต้อง embed font)
 */

const ORST_PDF = (() => {

  const NAVY = [13, 43, 94];
  const GOLD = [201, 168, 76];
  const GRAY = [100, 100, 100];
  const LIGHT = [247, 246, 242];

  function _header(doc, title, subtitle) {
    const W = 210;
    // Navy header bar
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, W, 32, 'F');
    // Gold accent line
    doc.setFillColor(...GOLD);
    doc.rect(0, 32, W, 1.5, 'F');
    // Org name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Office of the Royal Society', W / 2, 12, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('(Translated) ' + title, W / 2, 20, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(subtitle || '', W / 2, 27, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  function _sectionBox(doc, label, y) {
    doc.setFillColor(...LIGHT);
    doc.rect(14, y - 4, 182, 8, 'F');
    doc.setFillColor(...NAVY);
    doc.rect(14, y - 4, 3, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(label, 20, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    return y + 10;
  }

  function _row(doc, label, val, y, indent = 0) {
    const x = 14 + indent;
    doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(label, x, y);
    doc.setTextColor(30, 30, 30);
    const safeVal = val || '-';
    const lines = doc.splitTextToSize(safeVal, 110);
    doc.text(lines, x + 60, y);
    return y + (lines.length * 5) + 2;
  }

  function _divider(doc, y) {
    doc.setDrawColor(220, 220, 215);
    doc.setLineWidth(0.3);
    doc.line(14, y, 196, y);
    return y + 5;
  }

  function _footer(doc, toEmail) {
    const y = 272;
    doc.setFillColor(...LIGHT);
    doc.rect(0, y, 210, 25, 'F');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRAY);
    doc.text('เอกสารนี้สร้างจากระบบ e-Services สำนักงานราชบัณฑิตยสภา  |  กรุณาลงลายมือชื่อก่อนส่ง', 105, y + 7, { align: 'center' });
    doc.text('saraban@orst.go.th  |  โทร. ๐๒ ๑๔๑ ๑๗๑๘', 105, y + 13, { align: 'center' });
    doc.setTextColor(150, 150, 150);
    doc.text('ส่งถึง: ' + toEmail, 105, y + 19, { align: 'center' });
  }

  function _signBox(doc, name, y) {
    y += 8;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    // Left sig box
    doc.rect(14, y, 80, 30);
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('ลงชื่อ ...................................', 54, y + 10, { align: 'center' });
    doc.text('(........................................)', 54, y + 17, { align: 'center' });
    doc.text('ผู้ยื่นคำขอ', 54, y + 24, { align: 'center' });
    // Right date box
    doc.rect(116, y, 80, 30);
    doc.text('วันที่ ........./........./..........', 156, y + 10, { align: 'center' });
    doc.text('(ว.ด.ป.)', 156, y + 17, { align: 'center' });
  }

  /* ──────────────────────────────────────
     สร้าง PDF ฟอร์ม 1
  ────────────────────────────────────── */
  function buildForm1(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    _header(doc,
      'Application for Permission to Print and Distribute',
      'Pursuant to the Royal Society Regulation B.E. 2561'
    );

    let y = 42;

    // ─ Section 1: ผู้ยื่น
    y = _sectionBox(doc, 'ส่วนที่ ๑  ข้อมูลผู้ยื่นคำขอ', y);
    y = _row(doc, 'ชื่อ-นามสกุล', data.name, y);
    y = _row(doc, 'ตำแหน่ง', data.position, y);
    y = _row(doc, 'หน่วยงาน/องค์กร', data.organization, y);
    y = _row(doc, 'ที่อยู่', data.address, y);
    y = _row(doc, 'โทรศัพท์', data.tel, y);
    y = _row(doc, 'อีเมล', data.email, y);
    y = _divider(doc, y + 2);

    // ─ Section 2: สิ่งพิมพ์
    y = _sectionBox(doc, 'ส่วนที่ ๒  รายละเอียดสิ่งพิมพ์/สื่อที่ขออนุญาต', y);
    y = _row(doc, 'ชื่อสิ่งพิมพ์/สื่อ', data.publicationName, y);
    y = _row(doc, 'ประเภทสื่อ', data.mediaType, y);
    y = _row(doc, 'จำนวนที่ต้องการ', data.quantity ? data.quantity + ' เล่ม/ชุด' : '-', y);
    y = _row(doc, 'ช่องทางการเผยแพร่', data.channel, y);
    y = _row(doc, 'วัตถุประสงค์', data.purpose, y);
    y = _divider(doc, y + 2);

    // ─ Section 3: เอกสารแนบ
    y = _sectionBox(doc, 'ส่วนที่ ๓  เอกสารแนบ', y);
    const docs = [
      '☐  สำเนาบัตรประจำตัวประชาชน / บัตรข้าราชการ',
      '☐  หนังสือมอบอำนาจ (กรณีมอบอำนาจ)',
      '☐  ตัวอย่างสิ่งพิมพ์/สื่อที่ขออนุญาต',
      '☐  เอกสารอื่น ๆ ตามที่เจ้าหน้าที่กำหนด',
    ];
    docs.forEach(d => {
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(d, 18, y);
      y += 6;
    });
    y += 2;
    y = _divider(doc, y);

    // ─ Section 4: ข้อมูลการยื่น
    y = _sectionBox(doc, 'ส่วนที่ ๔  ข้อมูลการยื่นคำขอ', y);
    y = _row(doc, 'วันที่ยื่น', data.date, y);
    y = _row(doc, 'ยื่นถึง', data.toEmail, y);
    y = _row(doc, 'เลขที่คำขอ (จนท.)', '', y);
    y = _row(doc, 'วันที่รับเรื่อง (จนท.)', '', y);

    _signBox(doc, data.name, y + 4);
    _footer(doc, data.toEmail);

    return doc;
  }

  /* ──────────────────────────────────────
     สร้าง PDF ฟอร์ม 2
  ────────────────────────────────────── */
  function buildForm2(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    _header(doc,
      'Application for License to Print and Sell Publications',
      'Pursuant to the Royal Society Regulation B.E. 2561'
    );

    let y = 42;

    // ─ Section 1: ผู้ยื่น
    y = _sectionBox(doc, 'ส่วนที่ ๑  ข้อมูลผู้ยื่นคำขอ', y);
    y = _row(doc, 'ชื่อ-นามสกุล', data.name, y);
    y = _row(doc, 'ตำแหน่ง', data.position, y);
    y = _row(doc, 'บริษัท/หน่วยงาน', data.company, y);
    y = _row(doc, 'ที่อยู่', data.address, y);
    y = _row(doc, 'โทรศัพท์', data.tel, y);
    y = _row(doc, 'อีเมล', data.email, y);
    y = _divider(doc, y + 2);

    // ─ Section 2: หนังสือ
    y = _sectionBox(doc, 'ส่วนที่ ๒  รายละเอียดหนังสือที่ขอใช้สิทธิ', y);
    y = _row(doc, 'ชื่อหนังสือ', data.bookTitle, y);
    y = _row(doc, 'ISBN', data.isbn, y);
    y = _row(doc, 'ฉบับที่/ปีที่พิมพ์', data.edition, y);
    y = _row(doc, 'จำนวนพิมพ์', data.quantity ? data.quantity + ' เล่ม' : '-', y);
    y = _row(doc, 'ราคาจำหน่าย', data.price ? 'เล่มละ ' + data.price + ' บาท' : '-', y);
    y = _row(doc, 'ระยะเวลาลิขสิทธิ์', data.licenseYears ? data.licenseYears + ' ปี' : '-', y);
    y = _divider(doc, y + 2);

    // ─ Section 3: แผนจำหน่าย
    y = _sectionBox(doc, 'ส่วนที่ ๓  แผนการจัดจำหน่าย', y);
    y = _row(doc, 'ช่องทางจำหน่าย', data.channels, y);
    y = _row(doc, 'พื้นที่จำหน่าย', data.salesArea, y);
    y = _row(doc, 'แผนการตลาด', data.marketPlan, y);
    y = _divider(doc, y + 2);

    // ─ Section 4: เอกสารแนบ
    y = _sectionBox(doc, 'ส่วนที่ ๔  เอกสารแนบ', y);
    const docs = [
      '☐  สำเนาบัตรประจำตัวประชาชน / หนังสือรับรองบริษัท',
      '☐  หนังสือมอบอำนาจ (กรณีมอบอำนาจ)',
      '☐  ตัวอย่างรูปแบบการจัดจำหน่าย',
      '☐  เอกสารอื่น ๆ ตามที่เจ้าหน้าที่กำหนด',
    ];
    docs.forEach(d => {
      doc.setFontSize(8.5);
      doc.setTextColor(40, 40, 40);
      doc.text(d, 18, y);
      y += 6;
    });
    y += 2;
    y = _divider(doc, y);

    // ─ Section 5: ข้อมูลการยื่น
    y = _sectionBox(doc, 'ส่วนที่ ๕  ข้อมูลการยื่นคำขอ', y);
    y = _row(doc, 'วันที่ยื่น', data.date, y);
    y = _row(doc, 'ยื่นถึง', data.toEmail, y);
    y = _row(doc, 'เลขที่คำขอ (จนท.)', '', y);
    y = _row(doc, 'วันที่รับเรื่อง (จนท.)', '', y);

    _signBox(doc, data.name, y + 4);
    _footer(doc, data.toEmail);

    return doc;
  }

  return { buildForm1, buildForm2 };
})();
