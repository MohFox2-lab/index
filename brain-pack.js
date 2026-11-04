/* العقل الذكي لتصنيف الشواهد (Brain Pack v2) — منقول حرفيًا من server/brain-pack.ts في المصدر: تصنيف التبويب والنوع، مستويات الثقة، كشف التكرار، اقتراح الربط المتقاطع، معالجة الرفع الجماعي، سجل التغذية الراجعة */
"use strict";
var BrainPack = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../src_pf/server/brain-pack.ts
  var brain_pack_exports = {};
  __export(brain_pack_exports, {
    CONFIDENCE_THRESHOLDS: () => CONFIDENCE_THRESHOLDS,
    JOB_PERFORMANCE_STANDARDS: () => JOB_PERFORMANCE_STANDARDS,
    checkDuplicateWindow: () => checkDuplicateWindow,
    classifyEvidence: () => classifyEvidence,
    classifyEvidenceV2: () => classifyEvidenceV2,
    classifyForJobPerformance: () => classifyForJobPerformance,
    getConfidenceLevel: () => getConfidenceLevel,
    getConfidenceLevelLabel: () => getConfidenceLevelLabel,
    getFeedbackStats: () => getFeedbackStats,
    getRecentFeedback: () => getRecentFeedback,
    getTabLabel: () => getTabLabel,
    getTypeLabel: () => getTypeLabel,
    logFeedback: () => logFeedback,
    processBulkUpload: () => processBulkUpload,
    suggestCrossLinks: () => suggestCrossLinks
  });
  var tabKeywords = {
    "executive-reports": [
      "\u062A\u0642\u0631\u064A\u0631",
      "\u062A\u0646\u0641\u064A\u0630\u064A",
      "\u0625\u0646\u062C\u0627\u0632",
      "\u0623\u062F\u0627\u0621",
      "\u0645\u062A\u0627\u0628\u0639\u0629",
      "\u0633\u064A\u0631",
      "\u0639\u0645\u0644",
      "\u0646\u062A\u0627\u0626\u062C",
      "\u0625\u062D\u0635\u0627\u0626\u064A\u0629",
      "\u062E\u062A\u0627\u0645\u064A",
      "\u0634\u0647\u0631\u064A",
      "\u0623\u0633\u0628\u0648\u0639\u064A",
      "\u064A\u0648\u0645\u064A",
      "\u062F\u0648\u0631\u064A",
      "\u062A\u062D\u0644\u064A\u0644\u064A"
    ],
    "initiatives-programs": [
      "\u0645\u0628\u0627\u062F\u0631\u0629",
      "\u0628\u0631\u0646\u0627\u0645\u062C",
      "\u0645\u0634\u0631\u0648\u0639",
      "\u0641\u0639\u0627\u0644\u064A\u0629",
      "\u062D\u0645\u0644\u0629",
      "\u0646\u0634\u0627\u0637",
      "\u062A\u0637\u0648\u0639\u064A",
      "\u0645\u062C\u062A\u0645\u0639\u064A",
      "\u062A\u0631\u0628\u0648\u064A",
      "\u0627\u0628\u062A\u0643\u0627\u0631",
      "\u0625\u0628\u062F\u0627\u0639",
      "\u0631\u064A\u0627\u062F\u0629",
      "\u0642\u064A\u0627\u062F\u0629"
    ],
    "plans": [
      "\u062E\u0637\u0629",
      "\u062A\u062E\u0637\u064A\u0637",
      "\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629",
      "\u0628\u0631\u0646\u0627\u0645\u062C",
      "\u062C\u062F\u0648\u0644",
      "\u062A\u0648\u0632\u064A\u0639",
      "\u0645\u0646\u0647\u062C",
      "\u0639\u0644\u0627\u062C\u064A\u0629",
      "\u0625\u062B\u0631\u0627\u0626\u064A\u0629",
      "\u062A\u062D\u0633\u064A\u0646",
      "\u062A\u0637\u0648\u064A\u0631",
      "\u0633\u0646\u0648\u064A\u0629",
      "\u0641\u0635\u0644\u064A\u0629"
    ],
    "analysis-assessment": [
      "\u062A\u062D\u0644\u064A\u0644",
      "\u062A\u0642\u0648\u064A\u0645",
      "\u062A\u0642\u064A\u064A\u0645",
      "\u0642\u064A\u0627\u0633",
      "\u0627\u062E\u062A\u0628\u0627\u0631",
      "\u0646\u062A\u0627\u0626\u062C",
      "\u0645\u0633\u062A\u0648\u0649",
      "\u0623\u0646\u0645\u0627\u0637",
      "\u062A\u0639\u0644\u0645",
      "\u0641\u0631\u0648\u0642",
      "\u0641\u0631\u062F\u064A\u0629",
      "\u062A\u0634\u062E\u064A\u0635",
      "\u0628\u064A\u0627\u0646\u0627\u062A"
    ],
    "activities-worksheets": [
      "\u0646\u0634\u0627\u0637",
      "\u0648\u0631\u0642\u0629",
      "\u0639\u0645\u0644",
      "\u062A\u062F\u0631\u064A\u0628",
      "\u062A\u0645\u0631\u064A\u0646",
      "\u0645\u0647\u0645\u0629",
      "\u0648\u0627\u062C\u0628",
      "\u0635\u0641\u064A",
      "\u0644\u0627\u0635\u0641\u064A",
      "\u062A\u0637\u0628\u064A\u0642",
      "\u0639\u0645\u0644\u064A",
      "\u062A\u0641\u0627\u0639\u0644\u064A"
    ],
    "tests": [
      "\u0627\u062E\u062A\u0628\u0627\u0631",
      "\u0627\u0645\u062A\u062D\u0627\u0646",
      "\u062A\u0642\u064A\u064A\u0645",
      "\u0642\u064A\u0627\u0633",
      "\u062A\u062D\u0635\u064A\u0644\u064A",
      "\u062A\u0634\u062E\u064A\u0635\u064A",
      "\u0642\u0628\u0644\u064A",
      "\u0628\u0639\u062F\u064A",
      "\u0641\u0635\u0644\u064A",
      "\u0646\u0647\u0627\u0626\u064A",
      "\u0642\u0635\u064A\u0631",
      "\u0634\u0647\u0631\u064A"
    ],
    "field-photos": [
      "\u0635\u0648\u0631\u0629",
      "\u0635\u0648\u0631",
      "\u0645\u064A\u062F\u0627\u0646\u064A",
      "\u062A\u0648\u062B\u064A\u0642",
      "\u0641\u0648\u062A\u0648\u063A\u0631\u0627\u0641\u064A",
      "\u0644\u0642\u0637\u0629",
      "\u0645\u0634\u0647\u062F",
      "\u062D\u062F\u062B",
      "\u0641\u0639\u0627\u0644\u064A\u0629",
      "\u0646\u0634\u0627\u0637",
      "\u0632\u064A\u0627\u0631\u0629",
      "\u0631\u062D\u0644\u0629"
    ],
    "certificates-honors": [
      "\u0634\u0647\u0627\u062F\u0629",
      "\u062A\u0643\u0631\u064A\u0645",
      "\u062C\u0627\u0626\u0632\u0629",
      "\u062A\u0642\u062F\u064A\u0631",
      "\u0634\u0643\u0631",
      "\u062A\u0645\u064A\u0632",
      "\u0625\u0646\u062C\u0627\u0632",
      "\u0645\u0634\u0627\u0631\u0643\u0629",
      "\u062D\u0636\u0648\u0631",
      "\u062A\u062F\u0631\u064A\u0628",
      "\u062F\u0648\u0631\u0629",
      "\u0648\u0631\u0634\u0629",
      "\u0627\u0639\u062A\u0645\u0627\u062F"
    ]
  };
  var typeByTab = {
    "executive-reports": "report",
    "initiatives-programs": "initiative",
    "plans": "plan",
    "analysis-assessment": "analysis",
    "activities-worksheets": "worksheet",
    "tests": "exam",
    "field-photos": "photo",
    "certificates-honors": "certificate"
  };
  var portfolioSuggestions = {
    "executive-reports": [10, 7, 8, 9],
    // Daily reports, Genially, ThingLink, Canva
    "initiatives-programs": [18],
    // Program/Activity Form
    "plans": [1, 2, 3, 4, 5],
    // Disciplinary, Remedial, Enrichment, Group, Detailed
    "analysis-assessment": [6],
    // Learning Pattern Analysis
    "activities-worksheets": [7, 8, 9],
    // Tech reports - Genially, ThingLink, Canva
    "tests": [2, 4, 5],
    // Remedial plans (tests often link to remedial work)
    "field-photos": [10, 18],
    // Daily reports, Program forms
    "certificates-honors": [17, 18]
    // CV, Program forms
  };
  var JOB_PERFORMANCE_STANDARDS = [
    {
      id: 1,
      title: "\u0623\u062F\u0627\u0621 \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629",
      weight: 10,
      examples: ["\u0627\u0644\u062A\u0642\u064A\u062F \u0628\u0627\u0644\u062F\u0648\u0627\u0645 \u0627\u0644\u0631\u0633\u0645\u064A", "\u062A\u0623\u062F\u064A\u0629 \u0627\u0644\u062D\u0635\u0635 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0648\u0641\u0642 \u0627\u0644\u062C\u062F\u0648\u0644", "\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064A \u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0648\u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629", "\u0625\u0639\u062F\u0627\u062F \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062F\u0631\u0648\u0633"],
      requiredEvidence: ["\u0633\u062C\u0644 \u0627\u0644\u062F\u0648\u0627\u0645", "\u0633\u062C\u0644 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0627\u0644\u0625\u0634\u0631\u0627\u0641", "\u0633\u062C\u0644 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631", "\u062E\u0637\u0629 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0646\u0647\u062C"],
      keywords: ["\u062F\u0648\u0627\u0645", "\u062D\u0636\u0648\u0631", "\u063A\u064A\u0627\u0628", "\u0645\u0646\u0627\u0648\u0628\u0629", "\u0625\u0634\u0631\u0627\u0641", "\u0627\u0646\u062A\u0638\u0627\u0631", "\u062C\u062F\u0648\u0644", "\u062D\u0635\u0635", "\u062F\u0631\u0627\u0633\u064A"]
    },
    {
      id: 2,
      title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0627\u0644\u0645\u062C\u062A\u0645\u0639",
      weight: 10,
      examples: ["\u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u0641\u064A \u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645 \u0627\u0644\u0645\u0647\u0646\u064A\u0629", "\u062A\u0628\u0627\u062F\u0644 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A", "\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u062A\u0637\u0628\u064A\u0642\u064A\u0629", "\u062D\u0636\u0648\u0631 \u0627\u0644\u062F\u0648\u0631\u0627\u062A"],
      requiredEvidence: ["\u0633\u062C\u0644 \u0645\u062C\u062A\u0645\u0639\u0627\u062A \u0627\u0644\u062A\u0639\u0644\u0645", "\u0633\u062C\u0644 \u062A\u0628\u0627\u062F\u0644 \u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A", "\u062A\u0642\u0631\u064A\u0631 \u062F\u0631\u0633 \u062A\u0637\u0628\u064A\u0642\u064A", "\u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0648\u0631\u0627\u062A"],
      keywords: ["\u0645\u062C\u062A\u0645\u0639", "\u062A\u0639\u0644\u0645", "\u0645\u0647\u0646\u064A", "\u0632\u064A\u0627\u0631\u0629", "\u062A\u0628\u0627\u062F\u0644", "\u062F\u0631\u0633", "\u062A\u0637\u0628\u064A\u0642\u064A", "\u062F\u0648\u0631\u0629", "\u0648\u0631\u0634\u0629", "\u062A\u062F\u0631\u064A\u0628"]
    },
    {
      id: 3,
      title: "\u0627\u0644\u062A\u0641\u0627\u0639\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631",
      weight: 10,
      examples: ["\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0639\u0627\u0644 \u0645\u0639 \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631", "\u062A\u0632\u0648\u064A\u062F \u0623\u0648\u0644\u064A\u0627\u0621 \u0627\u0644\u0623\u0645\u0648\u0631 \u0628\u0645\u0633\u062A\u0648\u064A\u0627\u062A \u0627\u0644\u0637\u0644\u0627\u0628", "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629"],
      requiredEvidence: ["\u0635\u0648\u0631 \u0627\u0644\u062C\u0645\u0639\u064A\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064A\u0629", "\u062A\u0642\u0631\u064A\u0631 \u0627\u062C\u062A\u0645\u0627\u0639 \u0648\u0644\u064A \u0627\u0644\u0623\u0645\u0631", "\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064A\u0629 \u0644\u0644\u0645\u062F\u0631\u0633\u0629"],
      keywords: ["\u0648\u0644\u064A", "\u0623\u0645\u0631", "\u0623\u0648\u0644\u064A\u0627\u0621", "\u062A\u0648\u0627\u0635\u0644", "\u0627\u062C\u062A\u0645\u0627\u0639", "\u062C\u0645\u0639\u064A\u0629", "\u0639\u0645\u0648\u0645\u064A\u0629", "\u0645\u0633\u062A\u0648\u0649", "\u0637\u0627\u0644\u0628"]
    },
    {
      id: 4,
      title: "\u0627\u0644\u062A\u0646\u0648\u064A\u0639 \u0641\u064A \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0627\u0644\u062A\u062F\u0631\u064A\u0633",
      weight: 10,
      examples: ["\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629", "\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u0641\u0631\u0648\u0642 \u0627\u0644\u0641\u0631\u062F\u064A\u0629"],
      requiredEvidence: ["\u062A\u0642\u0631\u064A\u0631 \u062A\u0637\u0628\u064A\u0642 \u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629", "\u0645\u0644\u0641 \u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0645\u0639\u0644\u0645"],
      keywords: ["\u0627\u0633\u062A\u0631\u0627\u062A\u064A\u062C\u064A\u0629", "\u062A\u062F\u0631\u064A\u0633", "\u062A\u0646\u0648\u064A\u0639", "\u0641\u0631\u0648\u0642", "\u0641\u0631\u062F\u064A\u0629", "\u062A\u0639\u0644\u0645", "\u0646\u0634\u0637", "\u062A\u0641\u0627\u0639\u0644\u064A", "\u062A\u0639\u0627\u0648\u0646\u064A"]
    },
    {
      id: 5,
      title: "\u062A\u062D\u0633\u064A\u0646 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646",
      weight: 10,
      examples: ["\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0641\u0627\u0642\u062F \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A", "\u0627\u0644\u062E\u0637\u0637 \u0627\u0644\u0639\u0644\u0627\u062C\u064A\u0629", "\u0627\u0644\u062E\u0637\u0637 \u0627\u0644\u0625\u062B\u0631\u0627\u0626\u064A\u0629", "\u062A\u0643\u0631\u064A\u0645 \u0627\u0644\u0645\u062A\u0645\u064A\u0632\u064A\u0646"],
      requiredEvidence: ["\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0642\u0628\u0644\u064A \u0648\u0627\u0644\u0628\u0639\u062F\u064A", "\u0643\u0634\u0641 \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0644\u0627\u0628"],
      keywords: ["\u0641\u0627\u0642\u062F", "\u062A\u0639\u0644\u064A\u0645\u064A", "\u0639\u0644\u0627\u062C\u064A", "\u0625\u062B\u0631\u0627\u0626\u064A", "\u062A\u062D\u0633\u064A\u0646", "\u0646\u062A\u0627\u0626\u062C", "\u0645\u062A\u0645\u064A\u0632", "\u0636\u0639\u064A\u0641", "\u062A\u0643\u0631\u064A\u0645"]
    },
    {
      id: 6,
      title: "\u0625\u0639\u062F\u0627\u062F \u0648\u062A\u0646\u0641\u064A\u0630 \u062E\u0637\u0629 \u0627\u0644\u062A\u0639\u0644\u0645",
      weight: 10,
      examples: ["\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0646\u0647\u062C", "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0631\u0648\u0633", "\u0625\u0639\u062F\u0627\u062F \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A"],
      requiredEvidence: ["\u062E\u0637\u0629 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u0646\u0647\u062C", "\u0646\u0645\u0648\u0630\u062C \u0625\u0639\u062F\u0627\u062F \u0627\u0644\u062F\u0631\u0648\u0633", "\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u0648\u0627\u062C\u0628\u0627\u062A \u0648\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A"],
      keywords: ["\u0645\u0646\u0647\u062C", "\u062A\u0648\u0632\u064A\u0639", "\u062F\u0631\u0633", "\u0625\u0639\u062F\u0627\u062F", "\u062A\u062D\u0636\u064A\u0631", "\u0648\u0627\u062C\u0628", "\u0627\u062E\u062A\u0628\u0627\u0631", "\u062E\u0637\u0629", "\u062A\u0639\u0644\u0645"]
    },
    {
      id: 7,
      title: "\u062A\u0648\u0638\u064A\u0641 \u062A\u0642\u0646\u064A\u0627\u062A \u0648\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u0645",
      weight: 10,
      examples: ["\u062F\u0645\u062C \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0641\u064A \u0627\u0644\u062A\u0639\u0644\u064A\u0645", "\u0627\u0644\u062A\u0646\u0648\u064A\u0639 \u0641\u064A \u0627\u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629"],
      requiredEvidence: ["\u0635\u0648\u0631 \u0627\u0644\u0648\u0633\u0627\u0626\u0644 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629", "\u062A\u0642\u0631\u064A\u0631 \u0628\u0631\u0646\u0627\u0645\u062C \u062A\u0642\u0646\u064A"],
      keywords: ["\u062A\u0642\u0646\u064A\u0629", "\u0648\u0633\u064A\u0644\u0629", "\u062A\u0639\u0644\u064A\u0645\u064A\u0629", "\u0631\u0642\u0645\u064A", "\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", "\u0628\u0631\u0646\u0627\u0645\u062C", "\u062A\u0637\u0628\u064A\u0642", "\u062D\u0627\u0633\u0628", "\u062C\u0646\u064A\u0627\u0644\u064A", "\u0643\u0627\u0646\u0641\u0627"]
    },
    {
      id: 8,
      title: "\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
      weight: 5,
      examples: ["\u0645\u0631\u0627\u0639\u0627\u0629 \u062D\u0627\u062C\u0627\u062A \u0627\u0644\u0637\u0644\u0627\u0628", "\u0627\u0644\u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0646\u0641\u0633\u064A\u0629", "\u0627\u0644\u062A\u062D\u0641\u064A\u0632 \u0627\u0644\u0645\u0627\u062F\u064A \u0648\u0627\u0644\u0645\u0639\u0646\u0648\u064A"],
      requiredEvidence: ["\u062A\u0642\u0631\u064A\u0631 \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0637\u0644\u0627\u0628 \u062D\u0633\u0628 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u062A\u0639\u0644\u0645", "\u0646\u0645\u0627\u0630\u062C \u0627\u0644\u062A\u062D\u0641\u064A\u0632"],
      keywords: ["\u0628\u064A\u0626\u0629", "\u062A\u0639\u0644\u064A\u0645\u064A\u0629", "\u0635\u0641\u064A\u0629", "\u062A\u062D\u0641\u064A\u0632", "\u062A\u0647\u064A\u0626\u0629", "\u0646\u0641\u0633\u064A\u0629", "\u0623\u0646\u0645\u0627\u0637", "\u062A\u0639\u0644\u0645", "\u062D\u0627\u062C\u0627\u062A"]
    },
    {
      id: 9,
      title: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641\u064A\u0629",
      weight: 5,
      examples: ["\u0636\u0628\u0637 \u0633\u0644\u0648\u0643 \u0627\u0644\u0637\u0644\u0627\u0628", "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062D\u0636\u0648\u0631 \u0648\u0627\u0644\u063A\u064A\u0627\u0628", "\u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u0641\u0631\u0648\u0642 \u0627\u0644\u0641\u0631\u062F\u064A\u0629"],
      requiredEvidence: ["\u0643\u0634\u0641 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629", "\u062A\u0637\u0628\u064A\u0642 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u0641"],
      keywords: ["\u0625\u062F\u0627\u0631\u0629", "\u0635\u0641", "\u0635\u0641\u064A\u0629", "\u0633\u0644\u0648\u0643", "\u0636\u0628\u0637", "\u062D\u0636\u0648\u0631", "\u063A\u064A\u0627\u0628", "\u062A\u0623\u062E\u0631", "\u0627\u0646\u0636\u0628\u0627\u0637"]
    },
    {
      id: 10,
      title: "\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0645\u062A\u0639\u0644\u0645\u064A\u0646",
      weight: 10,
      examples: ["\u062A\u062D\u0644\u064A\u0644 \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A", "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0637\u0644\u0627\u0628", "\u062A\u062D\u062F\u064A\u062F \u0646\u0642\u0627\u0637 \u0627\u0644\u0642\u0648\u0629 \u0648\u0627\u0644\u0636\u0639\u0641"],
      requiredEvidence: ["\u062A\u0642\u0631\u064A\u0631 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u062A\u0627\u0626\u062C", "\u0633\u062C\u0644 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0641\u0627\u0642\u062F \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A"],
      keywords: ["\u062A\u062D\u0644\u064A\u0644", "\u0646\u062A\u0627\u0626\u062C", "\u0627\u062E\u062A\u0628\u0627\u0631", "\u062A\u0635\u0646\u064A\u0641", "\u0642\u0648\u0629", "\u0636\u0639\u0641", "\u0645\u0633\u062A\u0648\u0649", "\u062A\u0634\u062E\u064A\u0635", "\u0628\u064A\u0627\u0646\u0627\u062A"]
    },
    {
      id: 11,
      title: "\u062A\u0646\u0648\u0639 \u0623\u0633\u0627\u0644\u064A\u0628 \u0627\u0644\u062A\u0642\u0648\u064A\u0645",
      weight: 10,
      examples: ["\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0648\u0631\u0642\u064A\u0629 \u0648\u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629", "\u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0637\u0644\u0627\u0628\u064A\u0629", "\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0623\u062F\u0627\u0626\u064A\u0629", "\u0645\u0644\u0641\u0627\u062A \u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0637\u0644\u0627\u0628"],
      requiredEvidence: ["\u0646\u0645\u0627\u0630\u062C \u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A", "\u0645\u0644\u0641\u0627\u062A \u0625\u0646\u062C\u0627\u0632 \u0627\u0644\u0637\u0644\u0627\u0628", "\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u0623\u062F\u0627\u0626\u064A\u0629", "\u0645\u0634\u0627\u0631\u064A\u0639 \u0627\u0644\u0637\u0644\u0627\u0628"],
      keywords: ["\u062A\u0642\u0648\u064A\u0645", "\u0627\u062E\u062A\u0628\u0627\u0631", "\u0645\u0634\u0631\u0648\u0639", "\u0645\u0647\u0645\u0629", "\u0623\u062F\u0627\u0626\u064A", "\u0645\u0644\u0641", "\u0625\u0646\u062C\u0627\u0632", "\u062A\u0642\u064A\u064A\u0645", "\u0642\u064A\u0627\u0633"]
    }
  ];
  function classifyForJobPerformance(title, description, fileName) {
    const text = `${title} ${description || ""} ${fileName || ""}`.toLowerCase();
    const results = [];
    for (const standard of JOB_PERFORMANCE_STANDARDS) {
      const matchedKeywords = [];
      let score = 0;
      for (const keyword of standard.keywords) {
        if (text.includes(keyword)) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }
      for (const evidence of standard.requiredEvidence) {
        const evidenceWords = evidence.toLowerCase().split(" ");
        for (const word of evidenceWords) {
          if (word.length > 2 && text.includes(word)) {
            score += 5;
          }
        }
      }
      const confidence = Math.min(100, score);
      if (confidence >= 20) {
        results.push({
          standardId: standard.id,
          confidence,
          matchedKeywords
        });
      }
    }
    return results.sort((a, b) => b.confidence - a.confidence);
  }
  var fileTypeHints = {
    "pdf": ["executive-reports", "plans", "certificates-honors"],
    "doc": ["executive-reports", "plans", "activities-worksheets"],
    "docx": ["executive-reports", "plans", "activities-worksheets"],
    "jpg": ["field-photos", "certificates-honors"],
    "jpeg": ["field-photos", "certificates-honors"],
    "png": ["field-photos", "certificates-honors"],
    "gif": ["field-photos"]
  };
  function classifyEvidence(title, description, fileName) {
    var _a;
    const text = `${title} ${description || ""}`.toLowerCase();
    const scores = {
      "executive-reports": 0,
      "initiatives-programs": 0,
      "plans": 0,
      "analysis-assessment": 0,
      "activities-worksheets": 0,
      "tests": 0,
      "field-photos": 0,
      "certificates-honors": 0
    };
    const matchedTags = [];
    for (const [tab, keywords] of Object.entries(tabKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          scores[tab] += 10;
          if (!matchedTags.includes(keyword)) {
            matchedTags.push(keyword);
          }
        }
      }
    }
    if (fileName) {
      const ext = (_a = fileName.split(".").pop()) == null ? void 0 : _a.toLowerCase();
      if (ext && fileTypeHints[ext]) {
        for (const hintTab of fileTypeHints[ext]) {
          scores[hintTab] += 5;
        }
      }
    }
    let bestTab = "executive-reports";
    let bestScore = 0;
    let totalScore = 0;
    for (const [tab, score] of Object.entries(scores)) {
      totalScore += score;
      if (score > bestScore) {
        bestScore = score;
        bestTab = tab;
      }
    }
    const confidence = totalScore > 0 ? Math.min(100, Math.round(bestScore / Math.max(totalScore, 1) * 100 * (bestScore / 20))) : 0;
    return {
      tab: bestTab,
      type: typeByTab[bestTab],
      tags: matchedTags.slice(0, 5),
      // Limit to 5 tags
      confidence: Math.max(10, Math.min(100, confidence)),
      // At least 10% confidence
      suggestedPortfolioLinks: portfolioSuggestions[bestTab] || []
    };
  }
  function checkDuplicateWindow(fileName, fileSize, existingItems, windowMinutes = 10) {
    if (!fileName) {
      return { isDuplicate: false };
    }
    const now = /* @__PURE__ */ new Date();
    const windowMs = windowMinutes * 60 * 1e3;
    for (const item of existingItems) {
      if (item.fileName === fileName) {
        const itemTime = new Date(item.createdAt).getTime();
        const timeDiff = now.getTime() - itemTime;
        if (timeDiff <= windowMs) {
          return {
            isDuplicate: true,
            existingEvidence: {
              id: item.id,
              title: item.title,
              createdAt: item.createdAt
            },
            message: `\u0645\u0644\u0641 \u0628\u0646\u0641\u0633 \u0627\u0644\u0627\u0633\u0645 "${fileName}" \u062A\u0645 \u0631\u0641\u0639\u0647 \u0642\u0628\u0644 ${Math.round(timeDiff / 6e4)} \u062F\u0642\u064A\u0642\u0629`
          };
        }
      }
    }
    return { isDuplicate: false };
  }
  function getTabLabel(tab) {
    const labels = {
      "executive-reports": "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u062A\u0646\u0641\u064A\u0630\u064A\u0629",
      "initiatives-programs": "\u0627\u0644\u0645\u0628\u0627\u062F\u0631\u0627\u062A \u0648\u0627\u0644\u0628\u0631\u0627\u0645\u062C",
      "plans": "\u0627\u0644\u062E\u0637\u0637",
      "analysis-assessment": "\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0648\u0627\u0644\u062A\u0642\u0648\u064A\u0645",
      "activities-worksheets": "\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0648\u0623\u0648\u0631\u0627\u0642 \u0627\u0644\u0639\u0645\u0644",
      "tests": "\u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A",
      "field-photos": "\u0627\u0644\u0635\u0648\u0631 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629",
      "certificates-honors": "\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u062A\u0643\u0631\u064A\u0645"
    };
    return labels[tab] || tab;
  }
  function getTypeLabel(type) {
    const labels = {
      "report": "\u062A\u0642\u0631\u064A\u0631",
      "initiative": "\u0645\u0628\u0627\u062F\u0631\u0629",
      "plan": "\u062E\u0637\u0629",
      "analysis": "\u062A\u062D\u0644\u064A\u0644",
      "worksheet": "\u0648\u0631\u0642\u0629 \u0639\u0645\u0644",
      "exam": "\u0627\u062E\u062A\u0628\u0627\u0631",
      "photo": "\u0635\u0648\u0631\u0629",
      "certificate": "\u0634\u0647\u0627\u062F\u0629"
    };
    return labels[type] || type;
  }
  var CONFIDENCE_THRESHOLDS = {
    AUTO_APPROVE: 80,
    // ≥80% auto-approve without review
    SUGGEST: 50,
    // 50-79% suggest with optional edit
    MANUAL: 0
    // <50% manual selection required
  };
  function getConfidenceLevel(confidence) {
    if (confidence >= CONFIDENCE_THRESHOLDS.AUTO_APPROVE) {
      return "auto";
    } else if (confidence >= CONFIDENCE_THRESHOLDS.SUGGEST) {
      return "suggest";
    }
    return "manual";
  }
  function getConfidenceLevelLabel(level) {
    const labels = {
      auto: "\u0627\u0639\u062A\u0645\u0627\u062F \u062A\u0644\u0642\u0627\u0626\u064A",
      suggest: "\u0645\u0642\u062A\u0631\u062D - \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0639\u062F\u064A\u0644",
      manual: "\u0627\u062E\u062A\u064A\u0627\u0631 \u064A\u062F\u0648\u064A"
    };
    return labels[level];
  }
  var feedbackLog = [];
  function logFeedback(entry) {
    const feedback = {
      ...entry,
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: /* @__PURE__ */ new Date()
    };
    feedbackLog.push(feedback);
    if (feedbackLog.length > 1e3) {
      feedbackLog.shift();
    }
  }
  function getFeedbackStats() {
    const tabCorrections = {
      "executive-reports": 0,
      "initiatives-programs": 0,
      "plans": 0,
      "analysis-assessment": 0,
      "activities-worksheets": 0,
      "tests": 0,
      "field-photos": 0,
      "certificates-honors": 0
    };
    let totalConfidence = 0;
    let correctionCount = 0;
    for (const entry of feedbackLog) {
      if (entry.correctedTab && entry.correctedTab !== entry.originalTab) {
        tabCorrections[entry.originalTab]++;
        totalConfidence += entry.originalConfidence;
        correctionCount++;
      }
    }
    return {
      totalCorrections: correctionCount,
      tabCorrections,
      averageConfidenceWhenCorrected: correctionCount > 0 ? Math.round(totalConfidence / correctionCount) : 0
    };
  }
  function getRecentFeedback(limit = 50) {
    return feedbackLog.slice(-limit).reverse();
  }
  var crossLinkMatrix = {
    "executive-reports": ["analysis-assessment"],
    // Reports often contain analysis
    "initiatives-programs": ["plans", "activities-worksheets"],
    // Programs relate to plans
    "plans": ["activities-worksheets", "tests"],
    // Plans may include worksheets
    "analysis-assessment": ["executive-reports", "tests"],
    // Analysis links to reports/tests
    "activities-worksheets": ["tests", "plans"],
    // Worksheets relate to tests
    "tests": ["analysis-assessment", "activities-worksheets"],
    // Tests link to analysis
    "field-photos": ["executive-reports", "initiatives-programs"],
    // Photos document activities
    "certificates-honors": ["executive-reports"]
    // Certs documented in reports
  };
  function suggestCrossLinks(primaryTab, title, description) {
    const suggestions = [];
    const relatedTabs = crossLinkMatrix[primaryTab] || [];
    const text = `${title} ${description || ""}`.toLowerCase();
    for (const relatedTab of relatedTabs) {
      const keywords = tabKeywords[relatedTab];
      const matchCount = keywords.filter((k) => text.includes(k)).length;
      if (matchCount >= 2) {
        suggestions.push({
          tab: relatedTab,
          tabLabel: getTabLabel(relatedTab),
          reason: `\u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 ${matchCount} \u0643\u0644\u0645\u0627\u062A \u0645\u0641\u062A\u0627\u062D\u064A\u0629 \u0645\u0631\u062A\u0628\u0637\u0629`,
          standardNumbers: portfolioSuggestions[relatedTab] || []
        });
      }
    }
    return suggestions;
  }
  function processBulkUpload(items, existingItems) {
    const processedItems = [];
    let autoApproved = 0;
    let needsReview = 0;
    let manualRequired = 0;
    let duplicateWarnings = 0;
    for (const item of items) {
      const classification = classifyEvidence(item.title, item.description, item.fileName);
      const confidenceLevel = getConfidenceLevel(classification.confidence);
      const crossLinks = suggestCrossLinks(classification.tab, item.title, item.description);
      const duplicateWarning = item.fileName ? checkDuplicateWindow(item.fileName, item.fileSize, existingItems) : void 0;
      if (confidenceLevel === "auto") autoApproved++;
      else if (confidenceLevel === "suggest") needsReview++;
      else manualRequired++;
      if (duplicateWarning == null ? void 0 : duplicateWarning.isDuplicate) duplicateWarnings++;
      processedItems.push({
        title: item.title,
        description: item.description,
        fileName: item.fileName,
        fileSize: item.fileSize,
        classification,
        confidenceLevel,
        crossLinks,
        duplicateWarning
      });
    }
    const canAutoApproveAll = manualRequired === 0 && duplicateWarnings === 0;
    const summaryParts = [];
    if (autoApproved > 0) summaryParts.push(`${autoApproved} \u0644\u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A`);
    if (needsReview > 0) summaryParts.push(`${needsReview} \u0644\u0644\u0645\u0631\u0627\u062C\u0639\u0629`);
    if (manualRequired > 0) summaryParts.push(`${manualRequired} \u0644\u0644\u0627\u062E\u062A\u064A\u0627\u0631 \u0627\u0644\u064A\u062F\u0648\u064A`);
    if (duplicateWarnings > 0) summaryParts.push(`${duplicateWarnings} \u062A\u062D\u0630\u064A\u0631 \u062A\u0643\u0631\u0627\u0631`);
    return {
      totalItems: items.length,
      autoApproved,
      needsReview,
      manualRequired,
      duplicateWarnings,
      items: processedItems,
      canAutoApproveAll,
      summary: summaryParts.join(" | ") || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0644\u0641\u0627\u062A"
    };
  }
  function classifyEvidenceV2(title, description, fileName) {
    const baseResult = classifyEvidence(title, description, fileName);
    const confidenceLevel = getConfidenceLevel(baseResult.confidence);
    const crossLinks = suggestCrossLinks(baseResult.tab, title, description);
    return {
      ...baseResult,
      confidenceLevel,
      confidenceLevelLabel: getConfidenceLevelLabel(confidenceLevel),
      crossLinks,
      requiresReview: confidenceLevel !== "auto"
    };
  }
  return __toCommonJS(brain_pack_exports);
})();

window.BrainPack=BrainPack;
