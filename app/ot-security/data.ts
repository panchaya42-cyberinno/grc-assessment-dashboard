export type Answer = "yes" | "partial" | "no" | "na" | ""

export interface OTQuestion {
  id: string
  question: string
}

export interface OTCategory {
  id: string
  title: string
  questions: OTQuestion[]
}

export interface OTFunction {
  id: string
  title: string
  shortTitle: string
  color: string
  bgColor: string
  borderColor: string
  categories: OTCategory[]
}

export const OT_FUNCTIONS: OTFunction[] = [
  {
    id: "ID",
    title: "IDENTIFY",
    shortTitle: "Identify",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/40",
    categories: [
      {
        id: "ID-AM",
        title: "Asset Management",
        questions: [
          { id: "ID-AM-1", question: "Do you have OT asset inventory up to date? How are you maintaining Asset Inventory? Are you using any Tools? Or Excel based approach?" },
          { id: "ID-AM-2", question: "Are the firewalls managed by site owners? Or Vendors? Do you have 'separation of duties' when assigning responsibilities between IT and OT Team?" },
          { id: "ID-AM-3", question: "Are OT switches managed by site owners?" },
          { id: "ID-AM-4", question: "Have you updated firmware for OT Network Devices like Switches or Firewalls?" },
          { id: "ID-AM-5", question: "Does Authentication to Firewall, Switches, Workstations and other components have unique strong passwords?" },
          { id: "ID-AM-6", question: "Do the site owners update application patches/updates at least annually?" },
          { id: "ID-AM-7", question: "Have you defined patch management program for your OT Assets?" },
          { id: "ID-AM-8", question: "Does OT workstations have Unique User's passwords?" },
          { id: "ID-AM-9", question: "Do the site owners apply operating system level patches?" },
        ],
      },
      {
        id: "ID-BE",
        title: "Business Environment",
        questions: [
          { id: "ID-BE-1", question: "Is confidential information (e.g., business sensitive, production specific, etc.) restricted to authorized users?" },
          { id: "ID-BE-2", question: "Is the determination of 'system security requirements' part of business case planning?" },
          { id: "ID-BE-3", question: "Is the security authorization on different OT Systems updated on a defined frequency?" },
          { id: "ID-BE-4", question: "Is the OT security officer appointed with the mission and resources to coordinate, develop, implement, and maintain an organization-wide OT security program?" },
          { id: "ID-BE-5", question: "Does the organization have established OT Security improvement program along with workforce development?" },
          { id: "ID-BE-6", question: "Does the organization have a clearly defined, documented, and approved processes (Technical and Management related processes in OT)?" },
          { id: "ID-BE-7", question: "Do you strictly follow the security procedure from BCP?" },
        ],
      },
      {
        id: "ID-GV",
        title: "Governance",
        questions: [
          { id: "ID-GV-1", question: "Have you defined OT security responsibilities and assigned accordingly to appropriate responsible team members?" },
          { id: "ID-GV-2", question: "Is there a supply chain risk management program implemented? Have you incorporated OT security requirements in your contract documents and clearly defined as part of your FAT/SAT Procedures?" },
          { id: "ID-GV-3", question: "Policies and procedures established for network segmentation including implementation of DMZs based on type and sensitivity of equipment, user roles, and types of systems established?" },
          { id: "ID-GV-4", question: "Are the OT Security policies, Guidelines and procedures accessible to all authorised staff?" },
          { id: "ID-GV-5", question: "Is there a process defined for establishing a new system into the network? And the needed approvals for the same?" },
          { id: "ID-GV-6", question: "Are the environmental risk factors considered into the risk assessment?" },
          { id: "ID-GV-7", question: "Policies for security of standalone, lost, and misplaced equipment in place?" },
          { id: "ID-GV-8", question: "Physical protection against fire, flood, earthquake, explosion, civil unrest, etc. is implemented?" },
        ],
      },
      {
        id: "ID-RA",
        title: "Risk Assessment",
        questions: [
          { id: "ID-RA-1", question: "Has the Organization performed any Risk Assessment?" },
          { id: "ID-RA-2", question: "What is the frequency of Risk Assessment occurrence? Have you defined your crown jewel sites? (In High/Medium/Low critical sites)?" },
          { id: "ID-RA-3", question: "Does the risk management process include Threat Modelling?" },
          { id: "ID-RA-4", question: "Are current risk assessment policies and procedures reviewed and updated?" },
          { id: "ID-RA-5", question: "Does the organization define a frequency for reviewing risk assessment results? And take corrective action accordingly?" },
        ],
      },
      {
        id: "ID-RM",
        title: "Risk Management Strategy",
        questions: [
          { id: "ID-RM-1", question: "When a new major incident is recorded, is the security risk assessment plan updated?" },
          { id: "ID-RM-2", question: "Are auditable parameters added or modified as new threats are discovered?" },
          { id: "ID-RM-3", question: "Are system connections continuously monitored to ensure compliance with documented security requirements?" },
          { id: "ID-RM-4", question: "Is a security assessment report generated that documents the assessment's findings?" },
          { id: "ID-RM-5", question: "Is the site owner using a standard procedure for dealing with existing vulnerabilities?" },
          { id: "ID-RM-6", question: "Is there a comprehensive risk management plan in place for organisational operations and assets, persons? (Covering People, Process, Technology)" },
        ],
      },
      {
        id: "ID-SC",
        title: "Supply Chain Risk Management",
        questions: [
          { id: "ID-SC-1", question: "Does the organization have a Supply Chain Risk Management policy?" },
          { id: "ID-SC-2", question: "Is the 3rd party vendor screening done thoroughly before the contracts are awarded including NDA?" },
          { id: "ID-SC-3", question: "Does the organization have a supply chain risk management team?" },
          { id: "ID-SC-4", question: "Are vendor's people escorted from entry-to-exit inside the plant?" },
          { id: "ID-SC-5", question: "Does vendors have their own restricted users for the system accessibility?" },
          { id: "ID-SC-6", question: "Does the organization maintain Software BOM (Bill of Materials)?" },
          { id: "ID-SC-7", question: "Is the organization's data, documentation, tools, or system components disposed of using predefined techniques and methods?" },
        ],
      },
    ],
  },
  {
    id: "PR",
    title: "PROTECT",
    shortTitle: "Protect",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/40",
    categories: [
      {
        id: "PR-PS",
        title: "Physical Security",
        questions: [
          { id: "PR-PS-1", question: "Are all physical access points to the facility subject to physical access authorizations?" },
          { id: "PR-PS-2", question: "Does the organization provide unique id card to each of its workers and visitors?" },
          { id: "PR-PS-3", question: "Is physical access monitored for the purpose of detecting and responding to physical security incidents?" },
          { id: "PR-PS-4", question: "Are keys, combinations and other physical access devices secured?" },
          { id: "PR-PS-5", question: "Is physical access to output devices controlled?" },
          { id: "PR-PS-6", question: "Is the control of publicly accessible sites in accordance with the organization's risk assessment?" },
          { id: "PR-PS-7", question: "Before allowing entry to the facility are individual access authorizations verified?" },
          { id: "PR-PS-8", question: "Is the access list and authorization credentials checked and approved at least once a year and are those that no longer need access removed?" },
        ],
      },
      {
        id: "PR-AT",
        title: "Awareness and Training",
        questions: [
          { id: "PR-AT-1", question: "Is basic OT security awareness training provided to all system users before system access is granted?" },
          { id: "PR-AT-2", question: "Does organization conduct Fire drills?" },
          { id: "PR-AT-3", question: "Does organization provide Do's and Don't training to its visitors?" },
          { id: "PR-AT-4", question: "Are individual system security training activities documented, maintained, and monitored?" },
          { id: "PR-AT-5", question: "Is refresher training provided on a defined frequency, at least annually?" },
          { id: "PR-AT-6", question: "Are practical exercises or scenarios included in the OT security awareness training that simulate actual cyber-attacks?" },
        ],
      },
      {
        id: "PR-DS",
        title: "Data Security",
        questions: [
          { id: "PR-DS-1", question: "Is there security authentication feature setup for accessing plants critical data?" },
          { id: "PR-DS-2", question: "Is there a disaster recovery plan in place for data recovery?" },
          { id: "PR-DS-3", question: "Are the servers deployed in RAID configuration?" },
          { id: "PR-DS-4", question: "Does the plant use remote backup servers?" },
          { id: "PR-DS-5", question: "Does the plant encrypt data before transferring it to remote servers?" },
          { id: "PR-DS-6", question: "Does the plant use plain text protocols like FTP, Telnet, HTTP?" },
          { id: "PR-DS-7", question: "Are the security keys revised at least yearly?" },
          { id: "PR-DS-8", question: "Are security keys revoked for the users who have left the organization?" },
        ],
      },
      {
        id: "PR-IP",
        title: "Information Protection Processes",
        questions: [
          { id: "PR-IP-1", question: "Does the organization restrict the use of system media that can't be sanitized?" },
          { id: "PR-IP-2", question: "Does the organization manage the accessibility of USB devices? Do you use Sheep Dip Stations?" },
          { id: "PR-IP-3", question: "Are data storage devices (HDD, SSD) erased prior to redeployment?" },
          { id: "PR-IP-4", question: "Are cryptographic mechanisms used to protect information?" },
          { id: "PR-IP-5", question: "Are the circumstances defined where portable, removable storage devices are required to be sanitized prior to connection to the system?" },
          { id: "PR-IP-6", question: "Does the sensitivity of the material determine how the media are stored?" },
        ],
      },
      {
        id: "PR-MA",
        title: "Maintenance",
        questions: [
          { id: "PR-MA-1", question: "Are all sessions and remote connections provided via jump servers, On-Demand basis and Monitored and terminated when remote maintenance is completed?" },
          { id: "PR-MA-2", question: "If password-based authentication is used to perform remote maintenance, are passwords changed after each session?" },
          { id: "PR-MA-3", question: "Are remote maintenance and diagnostic sessions audited and do designated organisational individuals evaluate remote session maintenance records?" },
          { id: "PR-MA-4", question: "Is documentation available for the installation and operation of remote maintenance and diagnostic links?" },
          { id: "PR-MA-5", question: "Is the use of system maintenance tools approved and monitored?" },
          { id: "PR-MA-6", question: "Are all media containing diagnostic and test programs checked for malicious code before the media are used in the system?" },
          { id: "PR-MA-7", question: "Is there maintenance support and spare parts available for security-critical system components?" },
          { id: "PR-MA-8", question: "Is remote maintenance and diagnostic work authorised, monitored, and controlled?" },
          { id: "PR-MA-9", question: "Are remote maintenance and diagnostic tools only utilised in accordance with policy and as documented in the system's security plan?" },
          { id: "PR-MA-10", question: "Are records for remote maintenance and diagnostic activities maintained?" },
        ],
      },
      {
        id: "PR-PT",
        title: "Protective Technology",
        questions: [
          { id: "PR-PT-1", question: "Are Antivirus servers Deployed? Is the Antivirus solution approved by OT Vendor?" },
          { id: "PR-PT-2", question: "Does the patches get updated? Are those patches approved by vendors?" },
          { id: "PR-PT-3", question: "Organization has deployed IT SOC with OT Capabilities?" },
          { id: "PR-PT-4", question: "Does the organization has OT specific threat intelligence service?" },
        ],
      },
    ],
  },
  {
    id: "DE",
    title: "DETECT",
    shortTitle: "Detect",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/40",
    categories: [
      {
        id: "DE-AE",
        title: "Anomalies and Events",
        questions: [
          { id: "DE-AE-1", question: "Are events on the system monitored?" },
          { id: "DE-AE-2", question: "Are system attacks detected? (Attacks can be detected via log monitoring, IDS system monitoring, Signature/indicators)" },
          { id: "DE-AE-3", question: "Is unauthorized use of the system identified? (e.g., log monitoring)" },
          { id: "DE-AE-4", question: "Are there monitoring devices strategically placed throughout the system to acquire critical data and track specific types of transactions of interest?" },
          { id: "DE-AE-5", question: "Is the amount of system monitoring activities enhanced if there is a sign of heightened risk?" },
          { id: "DE-AE-6", question: "When it comes to system monitoring, does legal counsel become involved?" },
          { id: "DE-AE-7", question: "Are automated tools used to support near real-time analysis of events?" },
          { id: "DE-AE-8", question: "Does the system monitor inbound and outbound communications for unusual or unauthorized activities or conditions?" },
          { id: "DE-AE-9", question: "Is a real-time alert sent by the system when indications of compromise or possible compromise occurs?" },
        ],
      },
      {
        id: "DE-CM",
        title: "Security Continuous Monitoring",
        questions: [
          { id: "DE-CM-1", question: "Are events on the system monitored continuously?" },
          { id: "DE-CM-2", question: "Are system attacks detected via IDS/IPS, log monitoring, and signature-based indicators?" },
          { id: "DE-CM-3", question: "Does organization use NTP servers? Which stratum model?" },
          { id: "DE-CM-4", question: "Is the time correct and consistent in critical systems?" },
          { id: "DE-CM-5", question: "Is intrusion monitoring application evaluated over a particular time period?" },
          { id: "DE-CM-6", question: "Is network access control used to prevent MITM attacks and the addition of rogue devices to the network?" },
        ],
      },
      {
        id: "DE-DP",
        title: "Detection Processes",
        questions: [
          { id: "DE-DP-1", question: "Are all the methods of remote access to the system authorized, monitored, and managed?" },
          { id: "DE-DP-2", question: "Are automated mechanisms used to facilitate the monitoring and control of remote access methods?" },
          { id: "DE-DP-3", question: "Is cryptography used to protect the confidentiality and integrity of remote access sessions?" },
          { id: "DE-DP-4", question: "Does the system route all remote accesses through a limited number of managed access control points?" },
          { id: "DE-DP-5", question: "Is remote access for privileged commands and security-relevant information authorized only for compelling operational needs and is the rationale for such access documented?" },
          { id: "DE-DP-6", question: "Does the system terminate a network connection at the end of a session or after a defined time period of inactivity?" },
          { id: "DE-DP-7", question: "Is automatic session termination applied to local and remote sessions?" },
          { id: "DE-DP-8", question: "Are the terms and conditions established for authorized individuals to access the system from an external system?" },
          { id: "DE-DP-9", question: "Are the terms and conditions established for authorized individuals to process, store, and transmit organization-controlled information using an external system?" },
          { id: "DE-DP-10", question: "Are authorized individuals prohibited from using an external system to access or process organization-controlled information except in situations where the organization can verify security controls or has approved connection agreements?" },
        ],
      },
    ],
  },
  {
    id: "RS",
    title: "RESPOND",
    shortTitle: "Respond",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/40",
    categories: [
      {
        id: "RS-RP",
        title: "Response Planning",
        questions: [
          { id: "RS-RP-1", question: "Is an incident handling capability implemented for security incidents that include preparation, detection and analysis, containment, eradication, and recovery?" },
          { id: "RS-RP-2", question: "Are incident handling activities coordinated with contingency planning activities?" },
          { id: "RS-RP-3", question: "Are lessons learned from ongoing incident handling activities incorporated into incident response procedures?" },
          { id: "RS-RP-4", question: "Are system network security incidents tracked and documented on an ongoing basis?" },
          { id: "RS-RP-5", question: "Are cyber and control system security incident information promptly reported to authorities?" },
          { id: "RS-RP-6", question: "Is an incident response support resource provided that offers advice and assistance?" },
          { id: "RS-RP-7", question: "Are personnel required to report suspected security incidents to the organizational incident response authority within a defined time-period?" },
          { id: "RS-RP-8", question: "Are automated mechanisms used to increase the availability of incident response-related information and support?" },
          { id: "RS-RP-9", question: "Does the organization implement an insider threat program that includes a cross-discipline insider threat incident handling team?" },
          { id: "RS-RP-10", question: "Is the incident response investigation and analysis process developed, tested, deployed, and documented?" },
        ],
      },
      {
        id: "RS-CO",
        title: "Communications",
        questions: [
          { id: "RS-CO-1", question: "Does the organization display common contact number for emergency situations?" },
          { id: "RS-CO-2", question: "Does the Organization maintain the communication channels?" },
          { id: "RS-CO-3", question: "Does the organization simulate a drill which includes communication?" },
          { id: "RS-CO-4", question: "Does the organization maintain a list of personnel contact number for emergency situations?" },
          { id: "RS-CO-5", question: "Does the organization maintain Alarming system including Alarm servers in OT?" },
        ],
      },
      {
        id: "RS-AN",
        title: "Analysis",
        questions: [
          { id: "RS-AN-1", question: "Is the incident response investigation and analysis process developed, tested, deployed, and documented?" },
          { id: "RS-AN-2", question: "Are incident handling activities coordinated with contingency planning activities?" },
          { id: "RS-AN-3", question: "Are lessons learned from ongoing incident handling activities incorporated into incident response procedures?" },
          { id: "RS-AN-4", question: "Are system network security incidents tracked and documented on an ongoing basis?" },
          { id: "RS-AN-5", question: "Is an incident response support resource provided that offers advice and assistance?" },
          { id: "RS-AN-6", question: "Are personnel required to report suspected security incidents to the organizational incident response authority within a defined time-period?" },
          { id: "RS-AN-7", question: "Are automated mechanisms used to increase the availability of incident response-related information and support?" },
          { id: "RS-AN-8", question: "Does the organization implement an insider threat program that includes a cross-discipline insider threat incident handling team?" },
        ],
      },
      {
        id: "RS-MI",
        title: "Mitigation",
        questions: [
          { id: "RS-MI-1", question: "Does the risk management process include risk mitigation?" },
          { id: "RS-MI-2", question: "Does the organization document the vulnerability assessment result for mitigation steps taken?" },
          { id: "RS-MI-3", question: "Does the organization consider environmental hazards as its risk mitigations?" },
          { id: "RS-MI-4", question: "Are risk-reduction mitigation measures planned and implemented?" },
          { id: "RS-MI-5", question: "Are potential accessibility problems to the alternate control centre identified in the event of an area-wide disruption or disaster? And are explicit mitigation actions outlined?" },
          { id: "RS-MI-6", question: "Are potential accessibility problems at the alternative storage site identified in the event of an area wide disruption or disaster and are explicit mitigation actions outlined?" },
        ],
      },
      {
        id: "RS-IM",
        title: "Improvements",
        questions: [
          { id: "RS-IM-1", question: "Does the organization establish an information security workforce development and improvement program?" },
          { id: "RS-IM-2", question: "Does the organization update its OT Security Incident Response program with ever-changing threats?" },
          { id: "RS-IM-3", question: "Does the organization update its improvement program with every incident recorded?" },
        ],
      },
    ],
  },
  {
    id: "RC",
    title: "RECOVER",
    shortTitle: "Recover",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/40",
    categories: [
      {
        id: "RC-RP",
        title: "Recovery Planning",
        questions: [
          { id: "RC-RP-1", question: "Does the organization have Recovery management plan?" },
          { id: "RC-RP-2", question: "Is the Recovery plan for the system reviewed on a defined frequency, annually at a minimum?" },
          { id: "RC-RP-3", question: "Does the recovery plan align with the organization's enterprise architecture?" },
          { id: "RC-RP-4", question: "Is the authorizing official or designated representative who reviews and approves the recovery plan specified?" },
          { id: "RC-RP-5", question: "Does the organization have a Configuration Management and Change Management Process in place?" },
        ],
      },
      {
        id: "RC-IM",
        title: "Improvements",
        questions: [
          { id: "RC-IM-1", question: "Does the organisation consider recovery improvements as part of its business continuity plan?" },
          { id: "RC-IM-2", question: "Does the organization document Recovery improvements?" },
          { id: "RC-IM-3", question: "Does the organization practice the new improvements developed for recovery?" },
        ],
      },
      {
        id: "RC-CO",
        title: "Communications",
        questions: [
          { id: "RC-CO-1", question: "Are the Incidents communicated to appropriate stake holders including affected parties?" },
          { id: "RC-CO-2", question: "Is the status of recuperation communicated?" },
          { id: "RC-CO-3", question: "Do you have alternate communication channel for recovery communication?" },
          { id: "RC-CO-4", question: "Is the average time of recovery recorded and communicated across?" },
          { id: "RC-CO-5", question: "Is the organization's average time to report for recovery communication defined?" },
        ],
      },
    ],
  },
]

