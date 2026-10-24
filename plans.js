/* الخطط العلاجية والإثرائية — وحدة ثابتة داخل ملف إنجاز المعلم
   - خطة علاجية فردية / خطة علاجية جماعية / خطة إثرائية
   - تتعبأ تلقائيًا من بيانات الطلاب (رموز الإنجاز) الموجودة في Firestore
   - كل خطة تُسجَّل شاهدًا في ملف الإنجاز (المعيار 5 تحسين نتائج المتعلمين، والمعيار 10 للتحليل)
   تعتمد على: getTeacherDb, esc, TOPIC_TITLES, canonicalizeClass, window.PFui (من portfolio.js) */
(function () {
  "use strict";

  var TYPES = {
    remedial: { label: "خطة علاجية فردية", icon: "🩹", std: [5, 10] },
    group: { label: "خطة علاجية جماعية", icon: "👥", std: [5, 10] },
    enrichment: { label: "خطة إثرائية", icon: "🌟", std: [5] },
    disciplinary: { label: "خطة انضباطية", icon: "📋", std: [9] }
  };

  // تصنيفات المشكلات السلوكية وإجراءات علاج كل تصنيف (مأخوذة من مشروعك الأصلي، وأُضيف التحدث والشغب)
  var BEH = {"sleeping": {"label": "النوم داخل الصف", "procedures": ["التدخل الفوري: إيقاظ الطالب بلطف + تغيير مكانه للصف الأمامي", "الحوار المهني: مناقشة الطالب منفرداً لمعرفة الأسباب (سهر/إرهاق)", "الإجراء التصحيحي: إشعار ولي الأمر بضعف التركيز الناتج عن النوم", "المتابعة المستمرة: إشراك الطالب في أنشطة تفاعلية/حركية أثناء الحصة"]}, "tardiness": {"label": "التأخر الدراسي/الصفي", "procedures": ["التوثيق الرقمي: تسجيل وقت الدخول وتكرار الحالة", "التنبيه التربوي: توجيه شفاهي خاص يوضح قيمة الوقت وما فاته من الدرس", "الإجراء القانوني: في حال التكرار، توقيع تعهد خطي بالالتزام"]}, "lowAchievement": {"label": "تدني المستوى الدراسي", "procedures": ["التشخيص: تحديد السبب (ضعف دافعية / صعوبات تعلم)", "تفريد التعليم: تقديم مهام تعليمية مجزأة تناسب مستوى الطالب", "التحفيز: تعزيز فوري ومكافآت عند رصد أي تحسن", "الدعم المؤسسي: حصص علاجية + تنسيق مع المرشد الطلابي"]}, "homeworkNeglect": {"label": "إهمال الواجبات", "procedures": ["التأكيد على الكيف لا الكم في الواجبات المنزلية", "تطبيق قواعد السلوك والمتابعة اليومية", "التواصل مع ولي الأمر لمتابعة أداء الواجبات", "تقديم واجبات متدرجة تناسب مستوى الطالب"]}, "frequentAbsence": {"label": "الغياب المتكرر", "procedures": ["توضيح أثر الغياب على المعدل التراكمي والتحصيل", "التوثيق المنتظم لأيام الغياب وتكراره", "التواصل المباشر مع ولي الأمر عند كل غياب", "التحويل للمرشد الطلابي لبحث الأسباب والمعالجة"]}, "talking": {"label": "التحدث أثناء الدرس", "procedures": ["التنبيه غير المباشر: الاقتراب من الطالب وتوجيه سؤال له لإعادة انتباهه", "تغيير مكان الجلوس بعيداً عن مصادر التشتت", "الحوار الفردي: توضيح أثر الحديث الجانبي على تركيز الزملاء", "إسناد مهمة تفاعلية له أثناء الحصة", "إشعار ولي الأمر عند تكرار الحالة"]}, "misbehavior": {"label": "إثارة الشغب وعدم الانضباط", "procedures": ["وضع قواعد صفية واضحة بمشاركة الطلاب", "التعزيز الإيجابي للسلوك المنضبط أمام الزملاء", "الحوار الفردي لمعرفة دوافع السلوك", "تفويض مهام قيادية مناسبة للطالب", "التنسيق مع المرشد الطلابي وولي الأمر عند التكرار"]}};
  // نوع الملاحظة في سجل السلوك بلوحة المعلم ← تصنيف الخطة
  var BEH_MAP = { "نوم": "sleeping", "حديث": "talking", "شغب": "misbehavior" };

  var OPT = {
    deficiency: ["قلة المشاركة الصفية", "ضعف المستوى التحصيلي", "إهمال الواجبات المنزلية", "كثرة الغياب", "ظروف أسرية وعدم متابعة الأسرة", "ضعف حاسة السمع أو البصر", "عوامل نفسية وبيولوجية"],
    treatments: ["أوراق عمل إضافية", "اختبارات إلكترونية", "تدريس أقران", "مقاطع فيديو", "التشجيع على المشاركة", "استخدام التعزيز", "التنوع في الأسئلة وأساليب التقويم", "تقديم حوافز متنوعة", "الابتكار والتجديد في طرق التدريس", "توجيه الطلاب إلى عرض أفكارهم", "الوقوف على أخطائهم والطلب منهم تصحيحها", "تجارب عملية مبسطة", "رسوم ومخططات توضيحية"],
    procedures: ["لقاء فردي", "لقاء مع المرشد/ة", "تواصل مع ولي الأمر", "متابعة يومية للواجبات", "التركيز على جوانب الضعف وشرحها والنتائج المتوقعة", "حثهم للاستفادة من القنوات التعليمية"],
    impact: ["تحسن بطيء", "جيد", "جيد جداً", "تحسن سريع"],
    gWeak: ["قلة المشاركة الصفية", "ضعف المستوى التحصيلي", "إهمال الواجبات المنزلية", "كثرة الغياب", "ظروف أسرية", "عدم متابعة الأسرة", "ضعف حاسة البصر", "ضعف حاسة السمع", "عوامل نفسية وبيولوجية"],
    gProc: ["لقاء ولي الأمر", "لقاء مع الطالب/ة", "لقاء مع الموجه الطلابي", "تواصل مع ولي الأمر"],
    gTreat: ["إشراكهم في نشاط أو حوار بمجموعة", "محاورة مجموعة", "أسئلة وأساليب التقويم", "تخصيص مجموعة للطلاب", "التشجيع على المشاركة", "الابتكار والتجديد في طرق التدريس", "إسناد دور في أوراق عمل أو أنشطة صفية", "استخدام التعزيز", "تدريس الأقران"],
    gRate: ["ممتاز", "جيد جداً", "جيد", "مقبول", "تحسن بطيء"],
    distinction: ["التفاعل في الألعاب التعليمية", "طرح أسئلة تدل على الفهم العميق", "استخدام التقنيات لدعم التعلم", "إجراء تجارب علمية بشكل مستقل"],
    motivation: ["تحديات منزلية إثرائية", "ألعاب تعليمية تفاعلية", "ألغاز علمية", "روابط لحصص على يوتيوب", "مشاريع علمية مصغرة"],
    rewards: ["التكريم في الفصل", "التكريم في الطابور", "الثناء والتشجيع المعنوي", "شهادة شكر"],
    semester: ["الفصل الدراسي الأول", "الفصل الدراسي الثاني", "الفصل الدراسي الثالث"],
    quarter: ["الربع الأول", "الربع الثاني", "الربع الثالث", "الربع الرابع"],
    dGoals: ["تحسين نواتج التعلم ورفع مؤشرات أداء \"نافس\"", "تعزيز الانضباط السلوكي ومعالجة ظواهر الغياب والتأخر"],
    dJust: ["رصد تدني في مستويات بعض الطلاب", "تحديات في الضبط الصفي (خاصة الحصص الأخيرة) وحالات عدم انضباط"],
    dMeans: ["التقنية: تفعيل منصات (Wordwall, Padlet, ThingLink) وتطبيقات \"نافس\"", "السلوك: استخدام أداة \"بيان\" للتعزيز، وإلزام الطلاب بتدوين الملحوظات", "التواصل: التنسيق المباشر مع أولياء الأمور ووكيل شؤون الطلاب", "التطوير: تبادل الزيارات المهنية والحصص التطبيقية بين الزملاء"],
    dSteps: ["الحوار الفردي: تعديل السلوك بخصوصية تامة", "التواصل الأسري: بناء خطة مشتركة مع ولي الأمر", "التحويل الإداري: تحويل الحالة للمرشد الطلابي عند عدم الاستجابة"],
    behProcs: []
  };

  // t: text | area | select | checks | num | date
  var SCHEMA = {
    remedial: [
      { k: "studentName", l: "اسم الطالب", t: "text", list: true, req: true },
      { k: "subject", l: "المادة", t: "text", def: "العلوم" },
      { k: "grade", l: "الصف", t: "text", def: "الثاني المتوسط" },
      { k: "targetSkills", l: "المهارات / الموضوعات المستهدفة (كل واحدة في سطر)", t: "area" },
      { k: "deficiencyReasons", l: "أسباب الضعف", t: "checks", o: "deficiency" },
      { k: "treatments", l: "طرق العلاج", t: "checks", o: "treatments" },
      { k: "procedures", l: "الإجراءات المتخذة", t: "checks", o: "procedures" },
      { k: "preTestWeek", l: "أسبوع الاختبار القبلي", t: "num" },
      { k: "postTestWeek", l: "أسبوع الاختبار البعدي", t: "num" },
      { k: "preTestScore", l: "درجة الاختبار القبلي (من 100)", t: "num" },
      { k: "postTestScore", l: "درجة الاختبار البعدي (من 100)", t: "num" },
      { k: "planImpact", l: "أثر الخطة", t: "select", o: "impact" },
      { k: "resultsAnalysis", l: "تحليل النتائج ونسبة التحسن", t: "area" },
      { k: "teacherName", l: "اسم المعلم", t: "text", prof: "name" },
      { k: "planDate", l: "التاريخ", t: "date" }
    ],
    group: [
      { k: "subject", l: "المادة", t: "text", def: "العلوم" },
      { k: "gradeClass", l: "الصف / الفصل", t: "text", def: "الثاني المتوسط", req: true },
      { k: "studentNames", l: "أسماء الطلاب (كل اسم في سطر)", t: "area", req: true },
      { k: "weaknessAspects", l: "جوانب الضعف", t: "checks", o: "gWeak" },
      { k: "proceduresTaken", l: "الإجراءات المتخذة", t: "checks", o: "gProc" },
      { k: "treatmentMethods", l: "طرق العلاج", t: "checks", o: "gTreat" },
      { k: "improvementRate", l: "معدل التحسن", t: "select", o: "gRate" },
      { k: "followUpPeriod", l: "فترة المتابعة", t: "text" },
      { k: "notes", l: "ملاحظات", t: "area" },
      { k: "teacherName", l: "اسم المعلم", t: "text", prof: "name" },
      { k: "supervisorName", l: "اسم المشرف / المدير", t: "text", prof: "principal" },
      { k: "planDate", l: "التاريخ", t: "date" }
    ],
    disciplinary: [
      { k: "studentName", l: "اسم الطالب (اتركه فارغًا لخطة عامة)", t: "text", list: true },
      { k: "subject", l: "المادة", t: "text", def: "العلوم" },
      { k: "grade", l: "الصف", t: "text", def: "الثاني المتوسط" },
      { k: "behaviorCategory", l: "تصنيف المشكلة السلوكية", t: "select", o: "cats", req: true },
      { k: "behaviorProcedures", l: "إجراءات معالجة هذا التصنيف", t: "checks", o: "behProcs" },
      { k: "generalSteps", l: "الخطوات الإجرائية العامة (التسلسل المتدرج)", t: "checks", o: "dSteps", all: true },
      { k: "strategicGoals", l: "الأهداف الاستراتيجية", t: "checks", o: "dGoals", all: true },
      { k: "justifications", l: "مبررات الخطة", t: "checks", o: "dJust" },
      { k: "procedures", l: "إجراءات التنفيذ (الوسائل)", t: "checks", o: "dMeans", all: true },
      { k: "improvementIndicator", l: "مؤشر التحسن", t: "text", def: "انخفاض عدد حالات تكرار السلوك وتحسن مستوى الانضباط" },
      { k: "teacherName", l: "اسم المعلم", t: "text", prof: "name" },
      { k: "planDate", l: "التاريخ", t: "date" }
    ],
    enrichment: [
      { k: "subject", l: "المادة", t: "text", def: "العلوم" },
      { k: "gradeClass", l: "الصف / الفصل", t: "text", def: "الثاني المتوسط", req: true },
      { k: "studentNames", l: "أسماء الطلاب المتميزين (كل اسم في سطر)", t: "area", req: true },
      { k: "semester", l: "الفصل الدراسي", t: "select", o: "semester" },
      { k: "quarter", l: "الربع", t: "select", o: "quarter" },
      { k: "distinctionAspects", l: "جوانب التميز", t: "checks", o: "distinction" },
      { k: "motivationMethods", l: "أساليب التحفيز والإثراء", t: "checks", o: "motivation" },
      { k: "rewards", l: "المكافآت", t: "checks", o: "rewards" },
      { k: "followUpResults", l: "نتائج المتابعة", t: "area" },
      { k: "teacherAssistantRole", l: "دور مساعد المعلم (إن وجد)", t: "area" },
      { k: "teacherName", l: "اسم المعلم", t: "text", prof: "name" },
      { k: "planDate", l: "التاريخ", t: "date" }
    ]
  };

  var PL = { plans: [], students: [], records: {}, loaded: false, loading: false, mode: "list", type: "remedial", editing: null, fType: "", root: null, msg: "", ok: true };

  function $(id) { return document.getElementById(id); }
  function db() { return getTeacherDb(); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function profile() { return (window.PFui && window.PFui._state && window.PFui._state.profile) || {}; }
  function say(t, ok) { PL.msg = t; PL.ok = ok !== false; var el = $("pl-msg"); if (el) { el.textContent = t; el.style.color = PL.ok ? "#0e8f5f" : "#e11d48"; } }
  function round(n) { return Math.round(n * 10) / 10; }

  // ---------------- بيانات الطلاب من رموز الإنجاز ----------------
  function normNum(n) {
    var s = String(n == null ? "" : n).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); }).replace(/\s+/g, "");
    return /^\d+$/.test(s) ? String(parseInt(s, 10)) : s;
  }
  function clsOf(s) { return (typeof canonicalizeClass === "function" ? canonicalizeClass(s.decodedClass || s.studentClass || "") : (s.decodedClass || s.studentClass || "")) || "غير محدد"; }

  function buildStudents(docs) {
    var map = {};
    docs.forEach(function (s) {
      var num = normNum(s.decodedStudentNumber || s.rosterNumber || "");
      var cls = clsOf(s), name = s.studentName || s.decodedName || "بدون اسم";
      var key = cls + "#" + (num || name);
      var st = map[key] || (map[key] = { key: key, name: name, cls: cls, number: num, sessions: [], mastered: {}, attempted: {} });
      st.sessions.push({ ts: s.decodedTimestamp || "", correct: Number(s.correct) || 0, total: Number(s.total) || 0 });
      (s.mastered || []).forEach(function (m) { var n = parseInt(m, 10); if (!isNaN(n)) st.mastered[n] = 1; });
      (s.attempted || []).forEach(function (m) { var n = parseInt(m, 10); if (!isNaN(n)) st.attempted[n] = 1; });
      (s.solved || []).forEach(function (m) { var n = parseInt(m, 10); if (!isNaN(n)) st.attempted[n] = 1; });
    });
    return Object.keys(map).map(function (k) {
      var st = map[k];
      st.sessions.sort(function (a, b) { return a.ts.localeCompare(b.ts); });
      var tot = 0, cor = 0; st.sessions.forEach(function (x) { tot += x.total; cor += x.correct; });
      st.acc = tot ? Math.round((cor / tot) * 100) : null;
      st.masteredCount = Object.keys(st.mastered).length;
      var withTotals = st.sessions.filter(function (x) { return x.total > 0; });
      st.first = withTotals.length > 1 ? Math.round((withTotals[0].correct / withTotals[0].total) * 100) : null;
      st.last = withTotals.length > 1 ? Math.round((withTotals[withTotals.length - 1].correct / withTotals[withTotals.length - 1].total) * 100) : null;
      st.weak = Object.keys(st.attempted).map(Number).filter(function (i) { return !st.mastered[i]; }).sort(function (a, b) { return a - b; })
        .map(function (i) { return (typeof TOPIC_TITLES !== "undefined" && TOPIC_TITLES[i]) || ("موضوع " + i); });
      return st;
    }).sort(function (a, b) { return a.cls.localeCompare(b.cls, "ar", { numeric: true }) || (Number(a.number) || 9999) - (Number(b.number) || 9999); });
  }

  function findStudent(name) {
    var n = String(name || "").trim();
    for (var i = 0; i < PL.students.length; i++) if (PL.students[i].name === n) return PL.students[i];
    return null;
  }
  function impactFor(delta) { return delta >= 30 ? "تحسن سريع" : delta >= 15 ? "جيد جداً" : delta >= 5 ? "جيد" : "تحسن بطيء"; }

  // ---------------- التحميل ----------------
  function load() {
    var d = db(); if (!d) { say("تعذّر الاتصال بالخدمة.", false); return Promise.resolve(); }
    PL.loading = true;
    var p1 = d.collection("portfolio_plans").get().then(function (r) {
      PL.plans = r.docs.map(function (x) { var o = x.data(); o.id = x.id; return o; })
        .sort(function (a, b) { return (b.planDate || "").localeCompare(a.planDate || "") || (b.createdAt || 0) - (a.createdAt || 0); });
    });
    var p2 = d.collection("submissions").get().then(function (r) { PL.students = buildStudents(r.docs.map(function (x) { return x.data(); })); }).catch(function () { PL.students = []; });
    var p3 = d.collection("student_records").get().then(function (r) { PL.records = {}; r.docs.forEach(function (x) { PL.records[x.id] = x.data(); }); }).catch(function () { PL.records = {}; });
    return Promise.all([p1, p2, p3]).then(function () { PL.loaded = true; PL.loading = false; })
      .catch(function (e) { console.error(e); PL.loading = false; say("تعذّر تحميل الخطط. تأكد من نشر قواعد Firestore الجديدة.", false); });
  }

  // ---------------- النموذج ----------------
  function fieldHtml(f, v) {
    var inp = 'class="w-full border rounded-xl px-3 py-2 bg-transparent text-sm" style="border-color:var(--line)"';
    var val = v[f.k];
    if (val === undefined || val === "") {
      val = f.def !== undefined ? f.def : (f.prof ? (profile()[f.prof] || "") : (f.t === "date" ? today() : ""));
    }
    var lab = '<label class="text-xs font-bold">' + esc(f.l) + (f.req ? " *" : "") + "</label>";
    if (f.t === "text") return "<div>" + lab + '<input id="pl-' + f.k + '" ' + inp + (f.list ? ' list="pl-students"' : "") + ' value="' + esc(val) + '"' + (f.list ? ' oninput="PlansUI.onStudent()"' : "") + "></div>";
    if (f.t === "num") return "<div>" + lab + '<input id="pl-' + f.k + '" type="number" min="0" ' + inp + ' value="' + esc(val) + '"></div>';
    if (f.t === "date") return "<div>" + lab + '<input id="pl-' + f.k + '" type="date" ' + inp + ' value="' + esc(val) + '"></div>';
    if (f.t === "area") return "<div>" + lab + '<textarea id="pl-' + f.k + '" rows="3" ' + inp + ">" + esc(val) + "</textarea></div>";
    if (f.t === "select" && f.o === "cats") {
      return "<div>" + lab + '<select id="pl-' + f.k + '" ' + inp + ' onchange="PlansUI.onCat()"><option value="">اختر التصنيف…</option>' +
        Object.keys(BEH).map(function (k) { return '<option value="' + k + '" ' + (val === k ? "selected" : "") + ">" + esc(BEH[k].label) + "</option>"; }).join("") + "</select></div>";
    }
    if (f.t === "select") {
      return "<div>" + lab + '<select id="pl-' + f.k + '" ' + inp + '><option value="">—</option>' +
        OPT[f.o].map(function (o) { return '<option ' + (val === o ? "selected" : "") + ">" + esc(o) + "</option>"; }).join("") + "</select></div>";
    }
    // checks
    if (f.o === "behProcs") OPT.behProcs = (BEH[v.behaviorCategory] || { procedures: [] }).procedures.slice();
    var sel = Array.isArray(val) ? val : (f.all && !Array.isArray(v[f.k]) ? OPT[f.o].slice() : []);
    var other = sel.filter(function (x) { return OPT[f.o].indexOf(x) < 0; }).join("، ");
    return '<div id="pl-box-' + f.k + '">' + lab + '<div class="grid md:grid-cols-2">' + OPT[f.o].map(function (o, i) {
      return '<label class="flex items-center gap-2 py-1 text-sm" style="cursor:pointer"><input type="checkbox" id="pl-' + f.k + "-" + i + '" ' + (sel.indexOf(o) >= 0 ? "checked" : "") + "> " + esc(o) + "</label>";
    }).join("") + '</div><input id="pl-' + f.k + '-other" ' + inp + ' placeholder="أخرى (تُذكر)…" value="' + esc(other) + '"></div>';
  }

  function readForm(type) {
    var out = { type: type };
    SCHEMA[type].forEach(function (f) {
      if (f.t === "checks") {
        var arr = [];
        OPT[f.o].forEach(function (o, i) { var c = $("pl-" + f.k + "-" + i); if (c && c.checked) arr.push(o); });
        var oth = $("pl-" + f.k + "-other"); if (oth && oth.value.trim()) arr.push(oth.value.trim());
        out[f.k] = arr;
      } else { var el = $("pl-" + f.k); out[f.k] = el ? String(el.value).trim() : ""; }
    });
    return out;
  }

  function titleOf(p) {
    if (p.type === "remedial") return "خطة علاجية — " + (p.studentName || "");
    if (p.type === "disciplinary") return "خطة انضباطية — " + ((BEH[p.behaviorCategory] || {}).label || "") + (p.studentName ? " (" + p.studentName + ")" : "");
    if (p.type === "group") return "خطة علاجية جماعية — " + (p.gradeClass || "");
    return "خطة إثرائية — " + (p.gradeClass || "");
  }
  function summaryOf(p) {
    if (p.type === "disciplinary") return "معالجة: " + ((BEH[p.behaviorCategory] || {}).label || "") + " — " + (p.studentName || "خطة عامة") + " — " + ((p.behaviorProcedures || []).length) + " إجراء";
    if (p.type === "remedial") return "المهارات المستهدفة: " + String(p.targetSkills || "").replace(/\n/g, "، ");
    var n = String(p.studentNames || "").split("\n").filter(function (x) { return x.trim(); }).length;
    return (p.type === "group" ? "خطة علاجية جماعية" : "خطة إثرائية") + " لعدد " + n + " طالب";
  }

  function savePlan() {
    var type = PL.type, f = readForm(type), d = db();
    var req = SCHEMA[type].filter(function (x) { return x.req && !f[x.k]; });
    if (req.length) { say("أكمل الحقل: " + req[0].l, false); return; }
    var btn = $("pl-save"); if (btn) btn.disabled = true; say("جارٍ الحفظ…", true);
    var editing = PL.editing ? PL.plans.filter(function (x) { return x.id === PL.editing; })[0] : null;
    f.updatedAt = Date.now(); f.createdAt = editing ? (editing.createdAt || Date.now()) : Date.now();
    f.evidenceId = editing ? editing.evidenceId || "" : "";
    f.planDate = f.planDate || today();
    var ref = editing ? d.collection("portfolio_plans").doc(editing.id) : d.collection("portfolio_plans").doc();
    var ev = { title: titleOf(f), description: summaryOf(f), category: "plans", standards: TYPES[type].std.slice(), date: f.planDate };
    var PF = window.PFui;
    var evP = !PF ? Promise.resolve(f.evidenceId) :
      (f.evidenceId ? PF.updateEvidence(f.evidenceId, ev).then(function () { return f.evidenceId; }) : PF.addEvidence(ev));
    evP.then(function (eid) {
      f.evidenceId = eid || "";
      return ref.set(f).then(function () {
        f.id = ref.id;
        if (editing) PL.plans = PL.plans.map(function (x) { return x.id === ref.id ? f : x; }); else PL.plans.unshift(f);
        PL.mode = "list"; PL.editing = null; PL.msg = "✅ تم حفظ الخطة وإضافتها شاهدًا في ملف الإنجاز."; PL.ok = true; render();
      });
    }).catch(function (e) { console.error(e); if (btn) btn.disabled = false; say("تعذّر الحفظ.", false); });
  }

  function delPlan(id) {
    if (!confirm("حذف هذه الخطة نهائيًا (وشاهدها في ملف الإنجاز)؟")) return;
    var p = PL.plans.filter(function (x) { return x.id === id; })[0];
    var jobs = [db().collection("portfolio_plans").doc(id).delete()];
    if (p && p.evidenceId && window.PFui) jobs.push(window.PFui.removeEvidence(p.evidenceId));
    Promise.all(jobs).then(function () { PL.plans = PL.plans.filter(function (x) { return x.id !== id; }); PL.msg = "تم الحذف."; PL.ok = true; render(); })
      .catch(function () { say("تعذّر الحذف.", false); });
  }

  // ---------------- التعبئة التلقائية من بيانات الطلاب ----------------
  function setVal(id, v) { var el = $(id); if (el) el.value = v; }
  function recKeyLocal(cls, num) { return "2-" + String(cls).replace(/[أإآ]/g, "ا").replace(/\//g, "-") + "_" + normNum(num); }
  function behaviorOf(st) { var r = st && PL.records[recKeyLocal(st.cls, st.number)]; return (r && r.behaviors) || []; }
  function onCat() {
    var k = ($("pl-behaviorCategory") || {}).value, box = $("pl-box-behaviorProcedures"); if (!box) return;
    OPT.behProcs = (BEH[k] || { procedures: [] }).procedures.slice();
    var f = SCHEMA.disciplinary.filter(function (x) { return x.k === "behaviorProcedures"; })[0];
    var fake = {}; fake.behaviorCategory = k; fake.behaviorProcedures = OPT.behProcs.slice();
    var tmp = fieldHtml(f, fake); box.innerHTML = tmp.replace(/^<div id="[^"]+">/, "").replace(/<\/div>$/, "");
  }
  function fillDisc() {
    var st = findStudent($("pl-studentName").value), list = behaviorOf(st);
    if (!list.length) { say("لا توجد ملاحظات سلوك مسجّلة لهذا الطالب.", false); return; }
    var cnt = {}; list.forEach(function (b) { cnt[b.type] = (cnt[b.type] || 0) + 1; });
    var top = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; })[0];
    var dates = list.map(function (b) { return b.date || ""; }).filter(Boolean).sort();
    var cat = BEH_MAP[top];
    if (cat) { setVal("pl-behaviorCategory", cat); onCat(); }
    var txt = "سُجّل على الطالب " + list.length + " ملاحظة سلوكية" + (dates.length ? " خلال الفترة من " + dates[0] + " إلى " + dates[dates.length - 1] : "") + " حسب سجل السلوك.";
    var oth = $("pl-justifications-other"); if (oth) oth.value = txt;
    say("تمت التعبئة من سجل السلوك — راجعها وعدّلها.", true);
  }
  function onStudent() {
    var st = findStudent(($("pl-studentName") || {}).value);
    var hint = $("pl-auto"); if (!hint) return;
    if (PL.type === "disciplinary") {
      var bl = behaviorOf(st);
      hint.innerHTML = st && bl.length ? "📋 في سجل السلوك " + bl.length + " ملاحظة لهذا الطالب. " + '<button class="chip" style="font-size:.7rem" onclick="PlansUI.fillDisc()">🧠 تعبئة من سجل السلوك</button>' : "";
      return;
    }
    hint.innerHTML = st ? "📊 وُجدت بيانات الطالب: " + st.sessions.length + " جلسة، الدقة " + (st.acc == null ? "—" : st.acc + "%") + "، المتقن " + st.masteredCount + " موضوع. " +
      '<button class="chip" style="font-size:.7rem" onclick="PlansUI.fillStudent()">🧠 تعبئة الخطة من بياناته</button>' : "";
  }
  function fillStudent() {
    var st = findStudent($("pl-studentName").value); if (!st) { say("اختر اسمًا من القائمة.", false); return; }
    setVal("pl-targetSkills", st.weak.join("\n"));
    if (st.first != null) {
      setVal("pl-preTestScore", st.first); setVal("pl-postTestScore", st.last);
      var delta = st.last - st.first;
      setVal("pl-planImpact", impactFor(delta));
      setVal("pl-resultsAnalysis", "بلغت درجة الاختبار القبلي " + st.first + "% وبعد تنفيذ الخطة العلاجية أصبحت " + st.last + "% بنسبة تحسن " + (delta >= 0 ? "+" : "") + delta + "%.");
    }
    say("تمت التعبئة من بيانات الطالب — راجعها وعدّلها حسب الحاجة.", true);
  }
  function classPicker() {
    var cls = {}; PL.students.forEach(function (s) { cls[s.cls] = 1; });
    return Object.keys(cls).sort(function (a, b) { return a.localeCompare(b, "ar", { numeric: true }); });
  }
  function fillGroup(kind) {
    var c = ($("pl-pick") || {}).value, list = PL.students.filter(function (s) { return !c || s.cls === c; });
    var chosen = kind === "weak"
      ? list.filter(function (s) { return s.acc != null && s.acc < 60; }).sort(function (a, b) { return a.acc - b.acc; })
      : list.filter(function (s) { return s.acc != null && s.acc >= 90 && s.sessions.length >= 2; }).sort(function (a, b) { return b.acc - a.acc; });
    if (!chosen.length) { say(kind === "weak" ? "لا يوجد طلاب بدقة أقل من 60% في هذا الفصل." : "لا يوجد طلاب بدقة 90% فأكثر (بجلستين على الأقل).", false); return; }
    setVal("pl-studentNames", chosen.map(function (s) { return s.name; }).join("\n"));
    if (c) setVal("pl-gradeClass", "الثاني المتوسط / " + c);
    say("تم اختيار " + chosen.length + " طالب — يمكنك التعديل على القائمة.", true);
  }

  // ---------------- الطباعة ----------------
  function printPlan(id) {
    var p = PL.plans.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    var pr = profile(), rows = "";
    SCHEMA[p.type].forEach(function (f) {
      var v = p[f.k]; if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) return;
      if (f.o === "cats") v = (BEH[v] || {}).label || v;
      var txt = Array.isArray(v) ? "<ul>" + v.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : esc(v).replace(/\n/g, "<br>");
      rows += "<tr><th>" + esc(f.l.replace(/ \(.*\)/, "")) + "</th><td>" + txt + "</td></tr>";
    });
    var html = "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='utf-8'><title>" + esc(titleOf(p)) + "</title><style>" +
      "@page{size:A4;margin:14mm}body{font-family:Tahoma,Arial,sans-serif;font-size:13px;color:#111;line-height:1.8}" +
      ".top{display:flex;justify-content:space-between;font-size:12px;color:#333}h1{text-align:center;font-size:19px;margin:10px 0}" +
      "table{width:100%;border-collapse:collapse}th,td{border:1px solid #444;padding:6px 9px;text-align:right;vertical-align:top}" +
      "th{background:#e8f1f0;width:26%}ul{margin:0;padding-right:18px}.sig{display:flex;justify-content:space-between;margin-top:36px}</style></head><body>" +
      "<div class='top'><div>المملكة العربية السعودية<br>وزارة التعليم<br>" + esc(pr.school || "") + "</div><div style='text-align:left'>العام الدراسي: " + esc(pr.year || "") + "</div></div>" +
      "<h1>" + esc(TYPES[p.type].label) + " — " + esc(p.subject || "العلوم") + "</h1><table>" + rows + "</table>" +
      "<div class='sig'><div>المعلم: " + esc(p.teacherName || pr.name || "") + "<br>التوقيع: ..............</div><div>مدير المدرسة: " + esc(p.supervisorName || pr.principal || "") + "<br>التوقيع: ..............</div></div></body></html>";
    var w = window.open("", "_blank");
    if (!w) { say("المتصفح منع نافذة الطباعة. اسمح بالنوافذ المنبثقة.", false); return; }
    w.document.open(); w.document.write(html); w.document.close();
    setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 400);
  }

  // ---------------- الواجهة ----------------
  function render() {
    var root = PL.root; if (!root) return;
    if (!PL.loaded) { root.innerHTML = '<div class="card p-6 text-center">جارٍ تحميل الخطط…</div>'; if (!PL.loading) load().then(render); return; }
    var msg = '<div id="pl-msg" class="text-sm mb-2" style="color:' + (PL.ok ? "#0e8f5f" : "#e11d48") + '">' + esc(PL.msg || "") + "</div>";
    PL.msg = "";
    if (PL.mode === "form") { root.innerHTML = msg + formView(); onStudent(); return; }
    var chips = '<button class="chip ' + (PL.fType === "" ? "active" : "") + '" onclick="PlansUI.filter(\'\')">الكل (' + PL.plans.length + ")</button>" +
      Object.keys(TYPES).map(function (t) {
        var n = PL.plans.filter(function (p) { return p.type === t; }).length;
        return '<button class="chip ' + (PL.fType === t ? "active" : "") + '" onclick="PlansUI.filter(\'' + t + '\')">' + TYPES[t].icon + " " + TYPES[t].label + " (" + n + ")</button>";
      }).join("");
    var adds = Object.keys(TYPES).map(function (t) { return '<button class="btn btn-brand text-sm py-2 px-3" onclick="PlansUI.add(\'' + t + '\')">➕ ' + TYPES[t].label + "</button>"; }).join("");
    var list = PL.plans.filter(function (p) { return !PL.fType || p.type === PL.fType; }).map(function (p) {
      return '<div class="card p-3 mb-2"><div class="flex items-start justify-between gap-2"><div><div class="font-bold">' + TYPES[p.type].icon + " " + esc(titleOf(p)) + "</div>" +
        '<div class="text-xs mt-1" style="color:var(--sub)">' + esc(p.planDate || "") + " · " + esc(p.subject || "") + "</div>" +
        '<div class="text-sm mt-1">' + esc(summaryOf(p)) + "</div></div>" +
        '<div class="flex gap-1"><button class="btn btn-outline text-xs py-1 px-2" title="طباعة" onclick="PlansUI.print(\'' + p.id + '\')">🖨️</button>' +
        '<button class="btn btn-outline text-xs py-1 px-2" title="تعديل" onclick="PlansUI.edit(\'' + p.id + '\')">✏️</button>' +
        '<button class="btn btn-outline text-xs py-1 px-2" title="حذف" onclick="PlansUI.del(\'' + p.id + '\')">🗑️</button></div></div></div>';
    }).join("");
    root.innerHTML = msg + '<div class="flex gap-2 flex-wrap mb-3">' + adds + '</div><div class="flex gap-2 flex-wrap mb-3">' + chips + "</div>" +
      (list || '<div class="card p-6 text-center" style="color:var(--sub)">لا توجد خطط بعد. ابدأ بإضافة خطة جديدة.</div>') +
      '<p class="text-xs mt-3" style="color:var(--sub)">كل خطة تُحفظ تلقائيًا كشاهد في ملف الإنجاز (المعيار 5 تحسين نتائج المتعلمين' + "، والمعيار 10 للخطط العلاجية).</p>";
  }

  function formView() {
    var type = PL.type, e = PL.editing ? PL.plans.filter(function (x) { return x.id === PL.editing; })[0] : null, v = e || {};
    var extra = "";
    if (type === "remedial" || type === "disciplinary") {
      extra = '<datalist id="pl-students">' + PL.students.map(function (s) { return '<option value="' + esc(s.name) + '">'; }).join("") + "</datalist>" +
        '<div id="pl-auto" class="text-xs" style="color:#8a5a00"></div>' +
        (PL.students.length ? "" : '<div class="text-xs" style="color:var(--sub)">لا توجد بيانات طلاب بعد، أدخل الاسم يدويًا.</div>');
    } else {
      var cl = classPicker();
      extra = '<div class="card p-3" style="background:rgba(15,110,107,.05)"><div class="text-xs font-bold mb-2">🧠 اختيار الطلاب تلقائيًا من بيانات التطبيق</div>' +
        '<div class="flex gap-2 flex-wrap items-center"><select id="pl-pick" class="border rounded-xl px-3 py-2 bg-transparent text-sm" style="border-color:var(--line)"><option value="">كل الفصول</option>' +
        cl.map(function (c) { return '<option value="' + esc(c) + '">الفصل ' + esc(c) + "</option>"; }).join("") + "</select>" +
        (type === "group"
          ? '<button class="chip" onclick="PlansUI.pick(\'weak\')">الأقل أداءً (دقة أقل من 60%)</button>'
          : '<button class="chip" onclick="PlansUI.pick(\'top\')">المتفوقون (دقة 90% فأكثر)</button>') + "</div></div>";
    }
    return '<div class="card p-4"><h2 class="font-extrabold mb-3">' + (e ? "✏️ تعديل" : "➕") + " " + TYPES[type].icon + " " + TYPES[type].label + "</h2>" +
      '<div class="grid gap-3">' + extra + SCHEMA[type].map(function (f) { return fieldHtml(f, v); }).join("") +
      '<div class="flex gap-2"><button id="pl-save" class="btn btn-brand flex-1 py-2.5" onclick="PlansUI.save()">💾 حفظ الخطة</button>' +
      '<button class="btn btn-outline py-2.5 px-4" onclick="PlansUI.cancel()">إلغاء</button></div></div></div>';
  }

  window.PlansUI = {
    mount: function (root) { PL.root = root; render(); },
    add: function (t) { PL.type = t; PL.editing = null; PL.mode = "form"; render(); },
    edit: function (id) { var p = PL.plans.filter(function (x) { return x.id === id; })[0]; if (!p) return; PL.type = p.type; PL.editing = id; PL.mode = "form"; render(); },
    cancel: function () { PL.mode = "list"; PL.editing = null; render(); },
    filter: function (t) { PL.fType = t; render(); },
    onCat: onCat, fillDisc: fillDisc,
    save: savePlan, del: delPlan, print: printPlan, onStudent: onStudent, fillStudent: fillStudent, pick: fillGroup,
    _state: PL, _build: buildStudents, _read: readForm, _impact: impactFor
  };
})();
