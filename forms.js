/* محرّك النماذج المتخصصة في ملف إنجاز المعلم/ة
   - يعرض كل نماذج المصدر الأصلي (forms-catalog.js) + الخطط العلاجية للمواد (remedial-data.js) + خطة التحسين (subject-skills-data.js)
   - السجلات تُحفظ في Firestore ضمن portfolio_items بنوع workspaceType = "portfolio-form" (لا تتأثر بها عدّادات المعايير)
   - صور/مرفقات النماذج تُحفظ في portfolio_files بمعرّف: <معرّف السجل>__<معرّف الحقل>
   تعتمد على: getTeacherDb, esc, window.PFui (من portfolio.js), window.PF_FORMS */
(function () {
  "use strict";
  var REM_NAMES = { "admin-skills-remedial": "المهارات الإدارية", "arabic-remedial": "اللغة العربية", "art-education-remedial": "التربية الفنية", "biology-remedial": "الأحياء", "chemistry-remedial": "الكيمياء", "chinese-remedial": "اللغة الصينية", "critical-thinking-remedial": "التفكير الناقد", "digital-design-remedial": "التصميم الرقمي", "digital-skills-remedial": "المهارات الرقمية", "earth-space-remedial": "علم الأرض والفضاء", "english-remedial": "اللغة الإنجليزية", "functional-writing-remedial": "الكتابة الوظيفية والإبداعية", "hadith-remedial": "الحديث", "islamic-studies-remedial": "الدراسات الإسلامية", "islamic-studies-toheed-fiqh-remedial": "التوحيد والفقه", "language-competencies-remedial": "الكفايات اللغوية", "life-skills-remedial": "المهارات الحياتية والأسرية", "math-remedial": "الرياضيات", "physical-education-remedial": "التربية البدنية", "physics-remedial": "الفيزياء", "science-remedial": "العلوم", "social-studies-remedial": "الاجتماعيات", "sustainable-development-remedial": "التنمية المستدامة", "tafsir-remedial": "التفسير", "tajweed-remedial": "التجويد" };
  var SKILL_COLS = [["targetSkill", "المهارة المستهدفة"], ["deficiencyReason", "سبب القصور"], ["remedialPlan", "الخطة العلاجية"], ["treatmentProcedures", "إجراءات المعالجة"], ["expectedSpeed", "سرعة الاستجابة المتوقعة"], ["impact", "الأثر"]];
  var DEF_WEEKS = { preTestWeek: "الأسبوع الثاني", postTestWeek: "الأسبوع العاشر", treatmentStartWeek: "الأسبوع الثالث", treatmentEndWeek: "الأسبوع التاسع" };

  var S = { root: null, formId: null, editing: null, q: "", msg: "", ok: true, vals: null, busy: false };

  function esc2(x) { return (window.esc || function (v) { return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); })(x); }
  function attr(x) { return esc2(x).replace(/"/g, "&quot;"); }
  function db() { return getTeacherDb(); }
  function PF() { return window.PFui && window.PFui._state ? window.PFui._state : { items: [], profile: {} }; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function $(id) { return document.getElementById(id); }
  function loadScript(src, cb) {
    var s = document.createElement("script"); s.src = src; s.onload = function () { cb(true); }; s.onerror = function () { cb(false); }; document.body.appendChild(s);
  }

  // ---------------- تعريف النماذج (الثابتة + الخطط العلاجية للمواد) ----------------
  function remedialForms() {
    var RD = window.REMEDIAL_DATA; if (!RD) return [];
    return Object.keys(RD.subjects).map(function (k) {
      var nm = REM_NAMES[k] || RD.subjects[k].title || k;
      return { id: "rem:" + k, remKey: k, group: "الخطط العلاجية حسب المادة", icon: "🩹", title: "خطة علاجية — " + nm, subjName: nm, std: [5, 10], cat: "plans", table: "remedial_plans (" + k + ")", titleOf: ["studentName"], titlePrefix: "خطة علاجية " + nm + " — ", dateField: "createdDate", list: ["grade", "semester", "preTestScore"], fields: [] };
    });
  }
  function allForms() { return (window.PF_FORMS || []).concat(remedialForms()); }
  function getForm(id) { return allForms().filter(function (f) { return f.id === id; })[0]; }
  function recs(formId) {
    return PF().items.filter(function (x) { return x.workspaceType === "portfolio-form" && x.formId === formId; })
      .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }
  function counts() { var c = {}; PF().items.forEach(function (x) { if (x.workspaceType === "portfolio-form") c[x.formId] = (c[x.formId] || 0) + 1; }); return c; }

  // ---------------- منطق الخطط العلاجية ----------------
  function stageOf(g) { g = g || ""; return /ابتدائي/.test(g) ? "ابتدائي" : /متوسط/.test(g) ? "متوسط" : /ثانوي/.test(g) ? "ثانوي" : ""; }
  function remKeyFor(sub, v) {
    if (sub.stages) return sub.stages.length ? (v.stage + "|" + v.grade + "|" + (v.semester || "")) : "";
    if (sub.map[v.grade + "|" + (v.semester || "")] !== undefined) return v.grade + "|" + v.semester;
    return sub.grades.length ? v.grade : "_";
  }
  function remGrades(sub, v) {
    if (sub.gradesByStage) return sub.gradesByStage[v.stage] || [];
    return sub.grades || [];
  }
  function remDefaultSkills(form, v) {
    var RD = window.REMEDIAL_DATA, sub = RD.subjects[form.remKey], k = remKeyFor(sub, v), idx = sub.map[k];
    if (idx === undefined) return [];
    return RD.pool[idx].map(function (r) { var o = {}; SKILL_COLS.forEach(function (c, i) { o[c[0]] = r[i] || ""; }); return o; });
  }
  function remInit(form) {
    var RD = window.REMEDIAL_DATA, sub = RD.subjects[form.remKey], v = { studentName: "", teacherName: (PF().profile && PF().profile.name) || "", preTestScore: "", postTestScore: "" };
    Object.keys(DEF_WEEKS).forEach(function (k) { v[k] = DEF_WEEKS[k]; });
    v.semester = (sub.semesters && sub.semesters[0]) || "";
    if (sub.gradesByStage) { v.stage = ov(sub.stages[0]); v.grade = (sub.gradesByStage[v.stage] || [])[0] || ""; }
    else { v.grade = (sub.grades || [])[0] || ""; v.stage = stageOf(v.grade); }
    v.skills = remDefaultSkills(form, v);
    return v;
  }

  // ---------------- رسم الحقول ----------------
  function ov(o) { return typeof o === "string" ? o : o.value; }
  function ol(o) { return typeof o === "string" ? o : (o.label || o.value); }
  function inpCls() { return "w-full border rounded-xl px-3 py-2 bg-transparent"; }
  function fieldHtml(fd, v) {
    var val = v[fd.id], span = fd.span === 2 ? " md:col-span-2" : "", lab = '<label class="text-xs font-bold">' + esc2(fd.label) + "</label>";
    if (fd.sec) return '<div class="md:col-span-2 mt-2 pt-2 font-extrabold" style="border-top:1px dashed var(--line);color:var(--brand-dark)">' + esc2(fd.sec) + "</div>";
    var h = "";
    if (fd.type === "textarea") h = '<textarea data-f="' + fd.id + '" rows="3" class="' + inpCls() + '">' + esc2(val || "") + "</textarea>";
    else if (fd.type === "select") h = '<select data-f="' + fd.id + '" class="' + inpCls() + '">' + (fd.req ? "" : '<option value="">— اختر —</option>') + fd.options.map(function (o) { return '<option value="' + attr(ov(o)) + '"' + (val === ov(o) ? " selected" : "") + ">" + esc2(ol(o)) + "</option>"; }).join("") + "</select>";
    else if (fd.type === "list") h = '<textarea data-f="' + fd.id + '" data-t="list" rows="' + Math.max(3, Math.min(8, (val || []).length + 1)) + '" class="' + inpCls() + '" placeholder="عنصر في كل سطر">' + esc2((val || []).join("\n")) + "</textarea>";
    else if (fd.type === "checks") h = '<div class="flex flex-wrap gap-2 mt-1">' + fd.options.map(function (o) { return '<label class="chip" style="cursor:pointer"><input type="checkbox" data-ck="' + fd.id + '" value="' + attr(o) + '"' + ((val || []).indexOf(o) >= 0 ? " checked" : "") + "> " + esc2(o) + "</label>"; }).join("") + "</div>";
    else if (fd.type === "ratings") h = '<div class="grid gap-2 mt-1">' + fd.items.map(function (it, i) { var cur = (val || [])[i] || fd.options[0]; return '<div class="flex items-center gap-2"><span class="text-sm flex-1">' + (i + 1) + ". " + esc2(it) + '</span><select data-rt="' + fd.id + '" data-i="' + i + '" class="border rounded-xl px-2 py-1 bg-transparent">' + fd.options.map(function (o) { return "<option" + (cur === o ? " selected" : "") + ">" + esc2(o) + "</option>"; }).join("") + "</select></div>"; }).join("") + "</div>";
    else if (fd.type === "rows") h = rowsTable(fd.id, fd.cols, val || [], "rw");
    else if (fd.type === "image") { var m = val && val.has ? '<div class="text-xs mt-1">المرفق الحالي: ' + esc2(val.name || "ملف") + ' — اختيار ملف جديد يستبدله.</div>' : ""; h = '<input type="file" data-img="' + fd.id + '" accept="image/*,.pdf" class="w-full text-sm">' + m; }
    else if (fd.type === "imp-weeks") h = rowsTable(fd.id, [{ id: "name", label: "الأسبوع" }, { id: "from", label: "من" }, { id: "to", label: "إلى" }], val || [], "rw") + '<button type="button" class="btn btn-outline text-xs py-1 px-3 mt-2" onclick="window.PFFm.genWeeks()">⚙️ توليد الأسابيع تلقائيًا من التواريخ</button>';
    else if (fd.type === "imp-skills") h = impSkillsHtml();
    else if (fd.type === "students") h = studentsTable(fd, val || [], v.skills || []);
    else h = '<input data-f="' + fd.id + '" type="' + (fd.type === "date" ? "date" : fd.type === "number" ? "number" : "text") + '" class="' + inpCls() + '" value="' + attr(val == null ? "" : val) + '">';
    return '<div class="' + span.trim() + '">' + lab + h + "</div>";
  }
  function rowsTable(id, cols, rows, kind) {
    cols = cols.map(function (c) { return typeof c === "string" ? { id: c, label: c } : c; });
    var head = "<tr>" + cols.map(function (c) { return '<th class="p-1 text-xs">' + esc2(c.label) + "</th>"; }).join("") + "<th></th></tr>";
    var body = rows.map(function (r, i) { return rowTr(id, cols, r, i); }).join("");
    return '<div class="overflow-x-auto"><table class="w-full text-sm" data-rows="' + id + '"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div><button type="button" class="btn btn-outline text-xs py-1 px-3 mt-1" onclick="window.PFFm.addRow(\'' + id + '\')">➕ إضافة صف</button>';
  }
  function rowTr(id, cols, r, i) {
    return '<tr data-row="' + id + '">' + cols.map(function (c) { return '<td class="p-1"><input data-c="' + c.id + '" class="' + inpCls() + '" value="' + attr((r || {})[c.id] || "") + '"></td>'; }).join("") + '<td class="p-1"><button type="button" class="btn btn-outline text-xs py-1 px-2" onclick="this.closest(\'tr\').remove()">🗑️</button></td></tr>';
  }
  function studentsTable(fd, rows, skills) {
    var head = '<tr><th class="p-1 text-xs">الطالب/ة</th>' + skills.map(function (s) { return '<th class="p-1 text-xs">' + esc2(s) + "</th>"; }).join("") + '<th class="p-1 text-xs">الخطة المقترحة</th><th></th></tr>';
    var body = rows.map(function (r) { return stuTr(fd, r, skills); }).join("");
    return '<div class="overflow-x-auto"><table class="w-full text-sm" data-students="' + fd.id + '"><thead>' + head + "</thead><tbody>" + body + '</tbody></table></div><div class="flex gap-2 mt-1"><button type="button" class="btn btn-outline text-xs py-1 px-3" onclick="window.PFFm.addStudent()">➕ إضافة طالب</button><button type="button" class="btn btn-outline text-xs py-1 px-3" onclick="window.PFFm.calcPct()">🧮 احسب النسب من الجدول</button><button type="button" class="btn btn-outline text-xs py-1 px-3" onclick="window.PFFm.refreshStudents()">🔄 تحديث أعمدة المهارات</button></div>';
  }
  function stuTr(fd, r, skills) {
    r = r || {};
    return '<tr data-stu="1"><td class="p-1"><input data-c="name" class="' + inpCls() + '" value="' + attr(r.name || "") + '"></td>' + skills.map(function (s, i) { var cur = (r.skillStatuses || [])[i] || ""; return '<td class="p-1"><select data-st="' + i + '" class="border rounded-xl px-1 py-1 bg-transparent"><option value=""></option>' + fd.statuses.map(function (o) { return "<option" + (cur === o ? " selected" : "") + ">" + esc2(o) + "</option>"; }).join("") + "</select></td>"; }).join("") + '<td class="p-1"><select data-c="proposedPlan" class="border rounded-xl px-1 py-1 bg-transparent"><option value=""></option>' + fd.plans.map(function (o) { return "<option" + (r.proposedPlan === o ? " selected" : "") + ">" + esc2(o) + "</option>"; }).join("") + '</select></td><td class="p-1"><button type="button" class="btn btn-outline text-xs py-1 px-2" onclick="this.closest(\'tr\').remove()">🗑️</button></td></tr>';
  }
  function impSkillsHtml() {
    var SK = window.SUBJECT_SKILLS; if (!SK) return '<div class="text-xs" style="color:var(--sub)">⏳ جارٍ تحميل مهارات المواد…</div>';
    var subs = Object.keys(SK), selS = S.impSub || subs[0], gr = Object.keys(SK[selS] || {}), selG = S.impGr && gr.indexOf(S.impGr) >= 0 ? S.impGr : gr[0];
    return '<div class="grid md:grid-cols-4 gap-2"><select id="imp-sub" class="' + inpCls() + '" onchange="window.PFFm.impSub(this.value)">' + subs.map(function (s) { return "<option" + (s === selS ? " selected" : "") + ">" + esc2(s) + "</option>"; }).join("") + '</select><select id="imp-gr" class="' + inpCls() + '" onchange="window.PFFm.impGr(this.value)">' + gr.map(function (s) { return "<option" + (s === selG ? " selected" : "") + ">" + esc2(s) + "</option>"; }).join("") + '</select><input id="imp-n" type="number" min="1" max="12" value="3" class="' + inpCls() + '" title="العدد المطلوب"><button type="button" class="btn btn-outline text-sm py-2" onclick="window.PFFm.impFill()">⬇️ تعبئة من المهارات</button></div><div class="text-xs mt-1" style="color:var(--sub)">يُملأ حقلا الأهداف والإجراءات بأول (العدد) من مهارات المادة للصف المختار، ويمكنك تعديلها بعد ذلك.</div>';
  }

  // ---------------- قراءة النموذج من الشاشة ----------------
  function fieldsOf(form) {
    if (form.remKey) {
      var RD = window.REMEDIAL_DATA, sub = RD.subjects[form.remKey], F = [];
      F.push({ id: "studentName", label: "اسم الطالب/ة", type: "text" });
      if (sub.stages) F.push({ id: "stage", label: "المرحلة", type: "select", req: true, options: sub.stages });
      F.push({ id: "grade", label: "الصف", type: "select", req: true, options: remGrades(sub, S.vals || {}) });
      if ((sub.semesters || []).length) F.push({ id: "semester", label: "الفصل الدراسي", type: "select", req: true, options: sub.semesters });
      F.push({ id: "preTestWeek", label: "أسبوع الاختبار القبلي", type: "text" }, { id: "postTestWeek", label: "أسبوع الاختبار البعدي", type: "text" }, { id: "treatmentStartWeek", label: "بداية أسبوع المعالجة", type: "text" }, { id: "treatmentEndWeek", label: "نهاية أسبوع المعالجة", type: "text" }, { id: "preTestScore", label: "درجة الاختبار القبلي", type: "text" }, { id: "postTestScore", label: "درجة الاختبار البعدي", type: "text" }, { id: "teacherName", label: "اسم المعلم/ة", type: "text" });
      F.push({ id: "skills", label: "مهارات الخطة (يمكنك التعديل والإضافة والحذف)", type: "rows", span: 2, cols: SKILL_COLS.map(function (c) { return { id: c[0], label: c[1] }; }) });
      F.push({ id: "file", label: "مرفق (صورة أو PDF)", type: "image", span: 2 });
      return F;
    }
    return form.fields;
  }
  function collect(form) {
    var v = {}, F = fieldsOf(form);
    F.forEach(function (fd) {
      if (fd.sec) return;
      var t = fd.type;
      if (t === "list") { var el = document.querySelector('[data-f="' + fd.id + '"]'); v[fd.id] = el ? el.value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean) : []; }
      else if (t === "checks") { v[fd.id] = [].slice.call(document.querySelectorAll('[data-ck="' + fd.id + '"]:checked')).map(function (x) { return x.value; }); }
      else if (t === "ratings") { v[fd.id] = fd.items.map(function (_, i) { var e = document.querySelector('[data-rt="' + fd.id + '"][data-i="' + i + '"]'); return e ? e.value : ""; }); }
      else if (t === "rows" || t === "imp-weeks") { v[fd.id] = [].slice.call(document.querySelectorAll('tr[data-row="' + fd.id + '"]')).map(function (tr) { var o = {}; [].forEach.call(tr.querySelectorAll("[data-c]"), function (i) { o[i.getAttribute("data-c")] = i.value; }); return o; }); }
      else if (t === "students") { v[fd.id] = [].slice.call(document.querySelectorAll('tr[data-stu]')).map(function (tr) { var o = { skillStatuses: [] }; [].forEach.call(tr.querySelectorAll("[data-c]"), function (i) { o[i.getAttribute("data-c")] = i.value; }); [].forEach.call(tr.querySelectorAll("[data-st]"), function (i) { o.skillStatuses[+i.getAttribute("data-st")] = i.value; }); return o; }); }
      else if (t === "image") { v[fd.id] = (S.vals && S.vals[fd.id]) || null; }
      else if (t === "imp-skills") { /* لا قيمة */ }
      else { var e2 = document.querySelector('[data-f="' + fd.id + '"]'); v[fd.id] = e2 ? e2.value : ""; }
    });
    return v;
  }

  // ---------------- العرض ----------------
  function msgHtml() { return S.msg ? '<div class="card p-3 mb-3 text-sm font-bold" style="color:' + (S.ok ? "var(--brand-dark)" : "var(--danger)") + '">' + esc2(S.msg) + "</div>" : ""; }
  function render() {
    if (!S.root) return;
    var forms = allForms(), cnt = counts(), groups = {}, order = [];
    forms.forEach(function (f) { if (!groups[f.group]) { groups[f.group] = []; order.push(f.group); } groups[f.group].push(f); });
    var nav = order.map(function (g) { return '<div class="mb-3"><div class="font-extrabold text-sm mb-2">' + esc2(g) + '</div><div class="flex flex-wrap gap-2">' + groups[g].map(function (f) { return '<button class="chip ' + (S.formId === f.id ? "active" : "") + '" onclick="window.PFFm.open(\'' + f.id + '\')">' + f.icon + " " + esc2(f.title.replace("خطة علاجية — ", "")) + (cnt[f.id] ? " (" + cnt[f.id] + ")" : "") + "</button>"; }).join("") + "</div></div>"; }).join("");
    var head = '<div class="card p-4 mb-3"><div class="font-extrabold text-lg">📚 النماذج المتخصصة</div><p class="text-sm mt-1" style="color:var(--sub)">النماذج الكاملة من مشروع ملف الإنجاز الأصلي بكل حقولها، مع الخطط العلاجية لـ' + Object.keys(REM_NAMES).length + " مادة بمهاراتها الجاهزة. كل سجل يُحفظ في Firestore ويُسجَّل تلقائيًا شاهدًا في المعايير المناسبة.</p><button class=\"btn btn-outline text-sm py-2 px-3 mt-2\" onclick=\"window.PFFm.summary()\">🖨️ الملخص الشامل للإنجازات</button> <button class=\"btn btn-outline text-sm py-2 px-3 mt-2\" onclick=\"window.PFFm.smart()\">📥 الرفع الذكي للشواهد</button> <button class=\"btn btn-outline text-sm py-2 px-3 mt-2\" onclick=\"window.PFFm.guide()\">📖 دليل الشواهد المطلوبة (105)</button> <button class=\"btn btn-outline text-sm py-2 px-3 mt-2\" onclick=\"window.PFFm.exportAllExcel()\">📊 تصدير كل شيء Excel (.xlsx)</button></div>";
    var body = "";
    if (S.view === "smart" && !S.formId) body = smartHtml();
    else if (S.view === "guide" && !S.formId) body = guideHtml();
    else if (!S.formId) body = '<div class="card p-6 text-center" style="color:var(--sub)">اختر نموذجًا من الأعلى للبدء.</div>';
    else if (window.REMEDIAL_DATA === undefined && /^rem:/.test(S.formId)) body = '<div class="card p-6 text-center">⏳ جارٍ تحميل بيانات المهارات…</div>';
    else body = S.editing ? editorHtml() : listHtml();
    S.root.innerHTML = head + msgHtml() + nav + body;
  }
  function listHtml() {
    var form = getForm(S.formId); if (!form) return "";
    var q = (S.q || "").trim(), list = recs(S.formId).filter(function (r) { return !q || JSON.stringify(r.data || {}).indexOf(q) >= 0 || (r.title || "").indexOf(q) >= 0; });
    var rows = list.map(function (r) {
      var sub = (form.list || []).map(function (k) { var x = r.data && r.data[k]; return x ? esc2(typeof x === "object" ? "" : x) : ""; }).filter(Boolean).join(" · ");
      return '<div class="card p-3 mb-2"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><div class="font-bold">' + esc2(r.title) + '</div><div class="text-xs mt-1" style="color:var(--sub)">' + esc2(r.date || "") + (sub ? " · " + sub : "") + '</div></div><div class="flex gap-1 shrink-0"><button class="btn btn-outline text-xs py-1 px-2" onclick="window.PFFm.edit(\'' + r.id + '\')">✏️</button><button class="btn btn-outline text-xs py-1 px-2" onclick="window.PFFm.print(\'' + r.id + '\')">🖨️</button><button class="btn btn-outline text-xs py-1 px-2" onclick="window.PFFm.del(\'' + r.id + '\')">🗑️</button></div></div></div>';
    }).join("");
    return '<div class="flex flex-wrap items-center justify-between gap-2 mb-2"><h3 class="font-extrabold">' + form.icon + " " + esc2(form.title) + ' <span class="chip">' + list.length + ' سجل</span></h3><div class="flex flex-wrap gap-2"><button class="btn btn-brand text-sm py-2 px-4" onclick="window.PFFm.add()">➕ سجل جديد</button><button class="btn btn-outline text-sm py-2 px-3" onclick="window.PFFm.printAll()">🖨️ طباعة الكل</button><button class="btn btn-outline text-sm py-2 px-3" onclick="window.PFFm.exportForm()">⬇️ تصدير JSON</button><button class="btn btn-outline text-sm py-2 px-3" onclick="window.PFFm.exportExcel()">📊 تصدير Excel</button></div></div><input class="' + inpCls() + ' mb-3" placeholder="🔍 بحث في السجلات" value="' + attr(S.q) + '" oninput="window.PFFm.search(this.value)">' + (rows || '<div class="card p-6 text-center" style="color:var(--sub)">لا توجد سجلات بعد. اضغط «سجل جديد».</div>');
  }
  function editorHtml() {
    var form = getForm(S.formId), v = S.vals, F = fieldsOf(form);
    return '<div class="card p-4 mb-3"><h3 class="font-extrabold mb-3">' + (S.editing === "new" ? "سجل جديد" : "تعديل سجل") + " — " + esc2(form.title) + '</h3><div class="grid md:grid-cols-2 gap-3">' + F.map(function (fd) { return fieldHtml(fd, v); }).join("") + '</div><div class="flex gap-2 mt-4"><button class="btn btn-brand px-5 py-2" ' + (S.busy ? "disabled" : "") + ' onclick="window.PFFm.save()">💾 حفظ</button><button class="btn btn-outline px-5 py-2" onclick="window.PFFm.cancel()">إلغاء</button></div></div>';
  }

  // ---------------- العمليات ----------------
  function ensureData(form, cb) {
    var need = [];
    if (form.remKey && !window.REMEDIAL_DATA) need.push("remedial-data.js?v=1");
    if (form.id === "improvement-plan" && !window.SUBJECT_SKILLS) need.push("subject-skills-data.js?v=1");
    if (!need.length) { cb(); return; }
    var n = need.length, ok = true;
    need.forEach(function (src) { loadScript(src, function (r) { ok = ok && r; if (--n === 0) { if (!ok) { S.msg = "تعذّر تحميل ملف البيانات — تأكد من رفع remedial-data.js و subject-skills-data.js بجانب portfolio.js."; S.ok = false; } cb(); } }); });
  }
  function initVals(form) {
    if (form.remKey) return remInit(form);
    var v = {}; form.fields.forEach(function (fd) {
      if (fd.sec) return;
      if (fd.def !== undefined) v[fd.id] = fd.def;
      else if (fd.type === "list") v[fd.id] = (fd.def || []).slice();
      else if (fd.type === "ratings") v[fd.id] = fd.items.map(function () { return fd.options[0]; });
      else if (fd.type === "rows" || fd.type === "imp-weeks" || fd.type === "students") v[fd.id] = fd.type === "rows" ? [{}] : [];
      else if (fd.type === "checks") v[fd.id] = [];
      else if (fd.type === "date") v[fd.id] = fd.id === (form.dateField || "") ? today() : "";
      else v[fd.id] = "";
    });
    var p = PF().profile || {};
    ["school", "teacherName", "name"].forEach(function (k) { if (v[k] === "" && p[k === "teacherName" ? "name" : k]) v[k] = p[k === "teacherName" ? "name" : k]; });
    if (v.skills && form.id === "learning-loss" && !v.studentsData.length) v.studentsData = [{ name: "", skillStatuses: [], proposedPlan: "" }];
    return v;
  }
  function readImage(file) {
    return new Promise(function (res, rej) {
      if (/^image\//.test(file.type)) {
        var fr = new FileReader(); fr.onload = function () { var img = new Image(); img.onload = function () { var s = Math.min(1, 1400 / Math.max(img.width, img.height)), c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); var q = 0.85, out = c.toDataURL("image/jpeg", q); while (out.length > 800000 && q > 0.4) { q -= 0.1; out = c.toDataURL("image/jpeg", q); } res({ data: out, type: "image/jpeg", name: file.name.replace(/\.\w+$/, "") + ".jpg" }); }; img.onerror = function () { rej(new Error("تعذّر قراءة الصورة")); }; img.src = fr.result; }; fr.onerror = rej; fr.readAsDataURL(file);
      } else {
        if (file.size > 600 * 1024) { rej(new Error("الملف أكبر من 600 كيلوبايت. ارفعه على Google Drive وضع الرابط بدلًا منه.")); return; }
        var f2 = new FileReader(); f2.onload = function () { res({ data: f2.result, type: file.type || "application/octet-stream", name: file.name }); }; f2.onerror = rej; f2.readAsDataURL(file);
      }
    });
  }
  function titleOf(form, v) {
    var parts = (form.titleOf || []).map(function (k) { return v[k]; }).filter(Boolean);
    return ((form.titlePrefix || "") + parts.join(" — ")).trim() || form.title;
  }
  function summaryOf(form, v) {
    return fieldsOf(form).filter(function (fd) { return !fd.sec && /^(text|textarea|date|number|select)$/.test(fd.type) && v[fd.id]; }).slice(0, 6).map(function (fd) { return fd.label + ": " + v[fd.id]; }).join(" | ").slice(0, 600);
  }
  function save() {
    var form = getForm(S.formId); if (!form || S.busy) return;
    var v = collect(form), id = S.editing === "new" ? null : S.editing, old = id ? PF().items.filter(function (x) { return x.id === id; })[0] : null;
    if (form.remKey && !String(v.studentName || "").trim()) { S.msg = "أدخل اسم الطالب/ة أولًا."; S.ok = false; render(); return; }
    var title = titleOf(form, v), date = (form.dateField && v[form.dateField]) || (old && old.date) || today();
    if (!form.remKey && !(form.titleOf || []).some(function (k) { return v[k]; })) { S.msg = "عبّئ حقلًا واحدًا على الأقل من حقول العنوان (" + (form.titleOf || []).map(function (k) { var fd = form.fields.filter(function (x) { return x.id === k; })[0]; return fd ? fd.label : k; }).join(" / ") + ")."; S.ok = false; render(); return; }
    var d = db(); if (!d) { S.msg = "تعذّر الاتصال بالخدمة."; S.ok = false; render(); return; }
    S.busy = true;
    var ref = id ? d.collection("portfolio_items").doc(id) : d.collection("portfolio_items").doc(), rid = ref.id, jobs = [], fileFields = [];
    fieldsOf(form).forEach(function (fd) { if (fd.type !== "image") return; var inp = document.querySelector('[data-img="' + fd.id + '"]'), f = inp && inp.files && inp.files[0]; if (f) fileFields.push({ id: fd.id, file: f }); });
    Promise.all(fileFields.map(function (ff) { return readImage(ff.file).then(function (r) { return { id: ff.id, r: r }; }); })).then(function (imgs) {
      imgs.forEach(function (im) { jobs.push(d.collection("portfolio_files").doc(rid + "__" + im.id).set({ data: im.r.data, name: im.r.name, type: im.r.type })); v[im.id] = { has: true, name: im.r.name, type: im.r.type }; });
      fieldsOf(form).forEach(function (fd) { if (fd.type === "image" && !v[fd.id] && old && old.data && old.data[fd.id]) v[fd.id] = old.data[fd.id]; });
      var ev = { title: form.title.replace("خطة علاجية — ", "خطة علاجية: ") + " — " + title, description: summaryOf(form, v), category: form.cat, standards: form.std.slice(), date: date };
      var P = window.PFui, evp = (!P || !form.std.length) ? Promise.resolve((old && old.evidenceId) || "") : (old && old.evidenceId ? P.updateEvidence(old.evidenceId, ev).then(function () { return old.evidenceId; }) : P.addEvidence(ev));
      return evp.then(function (eid) {
        var doc = { workspaceType: "portfolio-form", formId: form.id, title: title, date: date, data: v, evidenceId: eid || "", createdAt: old ? old.createdAt || Date.now() : Date.now(), updatedAt: Date.now() };
        return Promise.all(jobs).then(function () { return ref.set(doc); }).then(function () { doc.id = rid; var items = PF().items, ix = items.findIndex(function (x) { return x.id === rid; }); if (ix >= 0) items[ix] = doc; else items.unshift(doc); });
      });
    }).then(function () { S.busy = false; S.editing = null; S.vals = null; S.msg = "تم حفظ السجل في Firestore وتسجيله شاهدًا في المعايير."; S.ok = true; render(); })
      .catch(function (e) { console.error(e); S.busy = false; S.msg = (e && e.message) || "تعذّر الحفظ. تحقق من الاتصال وقواعد Firestore."; S.ok = false; render(); });
  }
  function del(id) {
    var r = PF().items.filter(function (x) { return x.id === id; })[0]; if (!r || !confirm("حذف السجل «" + r.title + "»؟ لا يمكن التراجع.")) return;
    var d = db(), form = getForm(r.formId), jobs = [d.collection("portfolio_items").doc(id).delete()];
    if (form) fieldsOf(form).forEach(function (fd) { if (fd.type === "image" && r.data && r.data[fd.id] && r.data[fd.id].has) jobs.push(d.collection("portfolio_files").doc(id + "__" + fd.id).delete()); });
    if (r.evidenceId && window.PFui) jobs.push(window.PFui.removeEvidence(r.evidenceId));
    Promise.all(jobs).then(function () { var P = PF(); P.items = P.items.filter(function (x) { return x.id !== id; }); S.msg = "تم حذف السجل."; S.ok = true; render(); }).catch(function (e) { console.error(e); S.msg = "تعذّر الحذف."; S.ok = false; render(); });
  }

  // ---------------- الطباعة والتصدير ----------------
  // ترويسة رسمية (كليشة) كما في klishe-header.tsx: وزارة التعليم + الشعار + المنطقة/المدرسة + بيانات المعلم/ة
  var LOGO_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 200 200\" width=\"200\" height=\"200\"> <circle cx=\"100\" cy=\"100\" r=\"90\" fill=\"none\" stroke=\"#1a5c2e\" stroke-width=\"3\"/> <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"none\" stroke=\"#1a5c2e\" stroke-width=\"1\"/> <text x=\"100\" y=\"70\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"14\" fill=\"#1a5c2e\" font-weight=\"bold\">المملكة العربية</text> <text x=\"100\" y=\"90\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"14\" fill=\"#1a5c2e\" font-weight=\"bold\">السعودية</text> <text x=\"100\" y=\"120\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"16\" fill=\"#1a5c2e\" font-weight=\"bold\">وزارة التعليم</text> <text x=\"100\" y=\"145\" text-anchor=\"middle\" font-family=\"Arial\" font-size=\"11\" fill=\"#1a5c2e\">Ministry of Education</text> <path d=\"M85 155 L100 165 L115 155\" fill=\"none\" stroke=\"#1a5c2e\" stroke-width=\"2\"/> </svg>";
  function klishe(extra) {
    var p = PF().profile || {}, tp = ((recs("teacher-profile")[0] || {}).data) || {};
    var inf = { name: tp.name || p.name || "", school: tp.school || p.school || "", region: (extra && extra.region) || p.region || "" };
    if (window.PF_HEADER) return window.PF_HEADER(inf);
    return "<div style='border:2px solid #9ca3af;border-radius:10px;padding:10px;margin-bottom:14px;text-align:center'><b>المملكة العربية السعودية</b><br><b>وزارة التعليم</b><br><b>إعداد: ( منصة منهاج العلوم )</b><br><small>المنطقة: " + esc2(inf.region) + " — المدرسة: " + esc2(inf.school) + " — المعلم/ة: " + esc2(inf.name) + "</small></div>";
  }

  function valHtml(fd, v) {
    var x = v[fd.id]; if (x == null || x === "") return "—";
    if (fd.type === "list" || fd.type === "checks") return x.length ? "<ul>" + x.map(function (i) { return "<li>" + esc2(i) + "</li>"; }).join("") + "</ul>" : "—";
    if (fd.type === "ratings") return "<table>" + fd.items.map(function (it, i) { return "<tr><td>" + (i + 1) + ". " + esc2(it) + "</td><td>" + esc2(x[i] || "") + "</td></tr>"; }).join("") + "</table>";
    if (fd.type === "rows" || fd.type === "imp-weeks") { var cols = (fd.cols || [{ id: "name", label: "الأسبوع" }, { id: "from", label: "من" }, { id: "to", label: "إلى" }]); return "<table><tr>" + cols.map(function (c) { return "<th>" + esc2(c.label) + "</th>"; }).join("") + "</tr>" + x.map(function (r) { return "<tr>" + cols.map(function (c) { return "<td>" + esc2(r[c.id] || "") + "</td>"; }).join("") + "</tr>"; }).join("") + "</table>"; }
    if (fd.type === "students") { var sk = v.skills || []; return "<table><tr><th>الطالب/ة</th>" + sk.map(function (s) { return "<th>" + esc2(s) + "</th>"; }).join("") + "<th>الخطة المقترحة</th></tr>" + x.map(function (r) { return "<tr><td>" + esc2(r.name || "") + "</td>" + sk.map(function (_, i) { return "<td>" + esc2((r.skillStatuses || [])[i] || "") + "</td>"; }).join("") + "<td>" + esc2(r.proposedPlan || "") + "</td></tr>"; }).join("") + "</table>"; }
    if (fd.type === "image") return x.has ? "مرفق: " + esc2(x.name || "ملف") + " (محفوظ في ملف الإنجاز)" : "—";
    if (fd.type === "select" && fd.options) { var oo = fd.options.filter(function (o) { return ov(o) === x; })[0]; if (oo) return esc2(ol(oo)); }
    return esc2(x).replace(/\n/g, "<br>");
  }
  function recHtml(form, r) {
    var v = r.data || {}, p = PF().profile || {}, F = fieldsOf(form).filter(function (fd) { return fd.type !== "imp-skills"; }), h = '<section style="page-break-after:always">' + klishe({ subject: form.subjName || (v.subject || "") }) + "<h1>" + esc2(form.title) + "</h1><table class='kv'>";
    F.forEach(function (fd) { if (fd.sec) { h += "<tr><th colspan='2' style='background:#dfeee9'>" + esc2(fd.sec) + "</th></tr>"; return; } h += "<tr><th style='width:30%'>" + esc2(fd.label) + "</th><td>" + valHtml(fd, v) + "</td></tr>"; });
    h += "</table>";
    if (form.remKey) h += "<p style='margin-top:14px'>يكون زمن المعالجة من (" + esc2(v.treatmentStartWeek || "") + ") إلى (" + esc2(v.treatmentEndWeek || "") + ") " + esc2(v.semester ? "من " + v.semester : "") + "</p><div style='display:flex;justify-content:space-around;margin-top:30px'><div>معلم/ة المادة: " + esc2(v.teacherName || "........") + "</div><div>مدير/ة المدرسة: ........</div></div>";
    return h + "</section>";
  }
  function printHtml(form, list) {
    var w = window.open("", "_blank"); if (!w) { S.msg = "اسمح بالنوافذ المنبثقة للطباعة."; S.ok = false; render(); return; }
    w.document.write("<!doctype html><html lang='ar' dir='rtl'><meta charset='utf-8'><title>" + esc2(form.title) + "</title><style>body{font-family:Tahoma,Arial;padding:22px;line-height:1.8}h1{text-align:center}table{width:100%;border-collapse:collapse;margin:6px 0}td,th{border:1px solid #888;padding:6px;text-align:right;vertical-align:top}th{background:#eef3f1}table table{margin:0}ul{margin:0;padding-right:18px}</style>" + list.map(function (r) { return recHtml(form, r); }).join("") + "<script>setTimeout(function(){window.print()},400)<\/script></html>");
    w.document.close();
  }


  // ---------------- الملخص الشامل للإنجازات (يقابل صفحة portfolio-summary في المصدر) ----------------
  function tbl(head, rows) { return "<table><tr>" + head.map(function (h) { return "<th>" + esc2(h) + "</th>"; }).join("") + "</tr>" + (rows.length ? rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc2(c == null ? "" : c) + "</td>"; }).join("") + "</tr>"; }).join("") : "<tr><td colspan='" + head.length + "' style='text-align:center'>لا توجد بيانات</td></tr>") + "</table>"; }
  function lastRec(id) { return recs(id)[0]; }
  function buildSummary(planDocs) {
    var D = window.PF_SUMMARY || { goals: [], charter: [] }, p = PF().profile || {}, tp = (lastRec("teacher-profile") || {}).data || {}, g = function (k) { return tp[k] || ""; };
    var name = g("name") || p.name || "", school = g("school") || p.school || "", year = g("academicYear") || p.year || "";
    var courses = recs("courses"), certs = recs("certifications"), works = recs("workshops"), quals = recs("qualifications"), acts = recs("classroom-activities");
    var hours = courses.reduce(function (a, r) { return a + (parseFloat((r.data || {}).hours) || 0); }, 0);
    var sec = [], n = 0;
    function S(title, html) { n++; sec.push({ n: n, title: title, html: html }); }
    S("المعلومات الشخصية والوظيفية", "<table class='kv'>" + [["الاسم", name], ["التخصص", g("specialization")], ["المسمى الوظيفي", g("jobTitle")], ["المرحلة الدراسية", g("educationalStage")], ["المدرسة", school], ["رقم الهوية الوطنية", g("nationalId")], ["البريد الإلكتروني", g("email")], ["رقم التواصل", g("phone")], ["العام الهجري", year]].map(function (r) { return "<tr><th style='width:30%'>" + r[0] + "</th><td>" + esc2(r[1] || "—") + "</td></tr>"; }).join("") + "</table>");
    S("التطلعات والمبادئ التوجيهية", "<h4>الطموح المستقبلي</h4><p>" + esc2(g("futureAmbition") || "—") + "</p><h4>الهدف الأساسي</h4><p>" + esc2(g("mainGoal") || "—") + "</p><h4>المبادئ الأخلاقية</h4><p>" + esc2(g("ethicalPrinciples") || "—") + "</p>");
    S("الغايات المهنية المنشودة", "<p>" + esc2(g("professionalGoals") || "—").replace(/\n/g, "<br>") + "</p>");
    S("خطة توزيع المحتوى الدراسي", "<p>" + esc2(g("contentPlan") || "—").replace(/\n/g, "<br>") + "</p>");
    S("التأمل المهني والتحليل الذاتي", "<h4>الجوانب الإيجابية</h4><p>" + esc2(g("positiveAspects") || "—") + "</p><h4>فرص النمو والتحسين</h4><p>" + esc2(g("improvementOpportunities") || "—") + "</p>");
    S("البرامج التأهيلية والتطويرية", "<h4>المؤهلات العلمية</h4>" + tbl(["الدرجة", "التخصص", "الجامعة", "سنة التخرج"], quals.map(function (r) { var d = r.data || {}; return [d.degree, d.specialization, d.university, d.graduationYear]; })) + "<h4>الدورات التدريبية</h4>" + tbl(["اسم الدورة", "الجهة", "الساعات", "التاريخ"], courses.map(function (r) { var d = r.data || {}; return [d.courseName, d.provider, d.hours, d.completionDate]; })) + "<h4>ورش العمل</h4>" + tbl(["العنوان", "النوع", "التاريخ", "المكان"], works.map(function (r) { var d = r.data || {}; return [d.title, d.type, d.workshopDate, d.location]; })));
    S("وثائق التقدير والاعتراف", tbl(["مسمى الشهادة", "جهة الاعتماد", "تاريخ الحصول"], certs.map(function (r) { var d = r.data || {}; return [d.certificateName, d.issuingAuthority, d.obtainedDate]; })));
    S("مؤشرات الأداء والإحصاءات", tbl(["المؤشر", "العدد"], [["الدورات التدريبية", courses.length], ["الشهادات المهنية", certs.length], ["الأنشطة الصفية", acts.length], ["ساعات تدريبية", hours]]));
    // أقسام بيانات إضافية (تظهر فقط إذا وُجدت سجلات)
    var skip = { "teacher-profile": 1, "courses": 1, "certifications": 1, "workshops": 1, "qualifications": 1, "classroom-activities": 1 };
    allForms().forEach(function (f) {
      if (skip[f.id]) return; var l = recs(f.id); if (!l.length) return;
      S(f.title.replace("خطة علاجية — ", "الخطط العلاجية: "), tbl(["العنوان", "التاريخ", "تفاصيل"], l.map(function (r) { return [r.title, r.date, (f.list || []).map(function (k) { var x = (r.data || {})[k]; return typeof x === "object" ? "" : x; }).filter(Boolean).join(" · ")]; })));
    });
    var typeNames = { remedial: "الخطط العلاجية الفردية", group: "الخطط العلاجية الجماعية", enrichment: "الخطط الإثرائية", disciplinary: "الخطط الانضباطية" }, by = {};
    (planDocs || []).forEach(function (d) { (by[d.type] = by[d.type] || []).push(d); });
    Object.keys(typeNames).forEach(function (t) { if (by[t] && by[t].length) S(typeNames[t], tbl(["العنوان", "التاريخ"], by[t].map(function (d) { return [d.title || d.studentName || d.groupName || "", d.planDate || ""]; }))); });
    var commit = recs("ethics-charter");
    var goals = (D.goals || []).map(function (x, i) { return "<p><b>" + (i + 1) + "-</b> " + esc2(x) + "</p>"; }).join("");
    var charter = (D.charter || []).map(function (b) { return "<h4>" + esc2(b.title) + "</h4>" + (b.intro || []).map(function (x) { return "<p>" + esc2(x) + "</p>"; }).join("") + ((b.items || []).length ? "<ul>" + b.items.map(function (x) { return "<li>" + esc2(x) + "</li>"; }).join("") + "</ul>" : ""); }).join("") + (commit.length ? "<p><b>التزام المعلم/ة بالميثاق:</b> " + esc2(((commit[0].data || {}).teacherSignature || name) + " — " + ((commit[0].data || {}).commitmentDate || "")) + "</p>" : "");
    S("أهداف سياسة التعليم بالمملكة", goals); S("ميثاق أخلاقيات مهنة التعليم", charter);
    var toc = "<ol>" + sec.map(function (s) { return "<li>" + esc2(s.title) + "</li>"; }).join("") + "</ol>";
    return "<!doctype html><html lang='ar' dir='rtl'><meta charset='utf-8'><title>الملخص الشامل للإنجازات</title><style>body{font-family:Tahoma,Arial;padding:24px;line-height:1.9}h1,h2{text-align:center}h2{background:#0ea472;color:#fff;padding:6px;border-radius:6px}h4{margin:10px 0 2px;color:#087a55}table{width:100%;border-collapse:collapse;margin:6px 0}td,th{border:1px solid #888;padding:6px;text-align:right;vertical-align:top}th{background:#eef3f1}.cover{text-align:center;padding:90px 0;page-break-after:always}section{page-break-inside:avoid;margin-bottom:14px}</style><div class='cover'>" + klishe() + "<p>المملكة العربية السعودية<br>وزارة التعليم</p><h1>الملخص الشامل للإنجازات</h1><h2 style='background:none;color:#000'>" + esc2(name) + "</h2><p>" + esc2([school, year].filter(Boolean).join(" — ")) + "</p></div><h2>فهرس الوثيقة</h2>" + toc + sec.map(function (s) { return "<section><h2>" + s.n + ". " + esc2(s.title) + "</h2>" + s.html + "</section>"; }).join("") + "<script>setTimeout(function(){window.print()},500)<\/script></html>";
  }
  function printSummary() {
    var go = function (planDocs) { var w = window.open("", "_blank"); if (!w) { S.msg = "اسمح بالنوافذ المنبثقة للطباعة."; S.ok = false; render(); return; } w.document.write(buildSummary(planDocs)); w.document.close(); };
    var run = function () { var d = db(); if (!d) { go([]); return; } d.collection("portfolio_plans").get().then(function (q) { go(q.docs.map(function (x) { return x.data(); })); }).catch(function () { go([]); }); };
    if (window.PF_SUMMARY) run(); else loadScript("summary-data.js?v=1", function () { run(); });
  }


  // ---------------- دليل الشواهد المطلوبة (يقابل صفحة evidence-guide: 28 تبويبًا و105 شواهد) ----------------
  function guideHtml() {
    var G = window.PF_GUIDE; if (!G) return '<div class="card p-6 text-center">⏳ جارٍ تحميل الدليل…</div>';
    var q = (S.gq || "").trim(), total = 0, shown = 0;
    G.forEach(function (t) { total += t.evidences.length; });
    var tabs = G.map(function (t) {
      var evs = t.evidences.filter(function (e) { return !q || t.title.indexOf(q) >= 0 || e.label.indexOf(q) >= 0 || e.desc.indexOf(q) >= 0 || (e.impact || "").indexOf(q) >= 0; });
      if (!evs.length) return ""; shown += evs.length;
      var open = S.gOpen === "all" || S.gOpen === t.id || !!q;
      return '<div class="card mb-2"><button class="w-full text-right p-3 font-extrabold flex justify-between" onclick="window.PFFm.guideToggle(\'' + t.id + '\')"><span>' + esc2(t.title) + ' <span class="chip">' + t.evidences.length + ' شواهد</span></span><span>' + (open ? "▲" : "▼") + "</span></button>" + (open ? '<div class="p-3 pt-0">' + evs.map(function (e, i) { return '<div class="mb-2 p-2 rounded-xl" style="background:rgba(14,164,114,.07)"><div class="font-bold text-sm">' + (i + 1) + ". " + esc2(e.label) + '</div><div class="text-xs mt-1">' + esc2(e.desc) + "</div>" + (e.impact ? '<div class="text-xs mt-1" style="color:var(--brand-dark)"><b>الأثر:</b> ' + esc2(e.impact) + "</div>" : "") + "</div>"; }).join("") + (t.report ? '<div class="text-xs p-2 rounded-xl" style="border:1px dashed var(--line)"><b>نص التقرير الافتراضي:</b> ' + esc2(t.report) + "</div>" : "") + "</div>" : "") + "</div>";
    }).join("");
    return '<div class="card p-4 mb-3"><h3 class="font-extrabold">📖 دليل الشواهد المطلوبة <span class="chip">' + G.length + " تبويبًا · " + total + ' شاهدًا</span></h3><div class="flex flex-wrap gap-2 mt-2"><input class="' + inpCls() + ' flex-1" id="pfg-q" placeholder="🔍 ابحث في الدليل" value="' + attr(S.gq || "") + '" oninput="window.PFFm.guideSearch(this.value)"><button class="btn btn-outline text-sm py-2 px-3" onclick="window.PFFm.guideToggle(\'all\')">' + (S.gOpen === "all" ? "طيّ الكل" : "توسيع الكل") + '</button><button class="btn btn-outline text-sm py-2 px-3" onclick="window.PFFm.guidePrint()">🖨️ طباعة الدليل</button></div><div class="text-xs mt-1" style="color:var(--sub)">النتائج: ' + shown + " من " + total + "</div></div>" + (tabs || '<div class="card p-6 text-center">لا توجد نتائج</div>');
  }
  function guidePrint() {
    var G = window.PF_GUIDE; if (!G) return; var w = window.open("", "_blank"); if (!w) return;
    w.document.write("<!doctype html><html lang='ar' dir='rtl'><meta charset='utf-8'><title>دليل الشواهد المطلوبة</title><style>body{font-family:Tahoma,Arial;padding:22px;line-height:1.8}h1{text-align:center}h2{background:#0ea472;color:#fff;padding:5px 10px;border-radius:6px;font-size:16px;margin-top:18px}li{margin-bottom:6px}small{color:#555}</style><h1>دليل الشواهد المطلوبة</h1>" + G.map(function (t) { return "<h2>" + esc2(t.title) + "</h2><ol>" + t.evidences.map(function (e) { return "<li><b>" + esc2(e.label) + "</b><br>" + esc2(e.desc) + (e.impact ? "<br><small>الأثر: " + esc2(e.impact) + "</small>" : "") + "</li>"; }).join("") + "</ol>"; }).join("") + "<script>setTimeout(function(){window.print()},400)<\/script></html>"); w.document.close();
  }


  // ---------------- الرفع الذكي للشواهد (يقابل smart-upload + evidence-arm/bulk-preview في المصدر) ----------------
  var TAB2TYPE = { "executive-reports": "report", "initiatives-programs": "initiative", "plans": "plan", "analysis-assessment": "analysis", "activities-worksheets": "worksheet", "tests": "exam", "field-photos": "photo", "certificates-honors": "certificate" };
  var TAB_IDS = ["executive-reports", "initiatives-programs", "plans", "analysis-assessment", "activities-worksheets", "tests", "field-photos", "certificates-honors"];
  var STD_NAMES = ["أداء الواجبات الوظيفية", "التفاعل مع المجتمع", "التفاعل مع أولياء الأمور", "التنويع في استراتيجيات التدريس", "تحسين نتائج المتعلمين", "إعداد وتنفيذ خطة التعلم", "توظيف تقنيات ووسائل التعلم", "تهيئة البيئة التعليمية", "الإدارة الصفية", "تحليل نتائج المتعلمين", "تنوع أساليب التقويم"];
  function tabLabel(t) { return window.BrainPack ? window.BrainPack.getTabLabel(t) : t; }
  function existingForDup() { return PF().items.filter(function (x) { return !x.workspaceType && x.fileName; }).map(function (x) { return { id: x.id, title: x.title, fileName: x.fileName, createdAt: new Date(x.createdAt || Date.now()) }; }); }
  function smartBuild(files) {
    var B = window.BrainPack, ex = existingForDup(), seen = {}, items = [];
    [].slice.call(files).forEach(function (f) {
      var title = f.name.replace(/\.[^.]+$/, "").replace(/[_\-]+/g, " ").trim(), cls = B.classifyEvidenceV2(title, "", f.name), jobs = B.classifyForJobPerformance(title, "", f.name).filter(function (j) { return j.confidence >= 30; }).slice(0, 5);
      var std = jobs.map(function (j) { return j.standardId; });
      if (!std.length && window.PFui && window.PFui._suggest) { try { var sg = window.PFui._suggest(title); if (sg && sg.standards) std = sg.standards.slice(0, 3); } catch (e) { } }
      var dup = B.checkDuplicateWindow(f.name, f.size, ex), batchDup = !!seen[f.name]; seen[f.name] = true;
      items.push({ file: f, title: title, cat: cls.tab, origCat: cls.tab, origType: cls.type, origConf: cls.confidence, level: cls.confidenceLevel, levelLabel: cls.confidenceLevelLabel, tags: cls.tags, cross: cls.crossLinks, stds: std, dup: dup.isDuplicate ? dup.message : (batchDup ? "ملف مكرر ضمن الدفعة نفسها" : ""), skip: false });
    });
    return items;
  }
  function smartHtml() {
    var B = window.BrainPack; if (!B) return '<div class="card p-6 text-center">⏳ جارٍ تحميل العقل الذكي…</div>';
    var it = S.smart || [], sum = "";
    if (it.length) { var a = it.filter(function (x) { return x.level === "auto"; }).length, r = it.filter(function (x) { return x.level === "suggest"; }).length, m = it.filter(function (x) { return x.level === "manual"; }).length, d = it.filter(function (x) { return x.dup; }).length; sum = '<div class="card p-3 mb-3 text-sm font-bold">📊 ' + it.length + " ملفات: " + a + " اعتماد تلقائي (≥80%) · " + r + " للمراجعة (50–79%) · " + m + " اختيار يدوي (&lt;50%)" + (d ? " · ⚠️ " + d + " تحذير تكرار" : "") + "</div>"; }
    var cards = it.map(function (x, i) {
      var cc = x.level === "auto" ? "#047857" : x.level === "suggest" ? "#92400e" : "#b91c1c";
      return '<div class="card p-3 mb-2" style="' + (x.skip ? "opacity:.45" : "") + '"><div class="flex justify-between gap-2"><div class="text-xs" style="color:var(--sub)">📎 ' + esc2(x.file.name) + " (" + Math.round(x.file.size / 1024) + ' ك.ب) <span class="badge" style="background:#f1f5f9;color:' + cc + '">' + esc2(x.levelLabel) + " · " + x.origConf + '%</span></div><button class="btn btn-outline text-xs py-1 px-2" onclick="window.PFFm.smartRm(' + i + ')">🗑️</button></div>' +
        (x.dup ? '<div class="text-xs mt-1 font-bold" style="color:#b91c1c">⚠️ ' + esc2(x.dup) + ' — <label><input type="checkbox" ' + (x.skip ? "checked" : "") + ' onchange="window.PFFm.smartSkip(' + i + ',this.checked)"> تخطّي هذا الملف</label></div>' : "") +
        '<input class="' + inpCls() + ' mt-2" value="' + attr(x.title) + '" oninput="window.PFFm.smartSet(' + i + ',\'title\',this.value)"><select class="' + inpCls() + ' mt-2" onchange="window.PFFm.smartSet(' + i + ',\'cat\',this.value)">' + TAB_IDS.map(function (t) { return '<option value="' + t + '"' + (x.cat === t ? " selected" : "") + ">" + esc2(tabLabel(t)) + "</option>"; }).join("") + '</select><div class="flex flex-wrap gap-1 mt-2">' + STD_NAMES.map(function (n, k) { var on = x.stds.indexOf(k + 1) >= 0; return '<button type="button" class="chip ' + (on ? "active" : "") + '" style="padding:.2rem .6rem;font-size:.72rem" onclick="window.PFFm.smartStd(' + i + ',' + (k + 1) + ')">' + (k + 1) + ". " + esc2(n) + "</button>"; }).join("") + "</div>" +
        (x.cross && x.cross.length ? '<div class="text-xs mt-1" style="color:var(--sub)">🔗 اقتراح ربط متقاطع: ' + x.cross.map(function (c) { return esc2(c.tabLabel) + " (" + esc2(c.reason) + ")"; }).join(" · ") + "</div>" : "") + "</div>";
    }).join("");
    var fb = 0; try { fb = JSON.parse(localStorage.getItem("pf_brain_feedback") || "[]").length; } catch (e) { }
    return '<div class="card p-4 mb-3"><h3 class="font-extrabold">📥 الرفع الذكي للشواهد</h3><p class="text-sm mt-1" style="color:var(--sub)">اختر عدة ملفات دفعة واحدة؛ يقترح النظام تبويب الشاهد ونوعه والمعايير المرتبطة بدرجة ثقة، وينبّهك للملفات المكررة (نفس الاسم خلال 10 دقائق). راجع الاقتراحات ثم احفظ الكل. تصحيحاتك تُسجَّل (' + fb + ' تصحيح محفوظ) لتحسين الاقتراحات لاحقًا.</p><input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" class="mt-2 text-sm" onchange="window.PFFm.smartPick(this.files)"></div>' + sum + cards + (it.length ? '<div class="flex gap-2 mt-2"><button class="btn btn-brand px-5 py-2" ' + (S.busy ? "disabled" : "") + ' onclick="window.PFFm.smartSave()">💾 حفظ الكل (' + it.filter(function (x) { return !x.skip; }).length + ')</button><button class="btn btn-outline px-4 py-2" onclick="window.PFFm.smartClear()">مسح القائمة</button></div>' : "");
  }
  function smartSave() {
    var B = window.BrainPack, items = (S.smart || []).filter(function (x) { return !x.skip; }); if (!items.length || S.busy) return;
    var noStd = items.filter(function (x) { return !x.stds.length; });
    if (noStd.length) { S.msg = "اختر معيارًا واحدًا على الأقل لكل ملف (" + noStd.length + " ملف بلا معيار): " + noStd[0].file.name; S.ok = false; render(); return; }
    var d = db(), P = window.PFui; if (!d || !P) { S.msg = "تعذّر الاتصال بالخدمة."; S.ok = false; render(); return; }
    S.busy = true; render(); var done = 0, errs = [], chain = Promise.resolve();
    items.forEach(function (x) {
      chain = chain.then(function () { return readImage(x.file); }).then(function (fd) {
        return P.addEvidence({ title: x.title || x.file.name, description: "", category: x.cat, standards: x.stds.slice(), date: today(), url: "", hasFile: true, fileName: fd.name, fileType: fd.type, smart: { tab: x.origCat, conf: x.origConf, level: x.level } }).then(function (id) { return d.collection("portfolio_files").doc(id).set({ data: fd.data, name: fd.name, type: fd.type }); });
      }).then(function () {
        done++;
        if (x.cat !== x.origCat) { var e = { originalTab: x.origCat, originalType: x.origType, originalConfidence: x.origConf, correctedTab: x.cat, correctedType: TAB2TYPE[x.cat] || null, title: x.title, keywords: x.tags || [] }; try { B.logFeedback(e); var l = JSON.parse(localStorage.getItem("pf_brain_feedback") || "[]"); l.push(Object.assign({ at: Date.now() }, e)); localStorage.setItem("pf_brain_feedback", JSON.stringify(l.slice(-1000))); } catch (er) { } }
      }).catch(function (e) { errs.push(x.file.name + ": " + ((e && e.message) || "فشل")); });
    });
    chain.then(function () { S.busy = false; S.smart = (S.smart || []).filter(function (x) { return x.skip; }); S.msg = "تم حفظ " + done + " شاهدًا" + (errs.length ? " — تعذّر " + errs.length + ": " + errs.join(" | ") : "") + ". تجدها في تبويب 📎 الشواهد."; S.ok = !errs.length; render(); });
  }


  // ---------------- تصدير Excel حقيقي (.xlsx) بلا مكتبات: ملف ZIP بصيغة STORE ----------------
  var CRC_T = null;
  function crc32(b) { if (!CRC_T) { CRC_T = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRC_T[n] = c >>> 0; } } var c2 = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c2 = CRC_T[(c2 ^ b[i]) & 255] ^ (c2 >>> 8); return (c2 ^ 0xFFFFFFFF) >>> 0; }
  function u8(str) { return new TextEncoder().encode(str); }
  function zipStore(files) {
    var parts = [], cen = [], off = 0;
    files.forEach(function (f) {
      var name = u8(f.name), data = f.data, crc = crc32(data), h = new Uint8Array(30 + name.length), dv = new DataView(h.buffer);
      dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint16(6, 0x0800, true); dv.setUint16(8, 0, true); dv.setUint16(10, 0, true); dv.setUint16(12, 0x21, true);
      dv.setUint32(14, crc, true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, name.length, true); dv.setUint16(28, 0, true); h.set(name, 30);
      var c = new Uint8Array(46 + name.length), cv = new DataView(c.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, 0, true); cv.setUint16(14, 0x21, true);
      cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, off, true); c.set(name, 46);
      parts.push(h, data); cen.push(c); off += h.length + data.length;
    });
    var cs = 0; cen.forEach(function (c) { cs += c.length; });
    var end = new Uint8Array(22), ev = new DataView(end.buffer); ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cs, true); ev.setUint32(16, off, true);
    return new Blob(parts.concat(cen, [end]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function xmlEsc(x) { return String(x == null ? "" : x).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function colName(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function buildXlsx(sheets) {
    var used = {}, safe = sheets.map(function (sh, i) { var n = String(sh.name || "ورقة" + (i + 1)).replace(/[\\\/\?\*\[\]:]/g, " ").slice(0, 28) || "ورقة" + (i + 1), b = n, k = 2; while (used[n]) { n = b.slice(0, 25) + " " + k++; } used[n] = 1; return n; });
    var files = [
      { name: "[Content_Types].xml", data: u8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") + '</Types>') },
      { name: "_rels/.rels", data: u8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>') },
      { name: "xl/workbook.xml", data: u8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + safe.map(function (n, i) { return '<sheet name="' + xmlEsc(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + '</sheets></workbook>') },
      { name: "xl/_rels/workbook.xml.rels", data: u8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>') },
      { name: "xl/styles.xml", data: u8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F9D6A"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>') }
    ];
    sheets.forEach(function (sh, si) {
      var rows = sh.rows || [], maxc = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 1);
      var x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"' + (si === 0 ? ' tabSelected="1"' : "") + '><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="' + maxc + '" width="26" customWidth="1"/></cols><sheetData>';
      rows.forEach(function (r, ri) { x += '<row r="' + (ri + 1) + '">' + r.map(function (c, ci) { var ref = colName(ci) + (ri + 1), st = ri === 0 ? 1 : 2; if (typeof c === "number" && isFinite(c)) return '<c r="' + ref + '" s="' + st + '"><v>' + c + '</v></c>'; return '<c r="' + ref + '" s="' + st + '" t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(c) + '</t></is></c>'; }).join("") + '</row>'; });
      files.push({ name: "xl/worksheets/sheet" + (si + 1) + ".xml", data: u8(x + '</sheetData></worksheet>') });
    });
    return zipStore(files);
  }
  function cellText(fd, v) {
    var x = v[fd.id]; if (x == null || x === "") return "";
    if (fd.type === "list" || fd.type === "checks") return (x || []).join(" | ");
    if (fd.type === "ratings") return (x || []).map(function (r, i) { return (i + 1) + ":" + r; }).join(" ، ");
    if (fd.type === "rows" || fd.type === "imp-weeks") return (x || []).map(function (r) { return Object.keys(r).map(function (k) { return r[k]; }).filter(Boolean).join(" / "); }).join(" ؛ ");
    if (fd.type === "students") return (x || []).map(function (r) { return (r.name || "") + " (" + (r.skillStatuses || []).filter(Boolean).join("،") + ")"; }).join(" ؛ ");
    if (fd.type === "image") return x && x.has ? "مرفق: " + (x.name || "ملف") : "";
    if (fd.type === "select" && fd.options) { var oo = fd.options.filter(function (o) { return ov(o) === x; })[0]; return oo ? ol(oo) : String(x); }
    return typeof x === "object" ? JSON.stringify(x) : x;
  }
  function formSheet(f) {
    var F = fieldsOf(f).filter(function (fd) { return !fd.sec && fd.type !== "imp-skills"; }), head = ["العنوان", "التاريخ"].concat(F.map(function (fd) { return fd.label; }));
    var rows = [head]; recs(f.id).forEach(function (r) { rows.push([r.title, r.date || ""].concat(F.map(function (fd) { return cellText(fd, r.data || {}); }))); });
    return { name: f.title.replace("خطة علاجية — ", "علاجية "), rows: rows };
  }
  function evidenceSheet() {
    var rows = [["العنوان", "التصنيف", "المعايير", "التاريخ", "الوصف", "الرابط", "مرفق"]];
    PF().items.forEach(function (x) { if (x.workspaceType || !x.standards) return; rows.push([x.title || "", x.category || "", (x.standards || []).join("، "), x.date || "", x.description || "", x.url || "", x.hasFile ? (x.fileName || "نعم") : ""]); });
    return { name: "الشواهد", rows: rows };
  }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500); }

  // ---------------- واجهة عامة ----------------
  window.PFFm = {
    open: function (id) { S.view = null; var f = getForm(id) || { id: id, remKey: /^rem:/.test(id) ? id.slice(4) : null }; S.formId = id; S.editing = null; S.q = ""; S.msg = ""; S.vals = null; ensureData(f, render); render(); },
    add: function () { var f = getForm(S.formId); ensureData(f, function () { S.vals = initVals(f); S.editing = "new"; S.msg = ""; render(); }); },
    edit: function (id) { var r = PF().items.filter(function (x) { return x.id === id; })[0], f = getForm(S.formId); if (!r) return; ensureData(f, function () { S.vals = JSON.parse(JSON.stringify(r.data || {})); S.editing = id; S.msg = ""; render(); }); },
    cancel: function () { S.editing = null; S.vals = null; render(); },
    summary: printSummary, _buildSummary: buildSummary,
    smart: function () { S.view = "smart"; S.formId = null; S.editing = null; var go = function () { render(); }; if (window.BrainPack) go(); else loadScript("brain-pack.js?v=1", function () { go(); }); render(); },
    smartPick: function (files) { if (!files || !files.length) return; S.smart = (S.smart || []).concat(smartBuild(files)); S.msg = ""; render(); },
    smartSet: function (i, k, v) { if (S.smart[i]) S.smart[i][k] = v; },
    smartStd: function (i, id) { var a = S.smart[i].stds, p = a.indexOf(id); if (p >= 0) a.splice(p, 1); else a.push(id); render(); },
    smartSkip: function (i, v) { S.smart[i].skip = !!v; render(); },
    smartRm: function (i) { S.smart.splice(i, 1); render(); },
    smartClear: function () { S.smart = []; render(); },
    smartSave: smartSave,
    guide: function () { S.view = "guide"; S.formId = null; S.editing = null; var go = function () { render(); }; if (window.PF_GUIDE) go(); else loadScript("guide-data.js?v=1", function () { go(); }); render(); },
    guideSearch: function (q) { S.gq = q; render(); var i = $("pfg-q"); if (i) { i.focus(); i.setSelectionRange(q.length, q.length); } },
    guideToggle: function (id) { S.gOpen = (S.gOpen === id) ? null : id; render(); },
    guidePrint: guidePrint,
    save: save, del: del, search: function (q) { S.q = q; var el = document.activeElement; render(); var i = S.root.querySelector('input[placeholder="🔍 بحث في السجلات"]'); if (i) { i.focus(); i.setSelectionRange(q.length, q.length); } },
    print: function (id) { var r = PF().items.filter(function (x) { return x.id === id; })[0]; if (r) printHtml(getForm(r.formId), [r]); },
    printAll: function () { var f = getForm(S.formId), l = recs(S.formId); if (!l.length) { S.msg = "لا توجد سجلات للطباعة."; S.ok = false; render(); return; } printHtml(f, l); },
    exportExcel: function () { var f = getForm(S.formId); if (!f) return; download(buildXlsx([formSheet(f)]), "نماذج_" + f.id.replace(/[^\w-]/g, "_") + "_" + today() + ".xlsx"); },
    exportAllExcel: function () { var sheets = [evidenceSheet()]; allForms().forEach(function (f) { if (recs(f.id).length) sheets.push(formSheet(f)); }); if (sheets.length === 1 && sheets[0].rows.length === 1) { S.msg = "لا توجد بيانات للتصدير بعد."; S.ok = false; render(); return; } download(buildXlsx(sheets), "ملف_الإنجاز_كامل_" + today() + ".xlsx"); },
    _buildXlsx: buildXlsx, _formSheet: formSheet, _evidenceSheet: evidenceSheet,
    exportForm: function () { var f = getForm(S.formId), blob = new Blob([JSON.stringify({ version: 1, form: f.id, title: f.title, exportedAt: new Date().toISOString(), records: recs(S.formId) }, null, 2)], { type: "application/json;charset=utf-8" }), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "نماذج_" + f.id.replace(/[^\w-]/g, "_") + "_" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); },
    addRow: function (id) {
      var form = getForm(S.formId), fd = fieldsOf(form).filter(function (x) { return x.id === id; })[0], tb = document.querySelector('table[data-rows="' + id + '"] tbody'); if (!fd || !tb) return;
      var cols = (fd.cols || [{ id: "name" }, { id: "from" }, { id: "to" }]).map(function (c) { return typeof c === "string" ? { id: c } : c; }), tmp = document.createElement("tbody"); tmp.innerHTML = rowTr(id, cols, {}, 0); tb.appendChild(tmp.firstChild);
    },
    // الخطط العلاجية: تغيير المرحلة/الصف/الفصل يعيد تحميل المهارات الافتراضية كما في المصدر
    genWeeks: function () {
      var s = (document.querySelector('[data-f="startDate"]') || {}).value, e = (document.querySelector('[data-f="endDate"]') || {}).value; if (!s || !e) { alert("أدخل بداية الأسبوع الأول ونهاية الأسبوع الأخير أولًا."); return; }
      var form = getForm(S.formId); S.vals = collect(form); var cur = new Date(s), end = new Date(e), w = [], n = 1, ar = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن", "التاسع", "العاشر", "الحادي عشر", "الثاني عشر", "الثالث عشر", "الرابع عشر", "الخامس عشر", "السادس عشر", "السابع عشر", "الثامن عشر"];
      while (cur <= end && n <= 40) { var to = new Date(cur); to.setDate(to.getDate() + 6); w.push({ name: "الأسبوع " + (ar[n - 1] || n), from: cur.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }); cur = new Date(to); cur.setDate(cur.getDate() + 1); n++; }
      S.vals.weeks = w; render();
    },
    impSub: function (v) { var form = getForm(S.formId); S.vals = collect(form); S.impSub = v; S.impGr = null; render(); },
    impGr: function (v) { var form = getForm(S.formId); S.vals = collect(form); S.impGr = v; render(); },
    impFill: function () {
      var form = getForm(S.formId), v = collect(form), SK = window.SUBJECT_SKILLS, sub = $("imp-sub").value, gr = $("imp-gr").value, n = Math.max(1, parseInt($("imp-n").value, 10) || 3), pairs = ((SK[sub] || {})[gr] || []).slice(0, n);
      v.goals = pairs.map(function (p) { return p[0]; }); v.actions = pairs.map(function (p) { return p[1]; }); if (!v.subject) v.subject = sub; if (!v.grade) v.grade = gr; S.vals = v; S.impSub = sub; S.impGr = gr; render();
    },
    addStudent: function () { var form = getForm(S.formId), v = collect(form); v.studentsData.push({ name: "", skillStatuses: [], proposedPlan: "" }); S.vals = v; render(); },
    refreshStudents: function () { var form = getForm(S.formId); S.vals = collect(form); S.vals.skills = S.vals.skills || []; render(); },
    calcPct: function () {
      var form = getForm(S.formId), v = collect(form), a = 0, b = 0, c = 0, t = 0;
      (v.studentsData || []).forEach(function (r) { (r.skillStatuses || []).forEach(function (s) { if (s === "أتقن") a++; else if (s === "أتقن جزئياً") b++; else if (s === "لم يتقن") c++; else return; t++; }); });
      if (!t) { alert("لا توجد حالات مرصودة في الجدول بعد."); return; }
      v.masteredPercentage = Math.round(a * 100 / t); v.partiallyMasteredPercentage = Math.round(b * 100 / t); v.notMasteredPercentage = Math.round(c * 100 / t); v.studentCount = (v.studentsData || []).length; S.vals = v; render();
    },
    onRemChange: function () { var form = getForm(S.formId); if (!form || !form.remKey) return; var v = collect(form), old = S.vals || {}; v.skills = old.skills; S.vals = v; },
    _S: S, _forms: allForms, _collect: collect
  };

  // تغيير المرحلة/الصف/الفصل في الخطط العلاجية (تفويض أحداث)
  document.addEventListener("change", function (ev) {
    var t = ev.target; if (!S.root || !S.root.contains(t) || !S.editing) return;
    var form = getForm(S.formId); if (!form || !form.remKey) return;
    var id = t.getAttribute("data-f"); if (id !== "stage" && id !== "grade" && id !== "semester") return;
    var RD = window.REMEDIAL_DATA, sub = RD.subjects[form.remKey], v = collect(form), prev = S.vals || {};
    v.skills = prev.skills; v.file = prev.file;
    if (id === "stage") { v.grade = (remGrades(sub, v) || [])[0] || ""; }
    if (!sub.stages) v.stage = stageOf(v.grade);
    v.skills = remDefaultSkills(form, v); S.vals = v; render();
  });

  window.PFForms = { mount: function (root) { S.root = root; render(); }, render: render };
})();
