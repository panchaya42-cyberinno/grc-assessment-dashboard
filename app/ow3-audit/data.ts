// ─── อว.3 IT Audit — คปภ. / ETDA "วิธีการแบบปลอดภัยในระดับเคร่งครัด" ──────────
// อ้างอิง: ประกาศ คปภ. เรื่องการเสนอขายกรมธรรม์ผ่านระบบอิเล็กทรอนิกส์

export type CheckResult = "C" | "NC" | "OFI" | ""

export interface OW3Item {
  id: string
  clause: string
  control: string
  requirement: string
  evidence: string
  regulatoryNote: string
}

export interface OW3Section {
  id: string
  code: string
  title: string
  theme: "policy" | "governance" | "asset" | "people" | "physical" | "operations" | "access" | "development" | "incident" | "bcp" | "compliance"
  themeLabel: string
  items: OW3Item[]
}

export const SECTIONS: OW3Section[] = [
  // ─── หมวดที่ ๑ ───────────────────────────────────────────────────────────────
  {
    id: "s1", code: "๑", theme: "policy", themeLabel: "Policy",
    title: "การสร้างความมั่นคงปลอดภัยด้านบริหารจัดการ",
    items: [
      {
        id: "1.1", clause: "๑.๑", control: "นโยบาย IT Security",
        requirement: "กำหนดนโยบายในการรักษาความมั่นคงปลอดภัยด้านสารสนเทศ โดยผ่านการอนุมัติและผลักดันโดยผู้บริหารระดับสูง และมีการประกาศนโยบายดังกล่าวให้พนักงานและบุคคลภายนอกที่เกี่ยวข้องรับทราบโดยทั่วกัน",
        evidence: "เอกสารนโยบาย IT Security ที่ผู้บริหารลงนาม | บันทึก/ช่องทางการประกาศให้พนักงานทราบ",
        regulatoryNote: "ประกาศ คปภ. กำหนดให้มีนโยบาย IT Security เป็นลายลักษณ์อักษร",
      },
      {
        id: "1.2", clause: "๑.๒", control: "การทบทวนนโยบาย",
        requirement: "วางแผนการติดตามและประเมินผลการใช้งานความมั่นคงปลอดภัยด้านสารสนเทศ และนโยบายอย่างสม่ำเสมอ เพื่อปรับปรุงหากมีการเปลี่ยนแปลง",
        evidence: "Policy Review Minutes / บันทึกการทบทวนนโยบาย | ตารางรอบการทบทวน",
        regulatoryNote: "ต้องทบทวนอย่างน้อยปีละ 1 ครั้ง",
      },
    ],
  },

  // ─── หมวดที่ ๒ ───────────────────────────────────────────────────────────────
  {
    id: "s2", code: "๒", theme: "governance", themeLabel: "Governance",
    title: "การจัดโครงสร้างด้านความมั่นคงปลอดภัยของระบบสารสนเทศ",
    items: [
      {
        id: "2.1", clause: "๒.๑", control: "ผู้บริหารระดับสูงดูแล IT Security",
        requirement: "ผู้บริหารระดับสูงมีหน้าที่ดูแลรับผิดชอบงานด้านสารสนเทศ กำหนดทิศทาง มอบหมายงาน และรับผิดชอบต่อความเสี่ยงที่เกิดขึ้น",
        evidence: "แผนผังองค์กร (Org Chart) | คำสั่งแต่งตั้ง CISO/ISO | Job Description",
        regulatoryNote: "คปภ. กำหนดให้ผู้บริหารระดับสูงรับผิดชอบโดยตรง",
      },
      {
        id: "2.2", clause: "๒.๒", control: "ขั้นตอนอนุมัติระบบใหม่",
        requirement: "สำหรับระบบสารสนเทศใหม่มีการกำหนดขั้นตอนการพิจารณาทบทวน เพื่ออนุมัติการสร้าง การติดตั้ง หรือการใช้งาน",
        evidence: "IT Approval Form / Change Request Process | บันทึกการอนุมัติระบบใหม่",
        regulatoryNote: "รวมถึงระบบ E-Insurance",
      },
      {
        id: "2.3", clause: "๒.๓", control: "NDA / Confidentiality Agreement",
        requirement: "มีการกำหนดสัญญาการรักษาข้อมูลที่เป็นความลับ (Confidentiality Agreement) ที่สอดคล้องกับความต้องการขององค์กร",
        evidence: "ตัวอย่าง NDA / Confidentiality Agreement กับพนักงานและ Third Party",
        regulatoryNote: "รวม Sub-contractors ทุกราย",
      },
      {
        id: "2.4", clause: "๒.๔", control: "ข้อกำหนดความมั่นคงสำหรับ Third Party",
        requirement: "มีข้อกำหนดเกี่ยวกับความมั่นคงปลอดภัยสำหรับการอนุญาตให้บุคคลภายนอกเข้าถึงระบบสารสนเทศ",
        evidence: "Third Party Access Policy | สัญญาจ้าง/MOU ที่ระบุข้อกำหนด IT Security",
        regulatoryNote: "เกี่ยวข้องกับ PDPA มาตรา 40 สำหรับ Data Processor",
      },
      {
        id: "2.5", clause: "๒.๕", control: "ข้อตกลงการเข้าถึงระบบ/ข้อมูล",
        requirement: "ข้อตกลงอนุญาตให้บุคคลภายนอกเข้าถึงระบบ ต้องมีข้อกำหนดด้าน IT Security ระบุในสัญญา",
        evidence: "Service Agreement / Outsourcing Contract | ตัวอย่าง Security Clause",
        regulatoryNote: "ครอบคลุม Cloud Provider, Payment Gateway",
      },
      {
        id: "2.6", clause: "๒.๖", control: "กำหนดหน้าที่รับผิดชอบ IT Security",
        requirement: "มีการกำหนดหน้าที่ความรับผิดชอบต่างๆ เกี่ยวกับความมั่นคงปลอดภัยด้านสารสนเทศไว้อย่างชัดเจน",
        evidence: "RACI Matrix / Security Responsibilities Matrix | Job Description",
        regulatoryNote: "รวมถึงตำแหน่ง DPO ตาม PDPA",
      },
      {
        id: "2.7", clause: "๒.๗", control: "ช่องทางติดต่อหน่วยงานภายนอก",
        requirement: "มีการกำหนดขั้นตอนและช่องทางในการติดต่อกับหน่วยงานภายนอกที่มีความเชี่ยวชาญด้าน IT Security",
        evidence: "Escalation Contact List (ThaiCERT, สกมช., คปภ.) | External Contact Procedure",
        regulatoryNote: "รวมถึงช่องทางแจ้ง คปภ. กรณี Incident",
      },
      {
        id: "2.8", clause: "๒.๘", control: "ทบทวนการบริหารจัดการ IT Security",
        requirement: "จัดให้มีการพิจารณาทบทวนแนวทางบริหารจัดการงาน IT Security อย่างสม่ำเสมอ โดยผู้ไม่มีส่วนได้เสีย",
        evidence: "Internal Audit Report / Management Review Minutes | รายงาน Independent Review",
        regulatoryNote: "ควรดำเนินการโดยผู้ตรวจสอบอิสระ (CISA/CISSP/CISM)",
      },
      {
        id: "2.9", clause: "๒.๙", control: "ความร่วมมือผู้มีบทบาทด้าน IT Security",
        requirement: "มีการสร้างความร่วมมือระหว่างผู้ที่มีบทบาทเกี่ยวข้องกับ IT Security ในกิจกรรมต่างๆ",
        evidence: "IT Security Committee Minutes | Working Group Records",
        regulatoryNote: "รวมถึง Cross-functional team สำหรับ E-Insurance",
      },
      {
        id: "2.10", clause: "๒.๑๐", control: "ช่องทางติดต่อหน่วยงานกำกับดูแล",
        requirement: "มีการกำหนดขั้นตอนและช่องทางในการติดต่อกับหน่วยงานกำกับดูแล หรือหน่วยงานบังคับใช้กฎหมาย",
        evidence: "Regulatory Contact List | Crisis Communication Plan | Incident Reporting Procedure to OIC",
        regulatoryNote: "คปภ. ต้องการช่องทางแจ้งเหตุ Cyber Incident โดยตรง",
      },
      {
        id: "2.11", clause: "๒.๑๑", control: "ประเมินความเสี่ยง Third Party ก่อนให้สิทธิ์",
        requirement: "ก่อนอนุญาตให้บุคคลภายนอกเข้าถึงระบบ ต้องระบุความเสี่ยงและกำหนดแนวทางป้องกัน",
        evidence: "Third Party Risk Assessment Form | ผลการประเมินก่อนให้สิทธิ์ | Vendor Risk Register",
        regulatoryNote: "สำคัญสำหรับ Cloud Provider และ Payment Gateway",
      },
    ],
  },

  // ─── หมวดที่ ๓ ───────────────────────────────────────────────────────────────
  {
    id: "s3", code: "๓", theme: "asset", themeLabel: "Asset",
    title: "การบริหารจัดการทรัพย์สินสารสนเทศ",
    items: [
      {
        id: "3.1", clause: "๓.๑", control: "Asset Inventory",
        requirement: "มีการเก็บบันทึกข้อมูลทรัพย์สินสารสนเทศ ข้อมูลที่จัดเก็บต้องมีรายละเอียดเพียงพอสำหรับการค้นหาและใช้งาน",
        evidence: "Asset Inventory / CMDB (Hardware, Software, Data, Services) | วันที่อัปเดตล่าสุด",
        regulatoryNote: "ครอบคลุมทั้ง On-premise และ Cloud Assets",
      },
      {
        id: "3.2", clause: "๓.๒", control: "Asset Owner",
        requirement: "มีการกำหนดบุคคลผู้มีหน้าที่ดูแลและรับผิดชอบทรัพย์สินสารสนเทศไว้ชัดเจน",
        evidence: "Asset Inventory ที่ระบุ Owner | บันทึกการมอบหมาย Asset Owner",
        regulatoryNote: "ระบุ Owner ของระบบ E-Insurance โดยเฉพาะ",
      },
      {
        id: "3.3", clause: "๓.๓", control: "กฎระเบียบการใช้งานทรัพย์สิน",
        requirement: "มีการกำหนดกฎระเบียบในการใช้งานทรัพย์สินสารสนเทศเป็นเอกสาร และประกาศใช้",
        evidence: "Acceptable Use Policy (AUP) | IT Usage Policy",
        regulatoryNote: "รวมถึงนโยบายการใช้ Cloud Service",
      },
      {
        id: "3.4", clause: "๓.๔", control: "Data Classification",
        requirement: "มีการจำแนกประเภทของข้อมูลสารสนเทศ โดยจำแนกตามมูลค่า ข้อกำหนดกฎหมาย ระดับชั้นความลับ",
        evidence: "Data Classification Policy | ตารางระดับชั้นความลับ | ตัวอย่างการจำแนก",
        regulatoryNote: "ข้อมูลกรมธรรม์ประกันภัยและ PII ถือเป็น Confidential",
      },
      {
        id: "3.5", clause: "๓.๕", control: "Data Handling & Secure Disposal",
        requirement: "มีการกำหนดและประกาศใช้ขั้นตอนที่เหมาะสมในการจำแนกประเภทและจัดการข้อมูล รวมถึงการทำลายอุปกรณ์จัดเก็บข้อมูล",
        evidence: "Data Handling Procedure | Secure Disposal Policy | Destruction Log",
        regulatoryNote: "สอดคล้อง PDPA มาตรา 37 ด้านการทำลายข้อมูล",
      },
    ],
  },

  // ─── หมวดที่ ๔ ───────────────────────────────────────────────────────────────
  {
    id: "s4", code: "๔", theme: "people", themeLabel: "People",
    title: "การสร้างความมั่นคงปลอดภัยของระบบสารสนเทศด้านบุคลากร",
    items: [
      {
        id: "4.1", clause: "๔.๑", control: "หน้าที่รับผิดชอบ IT Security ของบุคลากร",
        requirement: "กำหนดหน้าที่ความรับผิดชอบด้าน IT Security ของพนักงาน สอดคล้องกับนโยบาย IT Security",
        evidence: "Job Description | สัญญาจ้างที่ระบุความรับผิดชอบด้าน IT Security",
        regulatoryNote: "ครอบคลุม Outsource และ Contractor",
      },
      {
        id: "4.2", clause: "๔.๒", control: "บังคับปฏิบัติตามนโยบาย IT Security",
        requirement: "ผู้บริหารระดับสูงกำหนดให้พนักงาน/Outsource ปฏิบัติตามนโยบายและระเบียบปฏิบัติ IT Security",
        evidence: "ประกาศ/คำสั่งภายใน | Acknowledgement Form ที่พนักงานลงนาม",
        regulatoryNote: "รวมถึง Third Party ที่เข้าถึงระบบ E-Insurance",
      },
      {
        id: "4.3", clause: "๔.๓", control: "บทลงโทษกรณีฝ่าฝืน",
        requirement: "กำหนดขั้นตอนการลงโทษพนักงานที่ฝ่าฝืนนโยบายหรือระเบียบปฏิบัติด้าน IT Security",
        evidence: "Disciplinary Policy | ข้อบังคับการทำงานที่ระบุบทลงโทษ",
        regulatoryNote: "",
      },
      {
        id: "4.4", clause: "๔.๔", control: "ขั้นตอนยุติการจ้าง",
        requirement: "กำหนดหน้าที่ความรับผิดชอบในการยุติการจ้าง/เปลี่ยนสถานะการจ้างให้ชัดเจน",
        evidence: "Employee Offboarding Checklist | HR Termination Procedure",
        regulatoryNote: "ต้องยกเลิกสิทธิ์ภายใน 24 ชั่วโมงหลังสิ้นสุดการจ้าง",
      },
      {
        id: "4.5", clause: "๔.๕", control: "ส่งคืนทรัพย์สินเมื่อสิ้นสุดสัญญา",
        requirement: "พนักงาน/Outsource ต้องส่งคืนทรัพย์สินสารสนเทศทั้งหมดเมื่อสิ้นสุดสถานะการจ้าง",
        evidence: "Asset Return Form | Offboarding Checklist รายการส่งคืน",
        regulatoryNote: "",
      },
      {
        id: "4.6", clause: "๔.๖", control: "ยกเลิกสิทธิ์การเข้าถึงเมื่อสิ้นสุดสัญญา",
        requirement: "ให้ยกเลิกสิทธิ์เข้าใช้งานระบบสารสนเทศทันที และปรับสิทธิ์เมื่อเปลี่ยนหน้าที่",
        evidence: "Access Revocation Log | IT Offboarding Record ระบุวันที่ปิดสิทธิ์",
        regulatoryNote: "สำคัญมากสำหรับ Privileged User",
      },
      {
        id: "4.7", clause: "๔.๗", control: "Security Awareness Training",
        requirement: "พนักงาน/Outsource ต้องได้รับการอบรม Security Awareness และรับทราบนโยบายอย่างสม่ำเสมอ",
        evidence: "Training Records | Quiz Result | ใบเข้าร่วมอบรม | Awareness Campaign Evidence",
        regulatoryNote: "อย่างน้อยปีละ 1 ครั้ง ตามที่ คปภ. กำหนด",
      },
      {
        id: "4.8", clause: "๔.๘", control: "Background Verification",
        requirement: "ในการรับพนักงาน/Outsource ให้มีการตรวจสอบประวัติตามกฎหมายและจริยธรรม โดยคำนึงถึงระดับชั้นความลับ",
        evidence: "Background Verification Policy | ตัวอย่าง Background Check Report (Anonymized)",
        regulatoryNote: "สำคัญสำหรับตำแหน่งที่เข้าถึงข้อมูลกรมธรรม์",
      },
      {
        id: "4.9", clause: "๔.๙", control: "สัญญาจ้างระบุ IT Security",
        requirement: "ในสัญญาจ้างให้ระบุหน้าที่ความรับผิดชอบด้าน IT Security ไว้ในสัญญา",
        evidence: "ตัวอย่างสัญญาจ้างมี IT Security Clause | NDA",
        regulatoryNote: "",
      },
    ],
  },

  // ─── หมวดที่ ๕ ───────────────────────────────────────────────────────────────
  {
    id: "s5", code: "๕", theme: "physical", themeLabel: "Physical",
    title: "การสร้างความมั่นคงปลอดภัยด้านกายภาพและสภาพแวดล้อม",
    items: [
      {
        id: "5.1", clause: "๕.๑", control: "Security Perimeter",
        requirement: "มีการป้องกันขอบเขตพื้นที่ที่มีการติดตั้ง จัดเก็บ หรือใช้งานระบบสารสนเทศ",
        evidence: "Physical Security Policy | Floor Plan แสดง Security Zone | Access Control System",
        regulatoryNote: "",
      },
      {
        id: "5.2", clause: "๕.๒", control: "ป้องกันภัยธรรมชาติ/ภัยจากภายนอก",
        requirement: "มีการออกแบบและติดตั้งการป้องกัน ต่ออัคคีภัย อุทกภัย แผ่นดินไหว ระเบิด",
        evidence: "รายงานตรวจสอบระบบดับเพลิง | Fire Suppression System Certificate | BCP Physical Section",
        regulatoryNote: "",
      },
      {
        id: "5.3", clause: "๕.๓", control: "การจัดวางอุปกรณ์สารสนเทศ",
        requirement: "จัดวางและป้องกันอุปกรณ์สารสนเทศเพื่อลดความเสี่ยงจากภัยธรรมชาติและการเข้าถึงโดยไม่ได้รับอนุญาต",
        evidence: "Server Room Layout | Equipment Placement Policy | บันทึกการวางอุปกรณ์ใน Rack",
        regulatoryNote: "",
      },
      {
        id: "5.4", clause: "๕.๔", control: "ป้องกันไฟฟ้าขัดข้อง (UPS/Generator)",
        requirement: "มีการป้องกันอุปกรณ์สารสนเทศจากไฟฟ้าขัดข้องหรือโครงสร้างพื้นฐาน",
        evidence: "สัญญา MA ระบบ UPS | Generator Maintenance Log | UPS Test Record",
        regulatoryNote: "สำคัญสำหรับ Availability ของระบบ E-Insurance",
      },
      {
        id: "5.5", clause: "๕.๕", control: "บำรุงรักษาอุปกรณ์สารสนเทศ",
        requirement: "มีการดูแลอุปกรณ์สารสนเทศอย่างถูกวิธีเพื่อให้คงความถูกต้องและพร้อมใช้งาน",
        evidence: "Equipment Maintenance Log | Maintenance Agreement (MA)",
        regulatoryNote: "",
      },
      {
        id: "5.6", clause: "๕.๖", control: "Physical Access Control",
        requirement: "มีการออกแบบและติดตั้งการป้องกัน IT Security ด้านกายภาพ สำหรับพื้นที่ปฏิบัติงานหรืออุปกรณ์",
        evidence: "Access Log ห้อง Server | CCTV Policy (90 วัน retention) | Key Card/Biometric Log",
        regulatoryNote: "",
      },
      {
        id: "5.7", clause: "๕.๗", control: "ห้ามนำอุปกรณ์ออกนอกสถานที่โดยไม่ได้รับอนุญาต",
        requirement: "ไม่ควรนำอุปกรณ์สารสนเทศ ข้อมูล หรือซอฟต์แวร์ออกจากสถานที่ปฏิบัติงานหากไม่ได้รับอนุญาต",
        evidence: "Equipment Removal Authorization Form | Asset Movement Log",
        regulatoryNote: "",
      },
      {
        id: "5.8", clause: "๕.๘", control: "ควบคุมการเข้าออก Secure Area",
        requirement: "ในพื้นที่ Secure Area ต้องควบคุมการเข้าออก โดยเฉพาะผู้มีสิทธิ์เท่านั้น",
        evidence: "Authorized Access List | Access Control Log ห้องเซิร์ฟเวอร์",
        regulatoryNote: "",
      },
      {
        id: "5.9", clause: "๕.๙", control: "แนวทางป้องกันทางกายภาพสำหรับ Secure Area",
        requirement: "มีการออกแบบแนวทางป้องกันทางกายภาพสำหรับ Secure Area และนำไปใช้งาน",
        evidence: "Physical Security Procedure | Visitor/Escort Policy",
        regulatoryNote: "",
      },
      {
        id: "5.10", clause: "๕.๑๐", control: "ควบคุมพื้นที่เสี่ยง (Loading Dock ฯลฯ)",
        requirement: "มีการควบคุมบริเวณที่ผู้ไม่มีสิทธิ์อาจเข้าถึงได้ หรือแยกออกจากพื้นที่ IT",
        evidence: "Physical Security Plan | บันทึกการตรวจสอบพื้นที่เสี่ยง",
        regulatoryNote: "",
      },
      {
        id: "5.11", clause: "๕.๑๑", control: "ป้องกันสายเคเบิล/สายไฟ",
        requirement: "มีการป้องกันสายเคเบิลที่ใช้สื่อสาร หรือสายไฟ ป้องกันการดักสัญญาณ",
        evidence: "Network/Cable Management Plan | ภาพถ่ายการเดินสาย",
        regulatoryNote: "",
      },
      {
        id: "5.12", clause: "๕.๑๒", control: "ป้องกันอุปกรณ์นอกสถานที่",
        requirement: "มีการรักษา IT Security สำหรับอุปกรณ์ที่นำไปใช้นอกสถานที่",
        evidence: "Mobile Device Policy | Remote Work Policy | Equipment Loan Form",
        regulatoryNote: "",
      },
      {
        id: "5.13", clause: "๕.๑๓", control: "Secure Disposal ก่อนยกเลิกอุปกรณ์",
        requirement: "ก่อนยกเลิก/จำหน่ายอุปกรณ์ ต้องลบหรือทำลายข้อมูลสำคัญด้วยวิธีที่ไม่สามารถกู้คืนได้",
        evidence: "Secure Disposal Policy | Wiping Log / Certificate of Destruction",
        regulatoryNote: "สอดคล้อง PDPA มาตรา 37",
      },
    ],
  },

  // ─── หมวดที่ ๖ ───────────────────────────────────────────────────────────────
  {
    id: "s6", code: "๖", theme: "operations", themeLabel: "Operations",
    title: "การบริหารจัดการด้านการสื่อสารและการดำเนินงาน",
    items: [
      {
        id: "6.1", clause: "๖.๑", control: "SOP / ขั้นตอนการปฏิบัติงาน",
        requirement: "มีการจัดทำ ปรับปรุง และดูแลเอกสารขั้นตอนการปฏิบัติงานที่พร้อมใช้งาน",
        evidence: "SOP / Work Instruction ด้าน IT Operations ที่เป็นปัจจุบัน",
        regulatoryNote: "",
      },
      {
        id: "6.2", clause: "๖.๒", control: "ติดตาม Third Party ให้ปฏิบัติตาม SLA",
        requirement: "ดูแลให้บุคคล/หน่วยงานภายนอกปฏิบัติตามสัญญา/SLA ที่ครอบคลุมด้าน IT Security",
        evidence: "SLA / Contract ที่ระบุข้อกำหนด Security | Third Party Performance Review",
        regulatoryNote: "",
      },
      {
        id: "6.3", clause: "๖.๓", control: "ตรวจสอบรายงาน/Log บริการของ Third Party",
        requirement: "ติดตามตรวจสอบรายงานหรือบันทึกการให้บริการของ Third Party อย่างสม่ำเสมอ",
        evidence: "Vendor Service Report | Vendor Review Minutes ย้อนหลัง 12 เดือน",
        regulatoryNote: "",
      },
      {
        id: "6.4", clause: "๖.๔", control: "เกณฑ์ตรวจรับระบบ",
        requirement: "กำหนดเกณฑ์การตรวจรับระบบสารสนเทศที่ปรับปรุง/เวอร์ชันใหม่ และทดสอบก่อนตรวจรับ",
        evidence: "UAT Plan & Report | System Acceptance Criteria",
        regulatoryNote: "",
      },
      {
        id: "6.5", clause: "๖.๕", control: "ป้องกัน Malware และ Security Awareness",
        requirement: "มีขั้นตอนควบคุมการตรวจสอบ ป้องกัน และกู้คืนกรณีมีโปรแกรมไม่พึงประสงค์",
        evidence: "Antivirus/EDR Policy & Configuration | Security Awareness Records",
        regulatoryNote: "",
      },
      {
        id: "6.6", clause: "๖.๖", control: "Backup และทดสอบการกู้คืน",
        requirement: "มีการสำรองข้อมูลสารสนเทศ และทดสอบการนำกลับมาใช้งานตามนโยบาย Backup",
        evidence: "Backup Policy | Backup Schedule | Restore Test Report (ปีล่าสุด)",
        regulatoryNote: "RTO/RPO ต้องผ่านการทดสอบ ตามที่ คปภ. กำหนด",
      },
      {
        id: "6.7", clause: "๖.๗", control: "Network Security",
        requirement: "มีการบริหารจัดการควบคุมเครือข่ายเพื่อป้องกันภัยคุกคาม",
        evidence: "Network Security Policy | Network Diagram | Firewall Rule Review",
        regulatoryNote: "",
      },
      {
        id: "6.8", clause: "๖.๘", control: "Network Service Agreement",
        requirement: "กำหนดรูปแบบ Security ระดับบริการ ในข้อตกลงการให้บริการเครือข่าย",
        evidence: "Network Service Agreement | ISP Contract ที่ระบุข้อกำหนด IT Security",
        regulatoryNote: "",
      },
      {
        id: "6.9", clause: "๖.๙", control: "นโยบายแลกเปลี่ยนข้อมูลอิเล็กทรอนิกส์",
        requirement: "นโยบายและขั้นตอนปฏิบัติงาน รวมถึงควบคุมการแลกเปลี่ยนข้อมูลผ่านช่องทาง Electronic",
        evidence: "Data Exchange Policy | Email Security Policy | Secure File Transfer Procedure",
        regulatoryNote: "",
      },
      {
        id: "6.10", clause: "๖.๑๐", control: "ข้อตกลงแลกเปลี่ยนข้อมูลกับ Third Party",
        requirement: "จัดให้มีข้อตกลงในการแลกเปลี่ยนข้อมูลสารสนเทศ/ซอฟต์แวร์กับบุคคลภายนอก",
        evidence: "Information Sharing Agreement | MOU ด้านการแลกเปลี่ยนข้อมูล",
        regulatoryNote: "",
      },
      {
        id: "6.11", clause: "๖.๑๑", control: "ป้องกันข้อมูลที่แลกเปลี่ยนผ่านระบบที่เชื่อมต่อ",
        requirement: "นโยบายและขั้นตอนป้องกันข้อมูลที่สื่อสาร/แลกเปลี่ยนผ่านระบบที่เชื่อมต่อ",
        evidence: "System Integration Security Policy | API Security Guidelines",
        regulatoryNote: "",
      },
      {
        id: "6.12", clause: "๖.๑๒", control: "ป้องกันข้อมูล e-Commerce",
        requirement: "ป้องกันข้อมูลที่แลกเปลี่ยนใน Electronic Commerce จากการฉ้อโกง รั่วไหล แก้ไข",
        evidence: "E-Commerce Security Policy | TLS/SSL Certificate | Fraud Prevention Controls",
        regulatoryNote: "สำคัญสำหรับระบบรับชำระเงินค่าเบี้ยประกัน",
      },
      {
        id: "6.13", clause: "๖.๑๓", control: "ป้องกันข้อมูล Online Transaction",
        requirement: "ป้องกันข้อมูล Online Transaction ไม่ให้ไม่สมบูรณ์ ส่งผิดที่ หรือถูกแก้ไข",
        evidence: "Transaction Security Controls | Digital Signature Policy | Audit Trail System",
        regulatoryNote: "สำคัญสำหรับการรับชำระเงินค่าเบี้ยและออกกรมธรรม์ Online",
      },
      {
        id: "6.14", clause: "๖.๑๔", control: "ป้องกันข้อมูลสาธารณะจากการแก้ไข",
        requirement: "สำหรับข้อมูลที่เผยแพร่สาธารณะ ให้ป้องกันการแก้ไขโดยไม่ได้รับอนุญาต",
        evidence: "Web Content Integrity Controls | Change Management Log เนื้อหาเว็บ",
        regulatoryNote: "",
      },
      {
        id: "6.15", clause: "๖.๑๕", control: "Audit Log การใช้งานระบบ",
        requirement: "มีการเก็บบันทึก Audit Log กิจกรรมผู้ใช้งาน และเหตุการณ์ IT Security เพื่อประโยชน์สืบสวน",
        evidence: "Audit Log Policy | ตัวอย่าง Log จาก SIEM | Log Retention Schedule (อย่างน้อย 1 ปี)",
        regulatoryNote: "คปภ. กำหนดให้เก็บ Audit Trail อย่างน้อย 5 ปี สำหรับ E-Insurance",
      },
      {
        id: "6.16", clause: "๖.๑๖", control: "Monitoring การใช้งานระบบ",
        requirement: "มีขั้นตอนเฝ้าติดตามสังเกตการใช้งานระบบ และประเมินผลอย่างสม่ำเสมอ",
        evidence: "Monitoring Policy | SIEM Dashboard Screenshot | SOC Report",
        regulatoryNote: "",
      },
      {
        id: "6.17", clause: "๖.๑๗", control: "ป้องกัน Log System",
        requirement: "ป้องกันระบบและข้อมูล Log จากการเข้าถึงหรือแก้ไขโดยไม่ได้รับอนุญาต",
        evidence: "Log Management Policy | Access Control บน Log Server",
        regulatoryNote: "",
      },
      {
        id: "6.18", clause: "๖.๑๘", control: "Admin Activity Log",
        requirement: "มีการจัดเก็บ Log ที่เกี่ยวข้องกับการดูแลระบบโดย System Administrator",
        evidence: "Admin Activity Log | Privileged Access Log ย้อนหลัง 3-12 เดือน",
        regulatoryNote: "",
      },
      {
        id: "6.19", clause: "๖.๑๙", control: "Change Management",
        requirement: "มีการจัดการควบคุมการเปลี่ยนแปลงของระบบสารสนเทศ",
        evidence: "Change Management Policy | Change Request Log | CAB Minutes",
        regulatoryNote: "",
      },
      {
        id: "6.20", clause: "๖.๒๐", control: "IT Capacity Planning",
        requirement: "ติดตามผลการใช้งานทรัพยากร IT และวางแผนรองรับการปฏิบัติงานในอนาคต",
        evidence: "IT Capacity Report | IT Resource Planning Document",
        regulatoryNote: "สำคัญสำหรับ Availability ของระบบ E-Insurance",
      },
      {
        id: "6.21", clause: "๖.๒๑", control: "จัดการและจัดเก็บข้อมูล — ป้องกันรั่วไหล",
        requirement: "ขั้นตอนการปฏิบัติงานสำหรับจัดการและจัดเก็บข้อมูล ป้องกันรั่วไหลหรือใช้ผิดประเภท",
        evidence: "Data Handling Procedure | DLP Policy & Configuration",
        regulatoryNote: "",
      },
      {
        id: "6.22", clause: "๖.๒๒", control: "Error Log / Problem Management",
        requirement: "มีการจัดเก็บ Error Log วิเคราะห์อย่างสม่ำเสมอ และแก้ไขข้อผิดพลาด",
        evidence: "System Error Log | Problem Management Record",
        regulatoryNote: "",
      },
      {
        id: "6.23", clause: "๖.๒๓", control: "Time Synchronization (NTP)",
        requirement: "ระบบเวลาของ IT Assets ต้องสอดคล้องกัน โดยอ้างอิงแหล่งเวลาที่เชื่อถือได้",
        evidence: "NTP Configuration | Time Sync Policy",
        regulatoryNote: "สำคัญสำหรับ Audit Trail ของระบบ E-Insurance",
      },
      {
        id: "6.24", clause: "๖.๒๔", control: "Segregation of Duties",
        requirement: "มีการแบ่งแยกหน้าที่และขอบเขตความรับผิดชอบชัดเจน เพื่อลดความผิดพลาด",
        evidence: "RACI Matrix | Access Rights Matrix แสดง SoD | SoD Policy",
        regulatoryNote: "",
      },
      {
        id: "6.25", clause: "๖.๒๕", control: "แยก Dev/Test/Production Environment",
        requirement: "แยกระบบสำหรับ Dev, Test, Production ออกจากกัน ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต",
        evidence: "Environment Separation Policy | Network Diagram แสดงการแยก Environment",
        regulatoryNote: "ห้ามใช้ข้อมูลกรมธรรม์จริงใน Dev/Test",
      },
      {
        id: "6.26", clause: "๖.๒๖", control: "Change Management — Service/Policy/Control",
        requirement: "บริหารจัดการการเปลี่ยนแปลง Service/Policy/Control โดยคำนึงถึงความเสี่ยง",
        evidence: "Change Management Procedure | Service Change Log",
        regulatoryNote: "",
      },
      {
        id: "6.27", clause: "๖.๒๗", control: "Mobile Code Control",
        requirement: "กำหนดการใช้งาน Mobile Code (Script) ในระบบสารสนเทศให้ปลอดภัย",
        evidence: "Mobile Code Policy | Web Application Security Configuration",
        regulatoryNote: "",
      },
      {
        id: "6.28", clause: "๖.๒๘", control: "Removable Media Management",
        requirement: "ขั้นตอนการบริหารจัดการ Removable Media (USB, HDD, SSD)",
        evidence: "Removable Media Policy | Endpoint DLP Configuration",
        regulatoryNote: "",
      },
      {
        id: "6.29", clause: "๖.๒๙", control: "ทำลาย Removable Media อย่างปลอดภัย",
        requirement: "ขั้นตอนการทำลาย Removable Media อย่างปลอดภัย",
        evidence: "Media Destruction Procedure | Destruction Log",
        regulatoryNote: "",
      },
      {
        id: "6.30", clause: "๖.๓๐", control: "ป้องกัน System Documentation",
        requirement: "ป้องกัน System Documentation จากการเข้าถึงโดยไม่ได้รับอนุญาต",
        evidence: "Access Control List สำหรับ Documentation Repository",
        regulatoryNote: "",
      },
      {
        id: "6.31", clause: "๖.๓๑", control: "ป้องกันอุปกรณ์จัดเก็บข้อมูลระหว่างเคลื่อนย้าย",
        requirement: "ป้องกันอุปกรณ์จัดเก็บข้อมูลระหว่างการเคลื่อนย้าย ป้องกันการเข้าถึงหรือความเสียหาย",
        evidence: "Equipment Transit Policy | Chain of Custody Form",
        regulatoryNote: "",
      },
      {
        id: "6.32", clause: "๖.๓๒", control: "ป้องกันข้อมูลผ่าน Electronic Messaging",
        requirement: "ป้องกันข้อมูลที่สื่อสารผ่าน Electronic Messaging (Email/EDI/IM)",
        evidence: "Email Security Policy | Email Gateway Configuration | Encryption Policy",
        regulatoryNote: "",
      },
    ],
  },

  // ─── หมวดที่ ๗ ───────────────────────────────────────────────────────────────
  {
    id: "s7", code: "๗", theme: "access", themeLabel: "Access",
    title: "การควบคุมการเข้าถึงระบบสารสนเทศ",
    items: [
      {
        id: "7.1", clause: "๗.๑", control: "Access Control Policy",
        requirement: "จัดให้มีนโยบายควบคุมการเข้าถึง เป็นเอกสาร ทบทวนให้สอดคล้องกับ IT Security",
        evidence: "Access Control Policy ที่เป็นปัจจุบัน | บันทึกการทบทวน",
        regulatoryNote: "",
      },
      {
        id: "7.2", clause: "๗.๒", control: "User Account Registration/Termination",
        requirement: "ลงทะเบียนและยกเลิกบัญชีผู้ใช้งานอย่างเป็นทางการ เพื่อควบคุมการให้/ยกเลิกสิทธิ์",
        evidence: "User Account Management Procedure | User Registration & Termination Form",
        regulatoryNote: "",
      },
      {
        id: "7.3", clause: "๗.๓", control: "Privileged Access Management",
        requirement: "การกำหนดสิทธิ์ระดับสูง ให้ทำอย่างจำกัดและอยู่ภายใต้การควบคุม",
        evidence: "Privileged Account List | PAM Policy | Privileged Access Review",
        regulatoryNote: "Admin บน E-Insurance System ต้องมีการ Review ทุก 6 เดือน",
      },
      {
        id: "7.4", clause: "๗.๔", control: "ป้องกันอุปกรณ์เมื่อไม่ใช้งาน",
        requirement: "ผู้ใช้งานต้องดูแลป้องกันอุปกรณ์ที่อยู่ในความรับผิดชอบเมื่อไม่มีการใช้งาน",
        evidence: "Clear Screen Policy | Screen Lock Configuration Screenshot",
        regulatoryNote: "",
      },
      {
        id: "7.5", clause: "๗.๕", control: "จำกัดการเข้าถึง Network จากภายนอก",
        requirement: "จำกัดการเข้าถึงเครือข่ายที่เข้าถึงได้จากภายนอก สอดคล้องนโยบาย Access Control",
        evidence: "Firewall Rule Set | Network Access Control Policy | VPN Policy",
        regulatoryNote: "",
      },
      {
        id: "7.6", clause: "๗.๖", control: "Individual User Accounts + Authentication",
        requirement: "ผู้ใช้งานทุกคนมีบัญชีของตัวเอง ระบบมีเทคนิคตรวจสอบตัวตนที่เพียงพอ",
        evidence: "User Account List | Authentication Policy | MFA Configuration",
        regulatoryNote: "คปภ. กำหนดให้ใช้ MFA สำหรับระบบ E-Insurance",
      },
      {
        id: "7.7", clause: "๗.๗", control: "Auto-Lock / Session Timeout",
        requirement: "ยุติหรือปิดหน้าจอโดยอัตโนมัติหากไม่มีการใช้งานเกินระยะเวลาที่กำหนด",
        evidence: "Screen Lock/Session Timeout Configuration Screenshot",
        regulatoryNote: "",
      },
      {
        id: "7.8", clause: "๗.๘", control: "Role-Based Access Control (RBAC)",
        requirement: "จำกัดการเข้าถึงข้อมูลและฟังก์ชันใน Application ตามนโยบาย Access Control",
        evidence: "RBAC Configuration | Access Matrix | Role Definition",
        regulatoryNote: "",
      },
      {
        id: "7.9", clause: "๗.๙", control: "Mobile Device / Laptop Security",
        requirement: "นโยบายและแนวทางการจัดการด้าน IT Security สำหรับ Mobile Device / Laptop",
        evidence: "MDM Policy | BYOD Policy | Mobile Device Security Configuration",
        regulatoryNote: "",
      },
      {
        id: "7.10", clause: "๗.๑๐", control: "Password Policy",
        requirement: "บังคับให้ผู้ใช้ปฏิบัติตามขั้นตอนการเลือกใช้รหัสผ่านอย่างปลอดภัย",
        evidence: "Password Policy (ความยาว ≥12 ตัว ตัวพิมพ์ใหญ่+เล็ก+ตัวเลข+อักขระพิเศษ) | Config Screenshot",
        regulatoryNote: "",
      },
      {
        id: "7.11", clause: "๗.๑๑", control: "Network Service Access Control",
        requirement: "ผู้ใช้งานเข้าถึงเฉพาะ Network Service ที่ได้รับอนุญาต",
        evidence: "Network Access Control List | Firewall/VLAN Configuration",
        regulatoryNote: "",
      },
      {
        id: "7.12", clause: "๗.๑๒", control: "Remote Access Authentication",
        requirement: "กำหนดวิธีตรวจสอบตัวตนสำหรับควบคุมการเข้าถึงระบบจากระยะไกล",
        evidence: "Remote Access Policy | VPN/MFA Configuration",
        regulatoryNote: "",
      },
      {
        id: "7.13", clause: "๗.๑๓", control: "Remote Diagnostic / Configuration Control",
        requirement: "ควบคุมช่องทาง Remote Diagnostic / Configuration สำหรับอุปกรณ์เครือข่าย",
        evidence: "Remote Access Audit Log | Privileged Remote Access Policy",
        regulatoryNote: "",
      },
      {
        id: "7.14", clause: "๗.๑๔", control: "Network Segmentation",
        requirement: "จัดกลุ่มตามประเภทข้อมูล/ระบบ/ผู้ใช้ มีการแบ่งแยกบนเครือข่าย",
        evidence: "Network Diagram | VLAN Configuration | Network Segmentation Design",
        regulatoryNote: "E-Insurance System ควรอยู่ใน Segment ที่แยกจาก Internal Network",
      },
      {
        id: "7.15", clause: "๗.๑๕", control: "Network Traffic Flow Control",
        requirement: "ควบคุมเส้นทาง Traffic ใน Network ไม่ให้ขัดนโยบาย Access Control ของ Application",
        evidence: "Network Traffic Policy | Firewall Rule Review",
        regulatoryNote: "",
      },
      {
        id: "7.16", clause: "๗.๑๖", control: "Secure Log-on Procedure",
        requirement: "กำหนดขั้นตอน Log-on เพื่อควบคุมการเข้าถึงระบบปฏิบัติการ",
        evidence: "OS Login Policy | Account Lockout Policy (≤5 ครั้ง) | Configuration",
        regulatoryNote: "",
      },
      {
        id: "7.17", clause: "๗.๑๗", control: "Password Management System",
        requirement: "จัดให้มีระบบบริหารจัดการรหัสผ่านแบบ Interactive รองรับรหัสผ่านที่ปลอดภัย",
        evidence: "Password Management Tool | Password Reset Procedure",
        regulatoryNote: "",
      },
      {
        id: "7.18", clause: "๗.๑๘", control: "Password Assignment Procedure",
        requirement: "ขั้นตอนการบริหารจัดการการกำหนดรหัสผ่านอย่างเป็นทางการ",
        evidence: "Password Management Procedure | Initial Password Policy",
        regulatoryNote: "",
      },
      {
        id: "7.19", clause: "๗.๑๙", control: "User Access Review",
        requirement: "ผู้บริหารทบทวนระดับสิทธิ์การเข้าถึงของผู้ใช้งานอย่างเป็นทางการเป็นประจำ",
        evidence: "Access Review Report (Quarterly/Semi-annual) | User Access Recertification Log",
        regulatoryNote: "ตรวจสอบอย่างน้อยทุก 6 เดือน",
      },
      {
        id: "7.20", clause: "๗.๒๐", control: "Clear Desk / Clear Screen Policy",
        requirement: "นโยบาย Clear Desk สำหรับข้อมูลกระดาษ และ Clear Screen สำหรับระบบสารสนเทศ",
        evidence: "Clear Desk & Clear Screen Policy | ตัวอย่างการประกาศ",
        regulatoryNote: "",
      },
      {
        id: "7.21", clause: "๗.๒๑", control: "Network Access Control (NAC)",
        requirement: "ระบุอุปกรณ์ที่เชื่อมต่อโดยอัตโนมัติ เพื่อรับเฉพาะอุปกรณ์ที่ได้รับอนุญาต",
        evidence: "NAC Policy | Device Registration List",
        regulatoryNote: "",
      },
      {
        id: "7.22", clause: "๗.๒๒", control: "จำกัดการเข้าถึง Utility Programs",
        requirement: "จำกัดการเข้าถึง Utility Program ที่สามารถควบคุม/เปลี่ยนแปลงระบบอย่างเข้มงวด",
        evidence: "Privileged Tool Access Policy | Approved Software List",
        regulatoryNote: "",
      },
      {
        id: "7.23", clause: "๗.๒๓", control: "Connection Time Limit",
        requirement: "จำกัดระยะเวลาเชื่อมต่อกับระบบที่มีความเสี่ยงสูง",
        evidence: "Connection Time-out Policy | Session Duration Policy Configuration",
        regulatoryNote: "",
      },
      {
        id: "7.24", clause: "๗.๒๔", control: "Isolated Environment สำหรับระบบสำคัญ",
        requirement: "สำหรับระบบสำคัญสูง ต้องทำงานในสภาพแวดล้อมที่แยกออกมาต่างหาก",
        evidence: "Architecture Diagram แสดง Isolated Environment | Security Zoning",
        regulatoryNote: "ระบบ E-Insurance ถือเป็นระบบสำคัญสูง",
      },
      {
        id: "7.25", clause: "๗.๒๕", control: "Teleworking Policy",
        requirement: "กำหนดนโยบาย แผน และขั้นตอนสำหรับ Teleworking",
        evidence: "Teleworking / Remote Work Policy | Secure Remote Access Guideline",
        regulatoryNote: "",
      },
    ],
  },

  // ─── หมวดที่ ๘ ───────────────────────────────────────────────────────────────
  {
    id: "s8", code: "๘", theme: "development", themeLabel: "Development",
    title: "การจัดหา/พัฒนา และบำรุงรักษาระบบสารสนเทศ",
    items: [
      {
        id: "8.1", clause: "๘.๑", control: "Security Requirements ใน TOR/Spec",
        requirement: "ในการจัดทำ TOR ระบบใหม่/ปรับปรุง ให้ระบุข้อกำหนด IT Security ไว้ด้วย",
        evidence: "Security Requirements Specification | TOR ที่มีข้อกำหนด IT Security",
        regulatoryNote: "รวมถึง E-Insurance System",
      },
      {
        id: "8.2", clause: "๘.๒", control: "ควบคุมการจ้างช่วงพัฒนาซอฟต์แวร์",
        requirement: "ดูแล ควบคุม ติดตามตรวจสอบการทำงานในการจ้างช่วงพัฒนาซอฟต์แวร์",
        evidence: "Outsource Development Contract | Code Review Record | Vendor Assessment",
        regulatoryNote: "",
      },
      {
        id: "8.3", clause: "๘.๓", control: "Input Validation",
        requirement: "ตรวจสอบ (Validate) ข้อมูลที่รับเข้า Application ก่อนเสมอ",
        evidence: "Input Validation Design | SAST Report แสดง Input Validation Controls",
        regulatoryNote: "ป้องกัน SQL Injection, XSS ตาม OWASP Top 10",
      },
      {
        id: "8.4", clause: "๘.๔", control: "Output Validation",
        requirement: "ตรวจสอบ (Validate) ผลลัพธ์จากการประมวลผลของ Application",
        evidence: "Output Validation Design | Test Case ที่ครอบคลุม Output Validation",
        regulatoryNote: "",
      },
      {
        id: "8.5", clause: "๘.๕", control: "Key Management",
        requirement: "จัดให้มีแนวทางบริหารจัดการกุญแจ (Key) สำหรับเทคนิคเข้ารหัสลับ",
        evidence: "Key Management Policy | Key Lifecycle Procedure | HSM Configuration",
        regulatoryNote: "",
      },
      {
        id: "8.6", clause: "๘.๖", control: "Test Data Management",
        requirement: "เลือกข้อมูลทดสอบอย่างระมัดระวัง มีแนวทางป้องกันข้อมูลรั่วไหล",
        evidence: "Test Data Management Policy | บันทึกการ Mask/Anonymize Test Data",
        regulatoryNote: "ห้ามใช้ข้อมูลกรมธรรม์จริงในการทดสอบ",
      },
      {
        id: "8.7", clause: "๘.๗", control: "Source Code Access Control",
        requirement: "จำกัดการเข้าถึง Source Code ของโปรแกรม",
        evidence: "Source Code Repository Access Control | Code Repository Policy",
        regulatoryNote: "",
      },
      {
        id: "8.8", clause: "๘.๘", control: "ทบทวนโปรแกรมหลังเปลี่ยน OS",
        requirement: "เมื่อเปลี่ยน OS ให้ตรวจสอบโปรแกรมสำคัญ และทดสอบว่าไม่กระทบ IT Security",
        evidence: "OS Change Impact Assessment | Regression Test Report",
        regulatoryNote: "",
      },
      {
        id: "8.9", clause: "๘.๙", control: "Application Error Validation",
        requirement: "ตรวจสอบการทำงานของ Application เพื่อหาข้อผิดพลาดของข้อมูล",
        evidence: "Application Testing Report | Bug Tracking System",
        regulatoryNote: "",
      },
      {
        id: "8.10", clause: "๘.๑๐", control: "Data Integrity / Authenticity",
        requirement: "ข้อกำหนดขั้นต่ำสำหรับ Integrity / Authenticity ของข้อมูลใน Application",
        evidence: "Application Security Design | Digital Signature | Checksum Policy",
        regulatoryNote: "สำคัญสำหรับกรมธรรม์อิเล็กทรอนิกส์",
      },
      {
        id: "8.11", clause: "๘.๑๑", control: "Cryptography Policy",
        requirement: "นโยบายการใช้งานเทคนิคเข้ารหัสลับ",
        evidence: "Cryptography Policy | Approved Algorithm List (TLS 1.2+, AES-256 ฯลฯ)",
        regulatoryNote: "คปภ. กำหนดให้ใช้ TLS 1.2 ขึ้นไปสำหรับ E-Insurance",
      },
      {
        id: "8.12", clause: "๘.๑๒", control: "Software Installation Control",
        requirement: "ขั้นตอนการปฏิบัติงานควบคุมการติดตั้งซอฟต์แวร์บนระบบ Production",
        evidence: "Software Installation Policy | Approved Software List | Change Log",
        regulatoryNote: "",
      },
      {
        id: "8.13", clause: "๘.๑๓", control: "Software Change Control",
        requirement: "ควบคุมการเปลี่ยนแปลงในการพัฒนาระบบ โดยมีขั้นตอนการควบคุมเป็นทางการ",
        evidence: "Software Change Control Procedure | Version Control Log",
        regulatoryNote: "",
      },
      {
        id: "8.14", clause: "๘.๑๔", control: "Software Package Change Control",
        requirement: "จำกัดการเปลี่ยนแปลง Software Package เฉพาะที่จำเป็น ควบคุมอย่างเข้มงวด",
        evidence: "Software Configuration Management Policy | Change Justification Record",
        regulatoryNote: "",
      },
      {
        id: "8.15", clause: "๘.๑๕", control: "DLP — ป้องกันข้อมูลรั่วไหล",
        requirement: "มาตรการป้องกันการรั่วไหลของข้อมูล",
        evidence: "DLP Policy & Configuration | DLP Incident Report",
        regulatoryNote: "สำคัญสำหรับข้อมูลกรมธรรม์และข้อมูลส่วนบุคคล",
      },
    ],
  },

  // ─── หมวดที่ ๙ ───────────────────────────────────────────────────────────────
  {
    id: "s9", code: "๙", theme: "incident", themeLabel: "Incident",
    title: "การบริหารจัดการสถานการณ์ความมั่นคงปลอดภัยที่ไม่พึงประสงค์",
    items: [
      {
        id: "9.1", clause: "๙.๑", control: "Incident Reporting Procedure",
        requirement: "รายงานสถานการณ์ IT Security ที่ไม่พึงประสงค์ผ่านช่องทางที่เหมาะสมโดยเร็ว",
        evidence: "Incident Reporting Procedure | Incident Reporting Form | ตัวอย่าง Incident Log",
        regulatoryNote: "ต้องแจ้ง คปภ. ตามเกณฑ์ที่กำหนด",
      },
      {
        id: "9.2", clause: "๙.๒", control: "Vulnerability Reporting Channel",
        requirement: "กำหนดให้พนักงาน/Outsource บันทึกและรายงานจุดอ่อนที่สังเกตพบ",
        evidence: "Vulnerability Reporting Channel | ตัวอย่าง Vulnerability Report จากพนักงาน",
        regulatoryNote: "",
      },
      {
        id: "9.3", clause: "๙.๓", control: "Incident Response Plan (IRP)",
        requirement: "กำหนดขอบเขตความรับผิดชอบและขั้นตอน Response ต่อสถานการณ์ IT Security อย่างรวดเร็ว",
        evidence: "IRP ที่เป็นปัจจุบัน | Escalation Matrix | IRP Test/Drill Record (ประจำปี)",
        regulatoryNote: "คปภ. กำหนดให้ทำ Cyber Drill อย่างน้อยปีละ 1 ครั้ง",
      },
      {
        id: "9.4", clause: "๙.๔", control: "Digital Forensics / Evidence Collection",
        requirement: "รวบรวม จัดเก็บ และนำเสนอหลักฐาน สอดคล้องกับหลักเกณฑ์กฎหมาย",
        evidence: "Digital Forensics Procedure | Evidence Collection Procedure | Chain of Custody Form",
        regulatoryNote: "รองรับการดำเนินการทางกฎหมาย",
      },
    ],
  },

  // ─── หมวดที่ ๑๐ ──────────────────────────────────────────────────────────────
  {
    id: "s10", code: "๑๐", theme: "bcp", themeLabel: "BCP/DR",
    title: "การบริหารจัดการด้านการบริการให้มีความต่อเนื่อง",
    items: [
      {
        id: "10.1", clause: "๑๐.๑", control: "Disaster Recovery Plan (DRP)",
        requirement: "กำหนดแผนกู้คืนการให้บริการสารสนเทศหลังเกิดเหตุ ให้ระบบพร้อมใช้งานตามเวลาที่กำหนด",
        evidence: "BCP / DRP ที่เป็นปัจจุบัน | RTO/RPO Definition",
        regulatoryNote: "คปภ. กำหนด RTO สำหรับระบบ E-Insurance",
      },
      {
        id: "10.2", clause: "๑๐.๒", control: "IT Security ในแผน BCP",
        requirement: "กำหนดข้อกำหนด IT Security ที่จำเป็นเป็นส่วนหนึ่งของขั้นตอน BCP",
        evidence: "BCP ที่ระบุข้อกำหนด IT Security | Security in BCP Section",
        regulatoryNote: "",
      },
      {
        id: "10.3", clause: "๑๐.๓", control: "BCP Framework",
        requirement: "กำหนดกรอบงานหลักสำหรับพัฒนาแผน BCP ให้เป็นทิศทางเดียวกัน",
        evidence: "BCP Framework | BIA (Business Impact Analysis) Report",
        regulatoryNote: "",
      },
      {
        id: "10.4", clause: "๑๐.๔", control: "BCP/DRP Testing",
        requirement: "ทดสอบและปรับปรุงแผน BCP/DRP อย่างสม่ำเสมอ เพื่อให้เป็นปัจจุบันและมีประสิทธิผล",
        evidence: "BCP/DRP Test Plan & Report | After Action Review | DR Failover Test Record",
        regulatoryNote: "ต้องทดสอบอย่างน้อยปีละ 1 ครั้ง",
      },
      {
        id: "10.5", clause: "๑๐.๕", control: "Business Impact Analysis (BIA)",
        requirement: "ระบุเหตุการณ์ที่อาจส่งผลให้หยุดชะงัก และความเป็นไปได้ของผลกระทบ",
        evidence: "BIA Report | Risk Register | Threat & Vulnerability Assessment",
        regulatoryNote: "",
      },
    ],
  },

  // ─── หมวดที่ ๑๑ ──────────────────────────────────────────────────────────────
  {
    id: "s11", code: "๑๑", theme: "compliance", themeLabel: "Compliance",
    title: "การตรวจสอบและการประเมินผลการปฏิบัติตามนโยบาย/ข้อกำหนด",
    items: [
      {
        id: "11.1", clause: "๑๑.๑", control: "Legal & Regulatory Compliance Register",
        requirement: "ระบุแนวทางดำเนินงานที่สอดคล้องกฎหมาย/สัญญา เป็นเอกสาร และปรับปรุงเสมอ",
        evidence: "Compliance Register | สรุปกฎหมายที่เกี่ยวข้อง (PDPA, ประกาศ คปภ., พ.ร.บ.คอมพิวเตอร์)",
        regulatoryNote: "",
      },
      {
        id: "11.2", clause: "๑๑.๒", control: "ป้องกันการใช้ระบบผิดวัตถุประสงค์",
        requirement: "ป้องกันมิให้มีการใช้งานระบบสารสนเทศผิดวัตถุประสงค์",
        evidence: "Acceptable Use Policy (AUP) | IT Usage Policy",
        regulatoryNote: "",
      },
      {
        id: "11.3", clause: "๑๑.๓", control: "พนักงานปฏิบัติตามกฎหมาย/สัญญา",
        requirement: "พนักงานดำเนินงาน IT Security ตามกฎหมายและข้อกำหนดตามสัญญา",
        evidence: "Internal Audit Report | Compliance Checklist ของแต่ละหน่วยงาน",
        regulatoryNote: "",
      },
      {
        id: "11.4", clause: "๑๑.๔", control: "PDPA Compliance",
        requirement: "คุ้มครองข้อมูลส่วนบุคคลสอดคล้องกับกฎหมาย PDPA และสัญญา",
        evidence: "PDPA Compliance Report | PIA | ROPA | DPA กับ Processor | DPO Appointment",
        regulatoryNote: "ข้อมูลลูกค้าประกันภัยเป็น Personal Data ตาม PDPA",
      },
      {
        id: "11.5", clause: "๑๑.๕", control: "Cryptography Compliance",
        requirement: "ใช้เทคนิคเข้ารหัสลับสอดคล้องกับกฎหมายและข้อกำหนดตามสัญญา",
        evidence: "Cryptography Policy | Legal Compliance for Encryption",
        regulatoryNote: "",
      },
      {
        id: "11.6", clause: "๑๑.๖", control: "Technical Security Review / Penetration Test",
        requirement: "ทบทวนระบบสารสนเทศด้านเทคนิคตามมาตรฐาน IT Security อย่างสม่ำเสมอ",
        evidence: "Penetration Test Report (ประจำปี) | Vulnerability Assessment | Internal Audit Report",
        regulatoryNote: "คปภ. กำหนดให้ทำ Pentest Web Application ประจำปี",
      },
      {
        id: "11.7", clause: "๑๑.๗", control: "IT Audit Plan",
        requirement: "วางแผนและกำหนดข้อกำหนดการตรวจสอบระบบ เพื่อลดความเสี่ยงต่อ Service",
        evidence: "IT Audit Plan | Audit Schedule | Audit Charter",
        regulatoryNote: "",
      },
      {
        id: "11.8", clause: "๑๑.๘", control: "ป้องกันการใช้ Audit Tool ผิดประเภท",
        requirement: "ป้องกันการเข้าใช้งานเครื่องมือตรวจสอบ ป้องกันการใช้ผิดประเภท",
        evidence: "Audit Tool Access Control Policy | บัญชีผู้มีสิทธิ์ใช้ Audit Tool",
        regulatoryNote: "",
      },
      {
        id: "11.9", clause: "๑๑.๙", control: "Software License Compliance",
        requirement: "ใช้งาน Intellectual Property / Software ถูกกฎหมาย",
        evidence: "Software License List | SAM (Software Asset Management) Report",
        regulatoryNote: "",
      },
      {
        id: "11.10", clause: "๑๑.๑๐", control: "ป้องกันข้อมูลสำคัญจากความเสียหาย/ปลอมแปลง",
        requirement: "ป้องกันมิให้ข้อมูลสำคัญเกิดความเสียหาย สูญหาย หรือถูกปลอมแปลง",
        evidence: "Data Protection Controls | Integrity Monitoring | Hash/Checksum Records",
        regulatoryNote: "สำคัญสำหรับข้อมูลกรมธรรม์และ Audit Trail",
      },
    ],
  },
]