export type AssessmentState = Record<string, Answer>
export type CommentsState = Record<string, string>

export function getInitialAnswers(): AssessmentState {
  return {}
}

export function calcCategoryScore(categoryId: string, answers: AssessmentState): { score: number; max: number; pct: number; answered: number; total: number } {
  const fn = OT_FUNCTIONS.find((f) => f.categories.some((c) => c.id === categoryId))
  const cat = fn?.categories.find((c) => c.id === categoryId)
  if (!cat) return { score: 0, max: 0, pct: 0, answered: 0, total: 0 }

  let score = 0
  let max = 0
  let answered = 0
  for (const q of cat.questions) {
    const a = answers[q.id]
    if (a === "na" || !a) {
      if (!a) { /* unanswered */ } else { /* N/A excluded */ }
    } else {
      answered++
      max += 2
      if (a === "yes") score += 2
      else if (a === "partial") score += 1
    }
  }
  const total = cat.questions.length
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  return { score, max, pct, answered, total }
}

export function calcFunctionScore(funcId: string, answers: AssessmentState): { pct: number; answered: number; total: number } {
  const fn = OT_FUNCTIONS.find((f) => f.id === funcId)
  if (!fn) return { pct: 0, answered: 0, total: 0 }
  let totalScore = 0; let totalMax = 0; let answered = 0; let total = 0
  for (const cat of fn.categories) {
    const r = calcCategoryScore(cat.id, answers)
    totalScore += r.score; totalMax += r.max; answered += r.answered; total += r.total
  }
  return { pct: totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0, answered, total }
}

