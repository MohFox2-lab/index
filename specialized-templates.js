/* قوالب تخصصية v21 مبنية على بنك المهارات المرفق مع ملف إنجاز المعلم.
   الأهداف والإجراءات اقتراحات قابلة للتحرير وليست نصوصًا وزارية معتمدة. */
(function () {
  "use strict";

  var SUBJECT_LINKS = {
    "اللغة العربية": ["لغتي"],
    "اللغة الانجليزية": ["انجليزي"],
    "الفيزياء": ["فيزياء"],
    "الكيمياء": ["كيمياء"],
    "الاحياء": ["أحياء"],
    "العلوم": ["علوم"],
    "الرياضيات": ["رياضيات"],
    "الحاسب وتقنية المعلومات": ["المهارات الرقمية"]
  };

  var SUBJECT_DOMAINS = [
    { domain: "language", names: ["لغتي", "اللغة العربية", "انجليزي", "اللغة الانجليزية", "اللغة الصينية", "الكفايات اللغوية", "الكتابة الوظيفية والإبداعية"] },
    { domain: "math", names: ["رياضيات", "الرياضيات"] },
    { domain: "science", names: ["علوم", "العلوم", "أحياء", "الاحياء", "فيزياء", "الفيزياء", "كيمياء", "الكيمياء", "علم الأرض والفضاء"] },
    { domain: "islamic", names: ["الدراسات الإسلامية", "التوحيد والفقه", "التفسير", "الحديث", "التجويد"] },
    { domain: "social", names: ["الاجتماعيات"] },
    { domain: "digital", names: ["المهارات الرقمية", "الحاسب وتقنية المعلومات", "التصميم الرقمي", "المهارات الإدارية", "التنمية المستدامة"] },
    { domain: "art", names: ["التربية الفنية"] },
    { domain: "physical", names: ["التربية البدنية"] },
    { domain: "life", names: ["المهارات الحياتية"] }
  ];

  var EVIDENCE = {
    language: [
      "بطاقة رصد قراءة أو تحدث مرتبطة بالهدف، دون أسماء المتعلمين.",
      "عينة كتابة أو إجابة قصيرة بعد إخفاء بيانات صاحبها.",
      "تقويم قصير للمفردات أو الفهم مع نتيجة فعلية.",
      "مسودة قبل/بعد أو سجل ملاحظة يوضح التقدم."
    ],
    math: [
      "عينة حل مسألة تظهر خطوات التفكير، بعد إخفاء الاسم.",
      "بطاقة خروج أو سؤال تطبيقي مرتبط بالمهارة.",
      "سلم تقدير لدقة الحل أو تفسير الاستراتيجية.",
      "نتيجة قياس قبلي/بعدي إذا نُفذ القياسان فعلًا."
    ],
    science: [
      "ورقة ملاحظة أو تقرير نشاط عملي آمن مرتبط بالمفهوم.",
      "رسم/نموذج أو خريطة مفاهيم يوضح فهم المتعلم.",
      "سجل ملاحظة أداء أو إجابة تفسيرية بعد إخفاء الاسم.",
      "نتيجة تقويم قصير أو قياس قبلي/بعدي إذا نُفذ."
    ],
    islamic: [
      "بطاقة رصد أداء أو تلاوة وفق معيار معلن.",
      "إجابة تحريرية/شفهية أو تطبيق للمفهوم بعد إخفاء الاسم.",
      "قائمة تحقق للحفظ أو التجويد عند انطباقه.",
      "نتيجة تقويم قصير أو سجل متابعة فعلي."
    ],
    social: [
      "خريطة أو خط زمني مشروح من إنتاج المتعلم.",
      "ورقة تحليل مصدر/موقف أو إجابة تفسيرية بعد إخفاء الاسم.",
      "سلم تقدير للمناقشة أو العرض المرتبط بالهدف.",
      "بطاقة خروج أو نتيجة تقويم قصير."
    ],
    digital: [
      "منتج رقمي أو لقطة شاشة بعد إزالة الأسماء وبيانات الدخول.",
      "قائمة تحقق لمهارة استخدام الأداة أو خطوات الإنجاز.",
      "ملف مشروع أو سجل تعديل يوضح ما أنجزه المتعلم.",
      "سلم تقدير للمنتج أو المهمة التطبيقية."
    ],
    art: [
      "عينة عمل فني مع معيار تقييم واضح.",
      "صور مراحل العمل بعد التأكد من عدم ظهور بيانات شخصية.",
      "سلم تقدير للتقنية أو عناصر العمل الفني.",
      "تأمل قصير أو ملاحظة عن قرار فني اتخذه المتعلم."
    ],
    physical: [
      "بطاقة ملاحظة مهارة حركية بمعايير أداء محددة.",
      "سجل تقدم فردي مختصر دون أسماء عند المشاركة.",
      "قائمة تحقق للسلامة والمشاركة أثناء النشاط.",
      "ملاحظة أداء قبل/بعد إذا جُمعت فعليًا."
    ],
    life: [
      "قائمة ملاحظة لسلوك أو مهارة حياتية قابلة للرصد.",
      "ورقة موقف أو تطبيق عملي بعد إخفاء الاسم.",
      "سلم تقدير للمشاركة أو أداء المهمة.",
      "تأمل ذاتي مختصر أو بطاقة خروج."
    ],
    general: [
      "عينة عمل مجهولة الاسم مرتبطة بناتج التعلم.",
      "بطاقة ملاحظة أو أداة تقويم تكويني مستخدمة فعلًا.",
      "خطة/سجل تنفيذ يوضح الإجراء الذي نُفذ.",
      "نتائج القياس الفعلية فقط، إن وُجد قياس قبلي/بعدي."
    ]
  };

  var ORDINALS = [
    { number: 1, words: ["اول", "الاول"] },
    { number: 2, words: ["ثاني", "الثاني"] },
    { number: 3, words: ["ثالث", "الثالث"] },
    { number: 4, words: ["رابع", "الرابع"] },
    { number: 5, words: ["خامس", "الخامس"] },
    { number: 6, words: ["سادس", "السادس"] },
    { number: 7, words: ["سابع", "السابع"] },
    { number: 8, words: ["ثامن", "الثامن"] },
    { number: 9, words: ["تاسع", "التاسع"] },
    { number: 10, words: ["عاشر", "العاشر"] },
    { number: 11, words: ["حادي عشر", "الحادي عشر"] },
    { number: 12, words: ["ثاني عشر", "الثاني عشر"] }
  ];

  function normalize(value) {
    return String(value || "")
      .replace(/[ً-ٰٟ]/g, "")
      .replace(/[أإآ]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/ال/g, "")
      .replace(/[ـ]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function aliasKeys(subject) {
    var clean = normalize(subject), aliases = [];
    Object.keys(SUBJECT_LINKS).some(function (name) {
      if (normalize(name) === clean) { aliases = SUBJECT_LINKS[name]; return true; }
      return false;
    });
    return [String(subject || "")].concat(aliases);
  }

  function findSubjectKey(subject, skills) {
    var keys = Object.keys(skills || {}), candidates = aliasKeys(subject).map(normalize);
    for (var i = 0; i < keys.length; i++) {
      if (candidates.indexOf(normalize(keys[i])) >= 0) return keys[i];
    }
    return "";
  }

  function ordinalNumber(text) {
    var tokens = normalize(text).split(/[^ء-يa-z0-9]+/);
    for (var i = 0; i < ORDINALS.length; i++) {
      for (var j = 0; j < ORDINALS[i].words.length; j++) {
        var words = normalize(ORDINALS[i].words[j]).split(" ");
        for (var k = 0; k <= tokens.length - words.length; k++) {
          if (words.every(function (word, index) { return tokens[k + index] === word; })) return ORDINALS[i].number;
        }
      }
    }
    return 0;
  }

  function gradeInfo(text) {
    var value = normalize(text), stage = "";
    if (value.indexOf("ابتدائي") >= 0) stage = "ابتدائي";
    else if (value.indexOf("متوسط") >= 0) stage = "متوسط";
    else if (value.indexOf("ثانوي") >= 0) stage = "ثانوي";
    if (!stage && value.indexOf("رياض اطفال") >= 0) stage = "روضة";
    if (!stage) return null;
    var withoutTerm = value.replace(/فصل(?:\s+دراسي)?\s*(?:ال)?(?:اول|ثاني|ثالث)/g, " ");
    var termMatch = value.match(/فصل(?:\s+دراسي)?\s*(?:ال)?(اول|ثاني|ثالث)/);
    var term = termMatch ? ordinalNumber(termMatch[1]) : 0;
    return { stage: stage, number: ordinalNumber(withoutTerm), term: term };
  }
  function termNumber(text) {
    var value = normalize(text);
    if (/ثالث/.test(value)) return 3;
    if (/ثاني/.test(value)) return 2;
    if (/اول/.test(value)) return 1;
    return 0;
  }

  function toPairs(rows) {
    return (rows || []).map(function (row) {
      if (Array.isArray(row)) return { goal: row[0] || "", action: row[1] || "" };
      return { goal: (row && row.goal) || "", action: (row && row.action) || "" };
    }).filter(function (row) { return row.goal || row.action; });
  }

  function domainFor(subject) {
    var n = normalize(subject);
    for (var i = 0; i < SUBJECT_DOMAINS.length; i++) {
      if (SUBJECT_DOMAINS[i].names.some(function (name) { return normalize(name) === n; })) return SUBJECT_DOMAINS[i].domain;
    }
    return "general";
  }

  function evidenceFor(subject) {
    var domain = domainFor(subject), list = (EVIDENCE[domain] || EVIDENCE.general).slice();
    return list;
  }

  function groups(subject, grade, term, skills) {
    skills = skills || (typeof window !== "undefined" && window.SUBJECT_SKILLS) || {};
    if (!subject || !grade) return [];
    var key = findSubjectKey(subject, skills), data = key && skills[key], source = data && (data.grades || data);
    if (!source) return [fallbackGroup(subject, grade)];

    var wanted = gradeInfo(grade), wantedTerm = termNumber(term), matches = [];
    if (wanted && wanted.number) {
      Object.keys(source).forEach(function (groupKey) {
        var found = gradeInfo(groupKey);
        if (!found || found.stage !== wanted.stage || found.number !== wanted.number) return;
        if (wantedTerm && found.term && wantedTerm !== found.term) return;
        matches.push({ key: groupKey, label: groupKey, pairs: toPairs(source[groupKey]), fallback: false });
      });
      if (wantedTerm && matches.some(function (g) { var info = gradeInfo(g.key); return info && info.term === wantedTerm; })) {
        matches = matches.filter(function (g) { var info = gradeInfo(g.key); return info && info.term === wantedTerm; });
      } else if (matches.filter(function (g) { var info = gradeInfo(g.key); return info && info.term; }).length > 1) {
        matches = matches.filter(function (g) { var info = gradeInfo(g.key); return info && info.term; });
      }
    }
    if (wanted) {
      var stageGroups = Object.keys(source).filter(function (groupKey) {
        var found = gradeInfo(groupKey);
        return found && found.stage === wanted.stage && !found.number;
      }).map(function (groupKey) {
        return { key: groupKey, label: groupKey + " — محتوى عام للمرحلة", pairs: toPairs(source[groupKey]), fallback: true };
      });
      if (matches.length) return matches.concat(termNumber(term) ? [] : stageGroups);
      if (stageGroups.length) return stageGroups;
    }
    if (matches.length) return matches;

    if (source["عام"]) {
      return [{ key: "عام", label: "عام — يلزم تكييفه للصف والمقرر", pairs: toPairs(source["عام"]), fallback: true }];
    }
    return [fallbackGroup(subject, grade)];
  }

  function fallbackGroup(subject, grade) {
    return {
      key: "__general__",
      label: "قالب عام — لا توجد بيانات صفية مطابقة",
      fallback: true,
      pairs: [{
        goal: "أن يحقق المتعلم ناتج التعلم المحدد في " + subject + " للصف " + grade + " وفق معيار نجاح واضح من وثيقة المقرر.",
        action: "تحقق من ناتج التعلم في المقرر الحالي، ثم نفّذ تشخيصًا قصيرًا، وشرحًا أو نمذجة مناسبة للمادة، وتدريبًا متدرجًا، وتقويمًا تكوينيًا، وسجّل ما نُفذ فعلًا."
      }]
    };
  }

  function report(values) {
    values = values || {};
    var subject = values.subject || "المادة", grade = values.grade || values.gradeClass || "الصف";
    var goal = values.goal || "يُكتب ناتج التعلم بعد مراجعته في وثيقة المقرر الحالية.";
    var action = values.action || "يُحدد الإجراء بعد تشخيص احتياج المتعلمين.";
    var evidence = (values.evidence || []).filter(Boolean).join("؛ ");
    return "قالب تخصصي مقترح وغير معتمد كنص وزاري. المادة: " + subject + "؛ الصف/الفصل: " + grade + ". ناتج التعلم: " + goal + ". الإجراء المقترح: " + action + ". الشواهد الممكنة: " + (evidence || "تُحدد وفق ما نُفذ فعلًا") + ". تُستكمل النتائج ومؤشرات الأثر بعد جمع البيانات الفعلية، ولا تُسجل أعداد أو نتائج غير موثقة.";
  }

  window.PF_SPECIALIZED = {
    version: "21.0",
    groups: groups,
    evidence: evidenceFor,
    report: report,
    gradeInfo: gradeInfo,
    sources: [
      { title: "وزارة التعليم — الخطط الدراسية", url: "https://www.moe.gov.sa/ar/education/general-education/study-plans" },
      { title: "عين الإثرائية — المقررات الدراسية", url: "https://www.ien.edu.sa/Home/Dashbord" }
    ]
  };
})();
