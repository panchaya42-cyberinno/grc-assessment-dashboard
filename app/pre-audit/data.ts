export type ResultType = "C" | "OFI" | "NC" | ""

export interface ChecklistItem {
  id: string
  clause: string
  question: string
  evidence: string
  result: ResultType
  finding: string
  carNo: string
}

export interface ChecklistDomain {
  id: string
  label: string
  shortLabel: string
  color: string
  items: Omit<ChecklistItem, "result" | "finding" | "carNo">[]
}

export const CHECKLIST_DOMAINS: ChecklistDomain[] = [
  {
    id: "framework",
    label: "ISMS Framework (Clauses 4–10)",
    shortLabel: "Framework",
    color: "violet",
    items: [
      { id: "4.1", clause: "4.1", question: "องค์กรได้วิเคราะห์บริบทภายในและภายนอก (SWOT/PESTEL) และนำมาพิจารณาในการกำหนดขอบเขต ISMS หรือไม่", evidence: "เอกสารการวิเคราะห์บริบท, SWOT Analysis" },
      { id: "4.2", clause: "4.2", question: "องค์กรได้ระบุผู้มีส่วนได้ส่วนเสีย (Interested Parties) และความต้องการที่เกี่ยวข้องกับ ISMS หรือไม่", evidence: "ทะเบียนผู้มีส่วนได้ส่วนเสีย, การวิเคราะห์ความต้องการ" },
      { id: "4.3", clause: "4.3", question: "ขอบเขต ISMS (ISMS Scope) ได้รับการกำหนด จัดทำเป็นเอกสาร และรวมถึง interface กับหน่วยงานภายนอกหรือไม่", evidence: "เอกสารขอบเขต ISMS, Network Diagram, Statement of Scope" },
      { id: "4.4", clause: "4.4", question: "องค์กรได้กำหนดและนำกระบวนการ ISMS ไปปฏิบัติอย่างครบถ้วนตาม ISO/IEC 27001:2022 หรือไม่", evidence: "ISMS Manual, Process Documentation, Internal Audit Records" },
      { id: "5.1", clause: "5.1", question: "ผู้บริหารระดับสูงแสดงออกถึงความมุ่งมั่น (Leadership Commitment) ต่อ ISMS โดยมีนโยบาย เป้าหมาย และการสนับสนุนทรัพยากรหรือไม่", evidence: "นโยบายความมั่นคงปลอดภัย, รายงานการประชุมผู้บริหาร, งบประมาณ" },
      { id: "5.2", clause: "5.2", question: "นโยบายความมั่นคงปลอดภัยสารสนเทศ (Information Security Policy) ได้รับการอนุมัติ สื่อสาร และทบทวนเป็นระยะหรือไม่", evidence: "Information Security Policy, บันทึกการสื่อสาร, การทบทวนล่าสุด" },
      { id: "5.3", clause: "5.3", question: "บทบาทและความรับผิดชอบด้าน ISMS ได้รับการกำหนด สื่อสาร และมอบหมายอย่างชัดเจนหรือไม่", evidence: "Job Description, แผนผังองค์กร, คำสั่งแต่งตั้ง ISMR" },
      { id: "6.1.1", clause: "6.1.1", question: "องค์กรได้กำหนดกระบวนการบริหารความเสี่ยงและโอกาส (Risk and Opportunity Framework) หรือไม่", evidence: "Risk Management Procedure, Risk Criteria" },
      { id: "6.1.2", clause: "6.1.2", question: "การประเมินความเสี่ยงด้านความมั่นคงปลอดภัย (Risk Assessment) ดำเนินการอย่างสม่ำเสมอและครอบคลุมทรัพย์สินทั้งหมดหรือไม่", evidence: "Risk Assessment Report, Asset Register, Risk Register" },
      { id: "6.1.3", clause: "6.1.3", question: "Statement of Applicability (SoA) ระบุการควบคุมที่นำมาใช้ พร้อมเหตุผลในการนำมาใช้หรือยกเว้นอย่างครบถ้วนหรือไม่", evidence: "Statement of Applicability (SoA) ฉบับปัจจุบัน พร้อม justification" },
      { id: "6.2", clause: "6.2", question: "เป้าหมายความมั่นคงปลอดภัยสารสนเทศ (ISMS Objectives) ครอบคลุม CIA Triad มีแผนปฏิบัติการและการติดตามผลหรือไม่", evidence: "ISMS Objectives, Action Plan, KPI Measurement Records" },
      { id: "6.3", clause: "6.3", question: "มีกระบวนการบริหารการเปลี่ยนแปลงที่ส่งผลต่อ ISMS อย่างมีแบบแผนหรือไม่", evidence: "Change Management Procedure, Change Request Log" },
      { id: "7.1", clause: "7.1", question: "องค์กรจัดสรรทรัพยากร (บุคลากร งบประมาณ เทคโนโลยี) เพียงพอสำหรับการดำเนินงาน ISMS หรือไม่", evidence: "แผนงบประมาณ, อัตรากำลัง IT/Security" },
      { id: "7.2", clause: "7.2", question: "บุคลากรที่เกี่ยวข้องกับ ISMS มีความสามารถ (Competence) เพียงพอ และมีบันทึกการพัฒนาศักยภาพหรือไม่", evidence: "Training Records, Certification, CV ผู้รับผิดชอบ ISMS" },
      { id: "7.3", clause: "7.3", question: "พนักงานทุกคนตระหนักถึง (Awareness) นโยบายความมั่นคงปลอดภัย บทบาทของตน และผลจากการไม่ปฏิบัติตามหรือไม่", evidence: "Training Records, Awareness Program, Quiz Results" },
      { id: "7.4", clause: "7.4", question: "แผนการสื่อสาร (Communication Plan) ครอบคลุมหัวข้อที่ ISMS กำหนด ได้แก่ ใคร เมื่อไร อย่างไร หรือไม่", evidence: "Communication Plan, Meeting Minutes, Internal Communications" },
      { id: "7.5", clause: "7.5", question: "เอกสารสารสนเทศ (Documented Information) ที่จำเป็นได้รับการควบคุม จัดเก็บ และป้องกันตาม Document Control Procedure หรือไม่", evidence: "Document Control Procedure (QP-DC-01), Document Register, DMS System" },
      { id: "8.1", clause: "8.1", question: "องค์กรได้วางแผน ดำเนินการ และควบคุมกระบวนการปฏิบัติงานด้าน ISMS ตามที่กำหนดหรือไม่", evidence: "Operational Procedures, SOP, Work Instructions" },
      { id: "8.2", clause: "8.2", question: "การประเมินความเสี่ยงด้านความมั่นคงปลอดภัยดำเนินการตามแผนและมีการบันทึกผลหรือไม่", evidence: "Risk Assessment Records (เป็นปัจจุบัน)" },
      { id: "8.3", clause: "8.3", question: "แผนการจัดการความเสี่ยง (Risk Treatment Plan) ได้รับการอนุมัติและนำไปปฏิบัติตามกำหนดเวลาหรือไม่", evidence: "Risk Treatment Plan, Implementation Evidence" },
      { id: "9.1", clause: "9.1", question: "มีการกำหนดตัวชี้วัด (KPI/KRI) ติดตามผลการดำเนินงาน ISMS และรายงานต่อผู้บริหารหรือไม่", evidence: "Monitoring & Measurement Plan, KPI Dashboard, Reports" },
      { id: "9.2", clause: "9.2", question: "การตรวจสอบภายใน (Internal Audit) ดำเนินการตามแผนและกำหนดการ มีผู้ตรวจที่ผ่านการอบรมหรือไม่", evidence: "Internal Audit Plan, Audit Schedule, Auditor Qualifications, Audit Reports" },
      { id: "9.3", clause: "9.3", question: "ผู้บริหารระดับสูงทบทวน ISMS (Management Review) อย่างน้อยปีละครั้ง โดยครอบคลุม Input ที่กำหนดหรือไม่", evidence: "Management Review Meeting Minutes, Review Outputs, Action Items" },
      { id: "10.1", clause: "10.1", question: "มีกระบวนการปรับปรุงอย่างต่อเนื่อง (Continual Improvement) โดยใช้ผลการตรวจสอบ วิเคราะห์ และ OFI หรือไม่", evidence: "Improvement Log, OFI Register, Trend Analysis" },
      { id: "10.2", clause: "10.2", question: "ข้อบกพร่อง (Nonconformity) ได้รับการแก้ไขตาม CAR Process มีการวิเคราะห์สาเหตุและป้องกันการเกิดซ้ำหรือไม่", evidence: "CAR Log, Root Cause Analysis, Corrective Action Evidence, Effectiveness Review" },
    ],
  },
  {
    id: "org",
    label: "Organizational Controls (A.5)",
    shortLabel: "A.5 Org",
    color: "blue",
    items: [
      { id: "A.5.1", clause: "A.5.1", question: "นโยบายความมั่นคงปลอดภัยและ Topic-specific Policies ได้รับการกำหนด อนุมัติ และควบคุมในระบบเอกสารหรือไม่", evidence: "Information Security Policy, Topic-specific Policies (ตามมาตรฐาน ISO 27002)" },
      { id: "A.5.2", clause: "A.5.2", question: "บทบาท ความรับผิดชอบ และอำนาจหน้าที่ด้านความมั่นคงปลอดภัยได้รับการกำหนดและมอบหมายหรือไม่", evidence: "RACI Matrix, Job Descriptions, คำสั่งแต่งตั้ง" },
      { id: "A.5.3", clause: "A.5.3", question: "มีการแบ่งแยกหน้าที่ (Segregation of Duties) ในงานที่มีความเสี่ยงสูงหรือไม่", evidence: "Role Matrix, Access Control Policy, Approval Workflows" },
      { id: "A.5.4", clause: "A.5.4", question: "ผู้บริหารส่งเสริมและกำกับให้พนักงานปฏิบัติตามนโยบายความมั่นคงปลอดภัยหรือไม่", evidence: "Management Directives, Performance Reviews, Disciplinary Procedures" },
      { id: "A.5.5", clause: "A.5.5", question: "มีการกำหนดผู้รับผิดชอบในการติดต่อหน่วยงานภาครัฐและหน่วยงานกำกับดูแลที่เกี่ยวข้องหรือไม่", evidence: "Contact List (NCSA, DSI, ETDA, ฯลฯ), Contact Procedure" },
      { id: "A.5.6", clause: "A.5.6", question: "องค์กรมีการเข้าร่วมกลุ่มความสนใจพิเศษด้านความมั่นคงปลอดภัย (เช่น ThaiCERT, ISACA, ISC2) หรือไม่", evidence: "Membership Records, Participation Evidence, Threat Intelligence Subscriptions" },
      { id: "A.5.7", clause: "A.5.7", question: "มีกระบวนการรวบรวมและวิเคราะห์ Threat Intelligence เพื่อใช้ในการบริหารความเสี่ยงหรือไม่", evidence: "Threat Intelligence Sources, Analysis Reports, Threat Register" },
      { id: "A.5.8", clause: "A.5.8", question: "ความมั่นคงปลอดภัยสารสนเทศถูกรวมเข้าในกระบวนการบริหารโครงการตั้งแต่เริ่มต้นหรือไม่", evidence: "Project Management Procedure, Security Checklist for Projects, SDLC Security Gates" },
      { id: "A.5.9", clause: "A.5.9", question: "ทะเบียนทรัพย์สิน (Asset Inventory) ครอบคลุมทุกประเภท ได้แก่ Hardware, Software, Data/Information, และบุคลากรหรือไม่", evidence: "Asset Register ที่เป็นปัจจุบัน ครอบคลุมทุกประเภท" },
      { id: "A.5.10", clause: "A.5.10", question: "มีนโยบายการใช้งานทรัพย์สินอย่างเหมาะสม (Acceptable Use Policy) และพนักงานรับทราบหรือไม่", evidence: "Acceptable Use Policy, User Acknowledgement Records" },
      { id: "A.5.11", clause: "A.5.11", question: "มีกระบวนการเรียกคืนทรัพย์สินเมื่อพนักงานลาออกหรือเปลี่ยนตำแหน่งหรือไม่", evidence: "Offboarding Checklist, Asset Return Records" },
      { id: "A.5.12", clause: "A.5.12", question: "มีการกำหนดระดับการจัดประเภทข้อมูล (Information Classification) เช่น Public, Internal, Confidential, Secret หรือไม่", evidence: "Information Classification Policy, Classification Scheme" },
      { id: "A.5.13", clause: "A.5.13", question: "เอกสารและข้อมูลได้รับการติดป้ายกำกับ (Labelling) ตามระดับการจัดประเภทหรือไม่", evidence: "ตัวอย่างเอกสารที่มีป้ายกำกับ, DRM/Metadata Settings" },
      { id: "A.5.14", clause: "A.5.14", question: "มีนโยบายและกระบวนการสำหรับการถ่ายโอนข้อมูล (Information Transfer) ทั้งภายในและภายนอกองค์กรหรือไม่", evidence: "Information Transfer Policy, NDA Templates, Secure Transfer Methods" },
      { id: "A.5.15", clause: "A.5.15", question: "นโยบายการควบคุมการเข้าถึง (Access Control Policy) ครอบคลุม Need-to-know และ Least Privilege หรือไม่", evidence: "Access Control Policy, User Access Matrix" },
      { id: "A.5.16", clause: "A.5.16", question: "มีกระบวนการบริหารจัดการ Identity (Identity Management) รวมถึงการสร้าง แก้ไข และยกเลิก Account หรือไม่", evidence: "Identity Management Procedure, User Account Records, IAM System" },
      { id: "A.5.17", clause: "A.5.17", question: "มีนโยบายการจัดการรหัสผ่านและ Authentication Information ที่เป็นไปตามมาตรฐานหรือไม่", evidence: "Password Policy, MFA Implementation Evidence" },
      { id: "A.5.18", clause: "A.5.18", question: "สิทธิ์การเข้าถึง (Access Rights) ได้รับการทบทวนอย่างสม่ำเสมอ (อย่างน้อยปีละครั้ง) หรือไม่", evidence: "Access Review Records, User Access Review Reports" },
      { id: "A.5.19", clause: "A.5.19", question: "มีนโยบายและกระบวนการบริหารความมั่นคงปลอดภัยในห่วงโซ่อุปทาน (Supplier Security) หรือไม่", evidence: "Supplier Security Policy, Vendor Risk Assessment" },
      { id: "A.5.20", clause: "A.5.20", question: "สัญญากับ Supplier ระบุข้อกำหนดด้านความมั่นคงปลอดภัยอย่างชัดเจนหรือไม่", evidence: "Supplier Agreements, NDA, Data Processing Agreements" },
      { id: "A.5.21", clause: "A.5.21", question: "มีการบริหารความเสี่ยงในห่วงโซ่อุปทาน ICT (ICT Supply Chain) รวมถึง Software/Hardware Suppliers หรือไม่", evidence: "ICT Supply Chain Policy, Approved Vendor List" },
      { id: "A.5.22", clause: "A.5.22", question: "มีการตรวจสอบและทบทวนบริการของ Supplier อย่างสม่ำเสมอ รวมถึงการเปลี่ยนแปลงบริการหรือไม่", evidence: "Supplier Review Records, Service Level Agreements, Change Notifications" },
      { id: "A.5.23", clause: "A.5.23", question: "มีนโยบายและกระบวนการสำหรับการใช้บริการ Cloud (Cloud Security) หรือไม่", evidence: "Cloud Security Policy, Cloud Service Agreements, Shared Responsibility Model" },
      { id: "A.5.24", clause: "A.5.24", question: "มีแผนและกระบวนการบริหารเหตุการณ์ความมั่นคงปลอดภัย (Incident Management Plan) หรือไม่", evidence: "Incident Management Plan, Incident Response Playbook" },
      { id: "A.5.25", clause: "A.5.25", question: "มีเกณฑ์ในการประเมินและตัดสินใจต่อเหตุการณ์ความมั่นคงปลอดภัย (Triage/Severity Assessment) หรือไม่", evidence: "Incident Classification Criteria, Severity Matrix" },
      { id: "A.5.26", clause: "A.5.26", question: "มีกระบวนการตอบสนองต่อเหตุการณ์ (Incident Response Procedure) ที่ครอบคลุม Containment, Eradication, Recovery หรือไม่", evidence: "Incident Response Procedure, Incident Response Team Contact List" },
      { id: "A.5.27", clause: "A.5.27", question: "มีการเรียนรู้จากเหตุการณ์ความมั่นคงปลอดภัย (Lessons Learned) และนำมาปรับปรุง ISMS หรือไม่", evidence: "Post-Incident Review Reports, Lessons Learned Log" },
      { id: "A.5.28", clause: "A.5.28", question: "มีกระบวนการรวบรวมหลักฐานดิจิทัล (Digital Forensics/Evidence Collection) อย่างถูกต้องหรือไม่", evidence: "Evidence Collection Procedure, Chain of Custody Records" },
      { id: "A.5.29", clause: "A.5.29", question: "มีแผนรักษาความมั่นคงปลอดภัยสารสนเทศในช่วงวิกฤต (Business Continuity) หรือไม่", evidence: "BCP/DRP Documents, Information Security during Disruption Plan" },
      { id: "A.5.30", clause: "A.5.30", question: "ระบบ ICT สามารถรองรับความต่อเนื่องทางธุรกิจ (ICT Readiness for Business Continuity) ได้หรือไม่", evidence: "ICT Continuity Plan, RTO/RPO Targets, DR Test Records" },
      { id: "A.5.31", clause: "A.5.31", question: "มีการระบุและปฏิบัติตามข้อกำหนดทางกฎหมาย ระเบียบ และสัญญาที่เกี่ยวข้อง (Legal & Regulatory Compliance) หรือไม่", evidence: "Legal Requirements Register (PDPA, NCSA, ฯลฯ), Compliance Checklist" },
      { id: "A.5.32", clause: "A.5.32", question: "มีมาตรการคุ้มครองทรัพย์สินทางปัญญา (Intellectual Property Rights) หรือไม่", evidence: "IP Policy, Software License Register, License Audit Records" },
      { id: "A.5.33", clause: "A.5.33", question: "มีการคุ้มครองบันทึกสำคัญ (Protection of Records) รวมถึงการกำหนดอายุการเก็บรักษาหรือไม่", evidence: "Records Retention Policy, Records Register" },
      { id: "A.5.34", clause: "A.5.34", question: "มีมาตรการคุ้มครองข้อมูลส่วนบุคคล (Privacy/PII Protection) สอดคล้องกับ PDPA หรือไม่", evidence: "Privacy Policy, PDPA Compliance Documents, DPIA, ROPA" },
      { id: "A.5.35", clause: "A.5.35", question: "มีการทบทวนความมั่นคงปลอดภัยอย่างเป็นอิสระ (Independent Review) เช่น Internal Audit หรือ External Audit หรือไม่", evidence: "Internal Audit Program, External Audit Reports" },
      { id: "A.5.36", clause: "A.5.36", question: "มีการตรวจสอบการปฏิบัติตามนโยบายและมาตรฐาน ISMS อย่างสม่ำเสมอหรือไม่", evidence: "Compliance Review Records, Self-Assessment Results" },
      { id: "A.5.37", clause: "A.5.37", question: "ขั้นตอนการปฏิบัติงาน (Operating Procedures) สำหรับสิ่งอำนวยความสะดวกด้านเทคโนโลยีสารสนเทศได้รับการจัดทำเป็นเอกสารหรือไม่", evidence: "IT Operations Procedures, System Administration Guides, Runbooks" },
    ],
  },
  {
    id: "people",
    label: "People Controls (A.6)",
    shortLabel: "A.6 People",
    color: "green",
    items: [
      { id: "A.6.1", clause: "A.6.1", question: "มีกระบวนการตรวจสอบประวัติ (Background Screening) พนักงานใหม่ก่อนการจ้างงานหรือไม่", evidence: "Screening Policy, Background Check Records, Criminal Record Verification" },
      { id: "A.6.2", clause: "A.6.2", question: "สัญญาจ้างงานระบุข้อผูกพันด้านความมั่นคงปลอดภัยสารสนเทศและนโยบายขององค์กรหรือไม่", evidence: "Employment Contracts, Confidentiality Agreements, Signed Policies" },
      { id: "A.6.3", clause: "A.6.3", question: "มีโปรแกรมการอบรมและสร้างความตระหนักด้านความมั่นคงปลอดภัย (Security Awareness Training) สำหรับพนักงานทุกคนหรือไม่", evidence: "Training Program, Training Records, Awareness Test Results" },
      { id: "A.6.4", clause: "A.6.4", question: "มีกระบวนการทางวินัย (Disciplinary Process) สำหรับพนักงานที่ฝ่าฝืนนโยบายความมั่นคงปลอดภัยหรือไม่", evidence: "Disciplinary Policy, HR Procedure, Documented Cases (ถ้ามี)" },
      { id: "A.6.5", clause: "A.6.5", question: "มีกระบวนการที่ชัดเจนสำหรับการโอนย้ายหรือสิ้นสุดการจ้างงาน เช่น การคืนอุปกรณ์ การยกเลิกสิทธิ์เข้าถึงหรือไม่", evidence: "Offboarding Procedure, Account Termination Checklist, Asset Return Records" },
      { id: "A.6.6", clause: "A.6.6", question: "บุคคลภายนอกที่เข้าถึงข้อมูลขององค์กรได้ลงนามในสัญญาการรักษาความลับ (NDA/Confidentiality Agreement) หรือไม่", evidence: "NDA Templates, Signed NDAs, Contractor Agreements" },
      { id: "A.6.7", clause: "A.6.7", question: "มีนโยบายและมาตรการควบคุมสำหรับการทำงานระยะไกล (Remote Working/Telework) หรือไม่", evidence: "Remote Working Policy, VPN Usage, Endpoint Security Controls" },
      { id: "A.6.8", clause: "A.6.8", question: "มีช่องทางและกระบวนการที่ชัดเจนสำหรับพนักงานในการรายงานเหตุการณ์ความมั่นคงปลอดภัย (Event Reporting) หรือไม่", evidence: "Incident Reporting Procedure, Reporting Channels, Reporting Training Records" },
    ],
  },
  {
    id: "physical",
    label: "Physical Controls (A.7)",
    shortLabel: "A.7 Physical",
    color: "amber",
    items: [
      { id: "A.7.1", clause: "A.7.1", question: "มีการกำหนดพื้นที่ปลอดภัย (Security Perimeter) อย่างชัดเจน พร้อมมาตรการควบคุมการเข้าออกหรือไม่", evidence: "Physical Security Plan, Perimeter Definition, Access Control Records" },
      { id: "A.7.2", clause: "A.7.2", question: "การเข้าถึงพื้นที่ปลอดภัย (Physical Entry) ถูกควบคุมและบันทึกอย่างเหมาะสมหรือไม่", evidence: "Access Log, Visitor Register, Badge System Records" },
      { id: "A.7.3", clause: "A.7.3", question: "ห้องทำงาน ห้อง Server และพื้นที่ที่มีความอ่อนไหวได้รับการรักษาความปลอดภัยทางกายภาพอย่างเหมาะสมหรือไม่", evidence: "Physical Security Assessment, Lock Records, CCTV Coverage" },
      { id: "A.7.4", clause: "A.7.4", question: "มีระบบเฝ้าระวังทางกายภาพ (Physical Security Monitoring) เช่น CCTV, การลาดตระเวน หรือไม่", evidence: "CCTV System, Monitoring Records, Security Guard Log" },
      { id: "A.7.5", clause: "A.7.5", question: "มีมาตรการป้องกันภัยคุกคามทางกายภาพและสิ่งแวดล้อม เช่น ไฟไหม้ น้ำท่วม แผ่นดินไหว หรือไม่", evidence: "Fire Suppression System, Flood Barrier, Environmental Monitoring" },
      { id: "A.7.6", clause: "A.7.6", question: "มีข้อกำหนดและมาตรการสำหรับการทำงานในพื้นที่ปลอดภัย (Secure Areas) หรือไม่", evidence: "Secure Area Policy, Work Rules for Secure Areas" },
      { id: "A.7.7", clause: "A.7.7", question: "มีนโยบาย Clear Desk และ Clear Screen และปฏิบัติตามอย่างสม่ำเสมอหรือไม่", evidence: "Clear Desk/Screen Policy, Spot Check Records, Screen Lock Settings" },
      { id: "A.7.8", clause: "A.7.8", question: "อุปกรณ์ ICT ได้รับการติดตั้งในตำแหน่งที่ปลอดภัย ห่างจากความเสี่ยงทางกายภาพหรือไม่", evidence: "Equipment Layout Plan, Server Room Specifications, UPS Documentation" },
      { id: "A.7.9", clause: "A.7.9", question: "มีมาตรการรักษาความปลอดภัยสำหรับอุปกรณ์ที่นำออกนอกสถานที่ (Assets Off-Premises) หรือไม่", evidence: "Mobile Device Policy, Laptop Encryption Evidence, Asset Tracking Log" },
      { id: "A.7.10", clause: "A.7.10", question: "มีกระบวนการบริหารจัดการสื่อบันทึกข้อมูล (Storage Media) รวมถึงการใช้งาน จัดเก็บ และทำลายหรือไม่", evidence: "Media Management Procedure, Media Destruction Records, Chain of Custody" },
      { id: "A.7.11", clause: "A.7.11", question: "ระบบสาธารณูปโภค (Power, HVAC, UPS) มีความน่าเชื่อถือและได้รับการดูแลรักษาหรือไม่", evidence: "UPS Maintenance Records, Generator Test Log, HVAC Service Records" },
      { id: "A.7.12", clause: "A.7.12", question: "สายสัญญาณข้อมูลและไฟฟ้าได้รับการป้องกันจากการดักฟังหรือความเสียหายหรือไม่", evidence: "Cabling Infrastructure Documentation, Cable Management Records" },
      { id: "A.7.13", clause: "A.7.13", question: "อุปกรณ์ได้รับการบำรุงรักษาตามแผน (Preventive Maintenance) เพื่อความพร้อมใช้งานหรือไม่", evidence: "Maintenance Schedule, Service Records, Vendor Maintenance Contracts" },
      { id: "A.7.14", clause: "A.7.14", question: "มีกระบวนการทำลายหรือนำอุปกรณ์กลับมาใช้ใหม่ (Secure Disposal/Re-use) ที่ลบข้อมูลอย่างสมบูรณ์หรือไม่", evidence: "Disposal Procedure, Data Wiping Records, Certificate of Destruction" },
    ],
  },
  {
    id: "technical",
    label: "Technical Controls (A.8)",
    shortLabel: "A.8 Technical",
    color: "red",
    items: [
      { id: "A.8.1", clause: "A.8.1", question: "มีนโยบายและมาตรการควบคุมอุปกรณ์ปลายทางของผู้ใช้ (User Endpoint Devices) รวมถึง MDM, Encryption หรือไม่", evidence: "Endpoint Security Policy, MDM System, Encryption Evidence" },
      { id: "A.8.2", clause: "A.8.2", question: "สิทธิ์การเข้าถึงแบบสูงสุด (Privileged Access Rights) ได้รับการจำกัด ควบคุม และตรวจสอบหรือไม่", evidence: "Privileged Access Policy, PAM System, Admin Account List, Access Review" },
      { id: "A.8.3", clause: "A.8.3", question: "การเข้าถึงข้อมูลและระบบถูกจำกัดตามหน้าที่และความจำเป็น (Information Access Restriction) หรือไม่", evidence: "Access Control Matrix, System Access Rights Review" },
      { id: "A.8.4", clause: "A.8.4", question: "การเข้าถึง Source Code ได้รับการควบคุมและจำกัดเฉพาะผู้ที่ได้รับอนุญาตหรือไม่", evidence: "Source Code Repository Access Control, Code Review Policy" },
      { id: "A.8.5", clause: "A.8.5", question: "มีการใช้ Secure Authentication เช่น MFA, Strong Password สำหรับระบบที่มีความสำคัญหรือไม่", evidence: "Authentication Policy, MFA Implementation Evidence, Password Policy Enforcement" },
      { id: "A.8.6", clause: "A.8.6", question: "มีการติดตามและบริหารความจุของระบบ (Capacity Management) เพื่อป้องกันการหยุดชะงักหรือไม่", evidence: "Capacity Planning Reports, Resource Monitoring Dashboard, Capacity Alerts" },
      { id: "A.8.7", clause: "A.8.7", question: "มีซอฟต์แวร์ป้องกันมัลแวร์ (Anti-malware) ติดตั้งและอัปเดตบนทุกระบบที่เกี่ยวข้องหรือไม่", evidence: "Anti-malware Policy, Installed Software List, Update/Scan Logs" },
      { id: "A.8.8", clause: "A.8.8", question: "มีกระบวนการบริหารช่องโหว่ทางเทคนิค (Vulnerability Management) รวมถึงการ Patch อย่างทันท่วงทีหรือไม่", evidence: "Vulnerability Scanning Reports, Patch Management Procedure, Patch Records" },
      { id: "A.8.9", clause: "A.8.9", question: "มีการกำหนดและบริหาร Configuration Baseline สำหรับระบบสำคัญหรือไม่", evidence: "Configuration Management Policy, Baseline Configurations, CIS Benchmark Compliance" },
      { id: "A.8.10", clause: "A.8.10", question: "มีกระบวนการลบข้อมูลอย่างปลอดภัย (Information Deletion/Secure Erasure) เมื่อไม่จำเป็นต้องใช้หรือไม่", evidence: "Data Deletion Policy, Deletion Records, Verification Evidence" },
      { id: "A.8.11", clause: "A.8.11", question: "มีมาตรการปิดบังข้อมูลอ่อนไหว (Data Masking) ในสภาพแวดล้อม Non-production หรือไม่", evidence: "Data Masking Policy, Masking Tool Evidence, Test Environment Data" },
      { id: "A.8.12", clause: "A.8.12", question: "มีระบบหรือมาตรการป้องกันการรั่วไหลของข้อมูล (Data Leakage Prevention/DLP) หรือไม่", evidence: "DLP Policy, DLP Tool Configuration, Incident Logs" },
      { id: "A.8.13", clause: "A.8.13", question: "มีการสำรองข้อมูล (Backup) ตามนโยบาย และมีการทดสอบการกู้คืนอย่างสม่ำเสมอหรือไม่", evidence: "Backup Policy, Backup Logs, Restore Test Records" },
      { id: "A.8.14", clause: "A.8.14", question: "มีความซ้ำซ้อน (Redundancy) ในระบบประมวลผลสารสนเทศที่สำคัญเพื่อความพร้อมใช้งานหรือไม่", evidence: "High Availability Architecture, Failover Test Records, SLA Documentation" },
      { id: "A.8.15", clause: "A.8.15", question: "มีการบันทึก Event Log ของระบบสำคัญ จัดเก็บอย่างปลอดภัย และนำมาวิเคราะห์หรือไม่", evidence: "Logging Policy, SIEM/Log Management System, Log Retention Records" },
      { id: "A.8.16", clause: "A.8.16", question: "มีการติดตามเฝ้าระวัง (Monitoring) ระบบและเครือข่าย รวมถึงการวิเคราะห์ Anomaly หรือไม่", evidence: "Monitoring System (SIEM/SOAR), Alert Rules, Anomaly Detection Records" },
      { id: "A.8.17", clause: "A.8.17", question: "นาฬิกาของระบบทั้งหมดถูกซิงโครไนซ์ (Clock Synchronization) กับ NTP Server ที่น่าเชื่อถือหรือไม่", evidence: "NTP Configuration, Time Synchronization Evidence, Log Timestamps" },
      { id: "A.8.18", clause: "A.8.18", question: "การใช้งาน Privileged Utility Programs ถูกควบคุมและบันทึกหรือไม่", evidence: "Privileged Tool Access Control, Usage Logs, Approval Records" },
      { id: "A.8.19", clause: "A.8.19", question: "มีการควบคุมการติดตั้งซอฟต์แวร์บนระบบปฏิบัติงาน (Software Installation on Operational Systems) หรือไม่", evidence: "Software Installation Policy, Approved Software List, Change Records" },
      { id: "A.8.20", clause: "A.8.20", question: "มีมาตรการรักษาความปลอดภัยเครือข่าย (Network Security) เช่น Firewall, IDS/IPS, Network Segmentation หรือไม่", evidence: "Network Security Policy, Firewall Rules, Network Diagram" },
      { id: "A.8.21", clause: "A.8.21", question: "บริการเครือข่าย (Network Services) มีการกำหนด SLA ด้านความมั่นคงปลอดภัยและมีการตรวจสอบหรือไม่", evidence: "Network Service Agreements, ISP/Cloud SLAs, Service Review Records" },
      { id: "A.8.22", clause: "A.8.22", question: "มีการแบ่งแยกเครือข่าย (Network Segmentation) เช่น VLAN, DMZ เพื่อจำกัดขอบเขตความเสียหายหรือไม่", evidence: "Network Segmentation Design, VLAN Configuration, DMZ Documentation" },
      { id: "A.8.23", clause: "A.8.23", question: "มีการกรองการเข้าถึงเว็บ (Web Filtering) เพื่อป้องกันการเข้าถึงเนื้อหาที่ไม่เหมาะสมหรือเป็นภัยหรือไม่", evidence: "Web Filtering Policy, Proxy/DNS Filter Configuration, Block List" },
      { id: "A.8.24", clause: "A.8.24", question: "มีการใช้การเข้ารหัส (Cryptography) ที่เหมาะสมสำหรับการปกป้องข้อมูลอ่อนไหวหรือไม่", evidence: "Cryptography Policy, Encryption Implementation Evidence, Key Management Procedure" },
      { id: "A.8.25", clause: "A.8.25", question: "มีการรวม Security ไว้ในวงจรชีวิตการพัฒนาซอฟต์แวร์ (Secure SDLC) หรือไม่", evidence: "Secure SDLC Policy, Security Requirements, Code Review Records, SAST/DAST Results" },
      { id: "A.8.26", clause: "A.8.26", question: "ข้อกำหนดด้านความมั่นคงปลอดภัย (Security Requirements) ถูกรวมไว้ตั้งแต่ขั้นตอนการออกแบบแอปพลิเคชันหรือไม่", evidence: "Application Security Requirements, Security Architecture Reviews" },
      { id: "A.8.27", clause: "A.8.27", question: "มีการออกแบบระบบโดยใช้หลักการ Secure Architecture (เช่น Zero Trust, Defense in Depth) หรือไม่", evidence: "System Architecture Documentation, Security Design Reviews" },
      { id: "A.8.28", clause: "A.8.28", question: "มีมาตรฐาน Secure Coding ที่บังคับใช้ในกระบวนการพัฒนาซอฟต์แวร์หรือไม่", evidence: "Secure Coding Standards, Code Review Checklist, SAST Tool Reports" },
      { id: "A.8.29", clause: "A.8.29", question: "มีการทดสอบความมั่นคงปลอดภัย (Security Testing) รวมถึง Penetration Testing ก่อน Production Release หรือไม่", evidence: "Security Test Plans, VAPT Reports, Test Results, UAT Sign-off" },
      { id: "A.8.30", clause: "A.8.30", question: "มีการควบคุมและตรวจสอบ Outsourced Development ด้านความมั่นคงปลอดภัยหรือไม่", evidence: "Outsourcing Agreements, Security Requirements for Vendors, Code Audit Records" },
      { id: "A.8.31", clause: "A.8.31", question: "มีการแบ่งแยกสภาพแวดล้อม Development, Test, และ Production อย่างชัดเจนหรือไม่", evidence: "Environment Separation Policy, Infrastructure Evidence, Deployment Procedure" },
      { id: "A.8.32", clause: "A.8.32", question: "การเปลี่ยนแปลงระบบ (Change Management) ดำเนินการผ่านกระบวนการที่กำหนดและได้รับการอนุมัติหรือไม่", evidence: "Change Management Procedure, Change Request Records, CAB Approval" },
      { id: "A.8.33", clause: "A.8.33", question: "ข้อมูลที่ใช้ในการทดสอบ (Test Information) ได้รับการคัดเลือก ป้องกัน และควบคุมอย่างเหมาะสมหรือไม่", evidence: "Test Data Policy, Data Masking Evidence, Test Environment Access Control" },
      { id: "A.8.34", clause: "A.8.34", question: "มีการวางแผนและควบคุมการเข้าถึงระบบในระหว่างการตรวจสอบ (Audit Testing) เพื่อลดผลกระทบต่อระบบหรือไม่", evidence: "Audit Access Control Procedure, Audit Tool Usage Policy, Test Schedule" },
    ],
  },
]

export function getInitialState(): Record<string, { result: ResultType; finding: string; carNo: string }> {
  const state: Record<string, { result: ResultType; finding: string; carNo: string }> = {}
  for (const domain of CHECKLIST_DOMAINS) {
    for (const item of domain.items) {
      state[item.id] = { result: "", finding: "", carNo: "" }
    }
  }
  return state
}