export function calcOverallScore(answers: AssessmentState): number {
  let totalScore = 0; let totalMax = 0
  for (const fn of OT_FUNCTIONS) {
    for (const cat of fn.categories) {
      const r = calcCategoryScore(cat.id, answers)
      totalScore += r.score; totalMax += r.max
    }
  }
  return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
}

export function getMaturityLevel(pct: number): { label: string; labelTh: string; color: string; bg: string } {
  if (pct >= 80) return { label: "Optimized", labelTh: "ดีเยี่ยม", color: "text-emerald-500", bg: "bg-emerald-500/10" }
  if (pct >= 60) return { label: "Managed", labelTh: "ดี", color: "text-blue-500", bg: "bg-blue-500/10" }
  if (pct >= 40) return { label: "Defined", labelTh: "พอใช้", color: "text-amber-500", bg: "bg-amber-500/10" }
  if (pct >= 20) return { label: "Developing", labelTh: "ต้องปรับปรุง", color: "text-orange-500", bg: "bg-orange-500/10" }
  return { label: "Initial", labelTh: "วิกฤต", color: "text-red-500", bg: "bg-red-500/10" }
}

export const TOTAL_QUESTIONS = OT_FUNCTIONS.reduce(
  (sum, fn) => sum + fn.categories.reduce((s, c) => s + c.questions.length, 0), 0
)