export const TOTAL_ITEMS = SECTIONS.reduce((a, s) => a + s.items.length, 0)

export const THEME_CONFIG: Record<OW3Section["theme"], { label: string; color: string; bg: string; dot: string }> = {
  policy:      { label: "Policy",       color: "text-indigo-600",  bg: "bg-indigo-600",  dot: "bg-indigo-500"  },
  governance:  { label: "Governance",   color: "text-violet-600",  bg: "bg-violet-600",  dot: "bg-violet-500"  },
  asset:       { label: "Asset",        color: "text-amber-600",   bg: "bg-amber-500",   dot: "bg-amber-500"   },
  people:      { label: "People",       color: "text-rose-600",    bg: "bg-rose-600",    dot: "bg-rose-500"    },
  physical:    { label: "Physical",     color: "text-orange-600",  bg: "bg-orange-500",  dot: "bg-orange-500"  },
  operations:  { label: "Operations",   color: "text-blue-600",    bg: "bg-blue-600",    dot: "bg-blue-500"    },
  access:      { label: "Access Ctrl",  color: "text-teal-600",    bg: "bg-teal-600",    dot: "bg-teal-500"    },
  development: { label: "Development",  color: "text-cyan-600",    bg: "bg-cyan-600",    dot: "bg-cyan-500"    },
  incident:    { label: "Incident",     color: "text-red-600",     bg: "bg-red-500",     dot: "bg-red-500"     },
  bcp:         { label: "BCP/DR",       color: "text-green-600",   bg: "bg-green-600",   dot: "bg-green-500"   },
  compliance:  { label: "Compliance",   color: "text-slate-600",   bg: "bg-slate-600",   dot: "bg-slate-500"   },
}
