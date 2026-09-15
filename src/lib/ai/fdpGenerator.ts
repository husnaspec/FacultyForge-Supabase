export interface GeneratedSession {
  day_number: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  learning_objective: string;
}

export interface GeneratedFDP {
  title: string;
  description: string;
  event_type: 'FDP' | 'WORKSHOP' | 'SEMINAR' | 'TRAINING' | 'STTP';
  objectives: string;
  target_audience: string;
  eligibility: string;
  duration_hours: number;
  capacity: number;
  delivery_mode: 'OFFLINE' | 'ONLINE' | 'HYBRID';
  venue: string;
  expected_outcomes: string;
  learning_outcomes: string;
  estimated_budget: number;
  sessions: GeneratedSession[];
  source_engine: 'DETERMINISTIC_EXPERT' | 'GEMINI_LLM';
}

export class FDPGeneratorAgent {
  static generateFromPrompt(prompt: string, departmentCode: string = 'CSE', durationDays: number = 3): GeneratedFDP {
    const cleanPrompt = prompt.trim();
    const days = Math.max(1, Math.min(5, durationDays));
    const hoursPerDay = 6.0;
    const totalHours = days * hoursPerDay;

    // Keyword detection
    const isAI = /ai|generative|llm|deep learning|neural|machine learning/i.test(cleanPrompt);
    const isCloud = /cloud|kubernetes|docker|devops|aws|azure/i.test(cleanPrompt);
    const isCyber = /security|cyber|cryptography|zero trust|penetration/i.test(cleanPrompt);
    const isVLSI = /vlsi|embedded|fpga|microelectronics|verilog|iot/i.test(cleanPrompt);
    const isPedagogy = /teaching|pedagogy|obe|outcome|accreditation|naac/i.test(cleanPrompt);

    let domainTitle = cleanPrompt || 'Advanced Faculty Development Programme';
    let domainDesc = `An intensive ${days}-day faculty development initiative focused on modern pedagogical integration of ${cleanPrompt}.`;
    let domainObjectives = `1. Understand modern theoretical paradigms and research frontiers in ${cleanPrompt}.\n2. Gain hands-on implementation competency through laboratory exercises.\n3. Integrate course outcome (CO) attainment and student assessment rubrics.`;
    let domainOutcomes = `Participants will design outcome-based curricula, publish pedagogical research papers, and mentor undergraduate project batches.`;
    let estimatedBudget = 25000 + days * 15000;

    if (isAI) {
      domainTitle = `Modern Frontiers in ${cleanPrompt.toUpperCase() || 'Generative AI & Agentic Systems'}`;
      domainDesc = `A cutting-edge workshop addressing neural foundations, transformer architectures, retrieval augmented generation (RAG), and agentic workflow orchestration for engineering faculty.`;
      domainObjectives = `1. Dissect self-attention math and foundation model fine-tuning (LoRA/QLoRA).\n2. Construct low-latency retrieval augmented generation (RAG) vector pipelines.\n3. Deploy multi-agent collaborative loops for autonomous research and grading.`;
      domainOutcomes = `Faculty will produce 2 ready-to-deploy laboratory exercises and formulate research grant proposals for AICTE / DST funding.`;
      estimatedBudget = 35000 + days * 18000;
    } else if (isCloud) {
      domainTitle = `Cloud Native Architecture, Kubernetes & Zero Trust DevSecOps`;
      domainDesc = `Hands-on faculty immersion in container orchestration, microservice telemetry, automated vulnerability scanning, and infrastructure as code.`;
      domainObjectives = `1. Master containerization and Kubernetes cluster management.\n2. Implement CI/CD pipelines with automated static security analysis (SAST/DAST).\n3. Architect distributed microservices with event-driven message brokers.`;
      domainOutcomes = `Establish high-availability student testing clusters and update cloud computing syllabus.`;
    } else if (isCyber) {
      domainTitle = `Defensive Cyber Intelligence, Cryptography & Threat Modeling`;
      domainDesc = `Advanced training covering zero trust architecture, threat modeling frameworks (STRIDE/MITRE ATT&CK), and cryptographic key exchange.`;
      domainObjectives = `1. Conduct vulnerability analysis using industry standard packet inspection.\n2. Design cryptographic protocols conforming to post-quantum standards.\n3. Execute incident response tabletop simulations for institutional servers.`;
    } else if (isVLSI) {
      domainTitle = `VLSI Physical Design, FPGA Prototyping & Edge AI Accelerators`;
      domainDesc = `Bridging modern digital design with hardware-aware deep learning compilation on low-power silicon and FPGAs.`;
      domainObjectives = `1. Simulate RTL modules using Verilog and modern EDA toolchains.\n2. Synthesize custom compute accelerators on Xilinx / Altera FPGAs.\n3. Quantize neural networks for TinyML microcontrollers.`;
    } else if (isPedagogy) {
      domainTitle = `Outcome-Based Education (OBE), Curriculum Design & Accreditation Excellence`;
      domainDesc = `Mastering Bloom's Revised Taxonomy, Course Outcome-Program Outcome (CO-PO) mapping matrix, and NAAC/NBA criteria compliance.`;
      domainObjectives = `1. Formulate measurable course learning outcomes matching Bloom's cognitive levels.\n2. Compute continuous indirect and direct attainment with mathematical rigor.\n3. Prepare institutional audit dossiers with empirical learning gain metrics.`;
    }

    // Generate daily sessions
    const sessions: GeneratedSession[] = [];
    for (let day = 1; day <= days; day++) {
      if (day === 1) {
        sessions.push({
          day_number: 1,
          title: `Day 1: Foundations, Mathematical Rigor & Baseline Diagnostics`,
          description: `Keynote orientation, pre-assessment evaluation, and foundational concepts of ${cleanPrompt}.`,
          start_time: '09:30 AM',
          end_time: '04:30 PM',
          learning_objective: `Diagnose baseline competency and establish theoretical frameworks.`,
        });
      } else if (day === days && days > 1) {
        sessions.push({
          day_number: day,
          title: `Day ${day}: Capstone Project Review, Post-Assessment & Dossier Compilation`,
          description: `Participant group presentations, post-assessment examination, 5D feedback submission, and valedictory ceremony.`,
          start_time: '09:30 AM',
          end_time: '04:30 PM',
          learning_objective: `Demonstrate empirical competency gain and export accreditation dossiers.`,
        });
      } else {
        sessions.push({
          day_number: day,
          title: `Day ${day}: Hands-on Laboratory Implementation & Architectural Deep-Dive`,
          description: `Interactive lab exercises, peer coding sessions, and error handling for ${cleanPrompt}.`,
          start_time: '09:30 AM',
          end_time: '04:30 PM',
          learning_objective: `Build functional prototype modules under expert mentorship.`,
        });
      }
    }

    return {
      title: domainTitle,
      description: domainDesc,
      event_type: days > 2 ? 'FDP' : 'WORKSHOP',
      objectives: domainObjectives,
      target_audience: `Faculty of ${departmentCode}, Allied Engineering Branches, and Research Scholars`,
      eligibility: `Faculty members, Postdoctoral fellows, and Ph.D. research scholars`,
      duration_hours: totalHours,
      capacity: 50,
      delivery_mode: 'HYBRID',
      venue: `Department of ${departmentCode} Seminar Complex / Virtual Meeting Suite`,
      expected_outcomes: domainOutcomes,
      learning_outcomes: `Proficiency in design, implementation, and classroom translation of ${cleanPrompt}.`,
      estimated_budget: estimatedBudget,
      sessions,
      source_engine: 'DETERMINISTIC_EXPERT',
    };
  }
}
