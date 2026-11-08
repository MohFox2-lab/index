/* كتالوج النماذج المتخصصة في ملف إنجاز المعلم/ة
   مأخوذ من جداول المصدر الأصلي (shared/schema.ts) ونماذج الإدخال (components/add-*-dialog.tsx والصفحات).
   أنواع الحقول: text | textarea | number | date | select | list | checks | ratings | rows | students | image | imp-weeks | imp-skills */
(function () {
  "use strict";
  var SUBJECTS = ["العلوم", "الرياضيات", "اللغة العربية", "اللغة الإنجليزية", "الدراسات الإسلامية", "القرآن الكريم", "الاجتماعيات", "الفيزياء", "الكيمياء", "الأحياء", "الحاسب وتقنية المعلومات", "التربية الفنية", "التربية البدنية", "المهارات الحياتية", "التفكير الناقد"];
  var GRADES = ["رياض الأطفال — المستوى الأول", "رياض الأطفال — المستوى الثاني", "رياض الأطفال — المستوى الثالث", "الأول الابتدائي", "الثاني الابتدائي", "الثالث الابتدائي", "الرابع الابتدائي", "الخامس الابتدائي", "السادس الابتدائي", "الأول المتوسط", "الثاني المتوسط", "الثالث المتوسط", "الأول الثانوي", "الثاني الثانوي", "الثالث الثانوي"];
  var SEMS = ["الفصل الدراسي الأول", "الفصل الدراسي الثاني", "الفصل الدراسي الثالث"];
  var RATING = ["ممتاز", "جيد جداً", "جيد", "مقبول", "ضعيف"];
  var VISIT_IND = ["مراجعة الدرس السابق وطرح الأسئلة المعززة", "تمهيد مناسب للدرس", "شرح الدرس باستخدام أساليب متنوعة", "استخدام الطالب/ة للكتاب المدرسي", "مشاركة الطلاب/ات بطريقة جيدة", "التقويم البنائي أثناء الدرس", "توظيف الوسائل التعليمية", "التقنيات التعليمية المستخدم/ة"];
  var TOOLS = ["سبورة تقليدية", "سبورة ذكية", "ورق توضيحي", "أوراق عمل", "جهاز عرض", "نماذج ومجسمات", "حاسب آلي", "ألعاب تعليمية"];
  var REPORT_TYPES = ["تقرير نشاط/برنامج", "شهادة شكر/تقدير", "نتائج تعلم / اختبارات", "محضر اجتماع / لقاء", "استمارة تقييم", "أوراق تدريب"];

  function f(id, label, type, o) { var x = { id: id, label: label, type: type || "text" }; if (o) for (var k in o) x[k] = o[k]; return x; }
  function T(id, label, o) { return f(id, label, "text", o); }
  function A(id, label, o) { return f(id, label, "textarea", o); }
  function D(id, label, o) { return f(id, label, "date", o); }
  function N(id, label, o) { return f(id, label, "number", o); }
  function S(id, label, options, o) { var x = f(id, label, "select", o); x.options = options; return x; }
  function L(id, label, def, o) { var x = f(id, label, "list", o); x.def = def || []; return x; }
  function IMG(id, label) { return f(id, label, "image"); }
  var EDU = [T("educationAdmin", "الإدارة العامة للتعليم"), T("sector", "القطاع")];

  var FORMS = [
    // ===================== البيانات الأساسية =====================
    { id: "teacher-profile", group: "البيانات الأساسية", icon: "🪪", title: "الملف الشخصي والوظيفي", table: "teacher_profiles", std: [1], cat: "executive-reports", titleOf: ["name", "academicYear"],
      list: ["jobTitle", "school", "academicYear"], fields: [
        T("name", "الاسم الكامل"), T("specialization", "التخصص"), T("jobTitle", "المسمى الوظيفي"), T("educationalStage", "المرحلة الدراسية"), T("school", "المدرسة"), T("nationalId", "رقم الهوية الوطنية"),
        T("email", "البريد الإلكتروني"), T("phone", "رقم التواصل"), T("academicYear", "العام الهجري"),
        A("futureAmbition", "الطموح المستقبلي", { span: 2 }), A("mainGoal", "الهدف الأساسي", { span: 2 }), A("ethicalPrinciples", "المبادئ الأخلاقية", { span: 2 }),
        A("professionalGoals", "الغايات المهنية المنشودة", { span: 2 }), A("contentPlan", "خطة توزيع المحتوى الدراسي", { span: 2 }),
        A("positiveAspects", "الجوانب الإيجابية", { span: 2 }), A("improvementOpportunities", "فرص النمو والتحسين", { span: 2 })] },
    { id: "teacher-cv", group: "البيانات الأساسية", icon: "👤", title: "السيرة الذاتية (نموذج المصدر)", table: "teacher_cvs", std: [1], cat: "executive-reports", titleOf: ["name", "specialization"],
      list: ["specialization", "degree", "experienceFromDate"], fields: [
        T("name", "الاسم"), T("specialization", "التخصص"), T("grade", "الصف"), T("degree", "الدرجة العلمية"), T("degreeField", "المجال (اختياري)"),
        D("experienceFromDate", "الخبرة من تاريخ"), D("experienceToDate", "الخبرة إلى تاريخ"), A("experienceDescription", "وصف الخبرة", { span: 2 }),
        A("skills", "المهارات", { span: 2 }), A("hobbies", "الهوايات"), A("courses", "الدورات"),
        T("email", "البريد الإلكتروني"), T("phone", "رقم التواصل"), T("address", "العنوان"), IMG("cvImageUrl", "صورة السيرة الذاتية")] },
    { id: "qualifications", group: "البيانات الأساسية", icon: "🎓", title: "المؤهلات العلمية", table: "academic_qualifications", std: [1], cat: "executive-reports", titleOf: ["degree", "specialization"],
      list: ["university", "graduationYear"], fields: [T("degree", "الدرجة العلمية"), T("specialization", "التخصص"), T("university", "الجامعة"), T("graduationYear", "سنة التخرج")] },

    // ===================== التطوير المهني =====================
    { id: "courses", group: "التطوير المهني", icon: "📚", title: "الدورات التدريبية", table: "training_courses", std: [2], cat: "initiatives-programs", titleOf: ["courseName"], dateField: "completionDate",
      list: ["provider", "hours", "completionDate"], fields: [T("courseName", "اسم الدورة"), T("provider", "الجهة المقدمة"), N("hours", "عدد الساعات"), D("completionDate", "تاريخ الحصول")] },
    { id: "certifications", group: "التطوير المهني", icon: "🏅", title: "وثائق الاعتماد المهني", table: "professional_certifications", std: [2], cat: "initiatives-programs", titleOf: ["certificateName"], dateField: "obtainedDate",
      list: ["issuingAuthority", "obtainedDate"], fields: [T("certificateName", "مسمى الشهادة"), T("issuingAuthority", "جهة الاعتماد"), D("obtainedDate", "تاريخ الحصول"), IMG("certificateImage", "صورة الشهادة")] },
    { id: "workshops", group: "التطوير المهني", icon: "🛠️", title: "ورش العمل", table: "workshops", std: [2], cat: "initiatives-programs", titleOf: ["title"], dateField: "workshopDate",
      list: ["type", "workshopDate", "location"], fields: [T("title", "عنوان الورشة"), S("type", "نوع المشاركة", ["حضور", "تقديم"]), D("workshopDate", "التاريخ"), T("location", "المكان")] },
    { id: "ethics-charter", group: "التطوير المهني", icon: "📜", title: "ميثاق أخلاقيات مهنة التعليم", table: "ethics_charter_commitments", std: [1], cat: "executive-reports", titleOf: ["teacherSignature"], titlePrefix: "التزام بميثاق أخلاقيات المهنة — ", dateField: "commitmentDate",
      list: ["commitmentDate", "principalSignature"], fields: [D("commitmentDate", "تاريخ الالتزام"), T("teacherSignature", "توقيع المعلم/ة"), T("principalSignature", "مدير/ة المدرسة"), IMG("charterImageUrl", "صورة الميثاق الموقّع"), A("notes", "الملاحظات", { span: 2 })] },

    // ===================== الأداء التعليمي =====================
    { id: "classroom-activities", group: "الأداء التعليمي", icon: "🧩", title: "الأنشطة الصفية", table: "classroom_activities", std: [4, 8], cat: "activities-worksheets", titleOf: ["title"], dateField: "activityDate",
      list: ["type", "activityDate"], fields: [T("title", "عنوان النشاط"), S("type", "نوع النشاط", ["تفاعلي", "جماعي", "فردي"]), A("description", "الوصف", { span: 2 }), D("activityDate", "التاريخ")] },
    { id: "daily-achievement", group: "الأداء التعليمي", icon: "📅", title: "تقرير الإنجاز اليومي", table: "daily_achievement_reports", std: [1, 6], cat: "executive-reports", titleOf: ["lessonTitle"], dateField: "executionDate",
      list: ["subject", "grade", "executionDate"], fields: [
        T("lessonTitle", "عنوان الدرس"), T("classSection", "الفصل"), T("grade", "الصف"), T("subject", "المادة"), D("executionDate", "التاريخ"),
        T("implementationRate", "نسبة التنفيذ"), T("unitFollowUp", "متابعة الوحدات"), T("understandingLevel", "مستوى الفهم"), T("interactionLevel", "مستوى التفاعل"),
        T("targetCount", "عدد المستهدفين"), T("strategyName", "اسم الاستراتيجية"),
        L("achievements", "الإنجازات", [""], { span: 2 }), f("educationalTools", "الوسائل التعليمية المستخدم/ة", "checks", { options: TOOLS, span: 2 }),
        A("challenges", "أبرز التحديات", { span: 2 }), A("recommendations", "التوصيات", { span: 2 })] },
    { id: "weekly-plan", group: "الأداء التعليمي", icon: "🗓️", title: "الخطة الأسبوعية (تقرير)", table: "weekly_plan_reports", std: [6], cat: "plans", titleOf: ["school", "executionDate"], titlePrefix: "الخطة الأسبوعية — ", dateField: "executionDate",
      list: ["school", "targetCount", "executionDate"], fields: EDU.concat([
        T("school", "المدرسة"), D("executionDate", "التاريخ"), N("targetCount", "عدد المستهدفين"), A("studentNames", "أسماء الطلاب/ات", { span: 2 }),
        L("goals", "الأهداف", ["معرفة الدرس الجديد والاستعداد له", "معرفة المهام المطلوبة وإنجازها"], { span: 2 }), A("implementationSteps", "خطوات التنفيذ", { span: 2 }),
        IMG("image1Url", "صورة 1"), IMG("image2Url", "صورة 2"), IMG("image3Url", "صورة 3"), IMG("image4Url", "صورة 4")]) },
    { id: "weekly-lesson-plan", group: "الأداء التعليمي", icon: "📝", title: "خطة الدرس الأسبوعية", table: "weekly_lesson_plan_reports", std: [6], cat: "plans", titleOf: ["subject", "weekNumber"], titlePrefix: "خطة درس — ",
      list: ["subject", "dayName", "weekNumber"], fields: EDU.concat([
        T("educationOffice", "مكتب التعليم"), T("school", "المدرسة"), T("subject", "المادة"), T("dayName", "اليوم"), T("hijriDate", "التاريخ الهجري"), T("weekNumber", "رقم الأسبوع"),
        A("studentNames", "أسماء الطلاب/ات", { span: 2 }), T("objective1", "الهدف الأول"), T("objective2", "الهدف الثاني"),
        IMG("activity1Url", "نشاط 1"), IMG("activity2Url", "نشاط 2"), IMG("activity3Url", "نشاط 3"), IMG("activity4Url", "نشاط 4"), A("notes", "الملاحظات", { span: 2 })]) },
    { id: "teacher-visit", group: "الأداء التعليمي", icon: "👁️", title: "تقرير زيارة معلم", table: "teacher_visit_reports", std: [2], cat: "executive-reports", titleOf: ["lessonTopic", "visitDate"], titlePrefix: "زيارة صفية — ", dateField: "visitDate",
      list: ["subject", "visitorTeacherName", "visitDate"], fields: EDU.concat([
        T("educationOffice", "مكتب التعليم"), T("school", "المدرسة"), T("semester", "الفصل الدراسي"), D("visitDate", "تاريخ الزيارة"), T("subject", "المادة"), T("lessonTopic", "موضوع الدرس"),
        T("visitorTeacherName", "اسم المعلم/ة الزائر"), T("visitedTeacherName", "اسم المعلم/ة المراد زيارته"), A("studentNames", "أسماء الطلاب/ات", { span: 2 }),
        f("indicators", "مؤشرات الزيارة (المؤشر 1–8)", "ratings", { items: VISIT_IND, options: RATING, span: 2, cols: ["indicator1", "indicator2", "indicator3", "indicator4", "indicator5", "indicator6", "indicator7", "indicator8"] }),
        A("positivePoints", "أبرز النقاط الإيجابية", { span: 2 }), T("visitorSignature", "المعلم/ة الزائر (توقيع)"), T("visitedSignature", "المعلم/ة المراد زيارته (توقيع)"),
        T("deputySignature", "وكيل الشؤون التعليمية"), T("principalSignature", "مدير/ة المدرسة")]) },
    { id: "learning-pattern", group: "الأداء التعليمي", icon: "🧠", title: "تحليل أنماط التعلم", table: "learning_pattern_analysis", std: [10, 4], cat: "analysis-assessment", titleOf: ["school"], titlePrefix: "تحليل أنماط التعلم — ",
      list: ["school", "totalStudents"], fields: EDU.concat([
        T("school", "المدرسة"), A("studentNames", "أسماء الطلاب/ات", { span: 2 }), N("visualCount", "النمط البصري"), N("auditoryCount", "النمط السمعي"),
        N("readWriteCount", "نمط الكتابة والقراءة"), N("kinestheticCount", "النمط الحركي"), N("totalStudents", "إجمالي الطلاب/ات")]) },
    { id: "detailed-remedial", group: "الأداء التعليمي", icon: "🩺", title: "خطة علاجية تفصيلية", table: "detailed_remedial_plans", std: [5], cat: "plans", titleOf: ["subject", "gradeClass"], titlePrefix: "خطة علاجية تفصيلية — ",
      list: ["subject", "gradeClass", "stage"], fields: EDU.concat([
        T("educationOffice", "مكتب التعليم"), A("studentNames", "أسماء الطلاب/ات", { span: 2 }), T("subject", "المادة"), T("gradeClass", "الصف / الفصل"), T("stage", "المرحلة"),
        A("skillWeakness", "المهارة / جانب الضعف", { span: 2 }), A("deficiencyReasons", "أسباب القصور", { span: 2 }), A("remedialPlan", "الخطة العلاجية", { span: 2 }),
        A("remedialProcedures", "الإجراءات العلاجية", { span: 2 }), A("expectedImpact", "الأثر المتوقع", { span: 2 })]) },
    { id: "comprehensive-remedial", group: "الأداء التعليمي", icon: "📒", title: "سجل الخطة العلاجية الشاملة للطالب", table: "comprehensive_remedial_records", std: [5, 3], cat: "plans", titleOf: ["studentFullName"], titlePrefix: "سجل علاجي شامل — ",
      list: ["grade", "classTeacher", "counselorName"], fields: [
        T("studentFullName", "اسم الطالب/ة الرباعي"), D("dateOfBirth", "تاريخ الميلاد"), T("siblingRank", "ترتيبه بين إخوانه"), T("grade", "الصف"),
        A("declineReasons", "أسباب تراجع مستوى الطالب/ة", { span: 2 }), A("actionsTaken", "الإجراءات المتخذة", { span: 2 }), T("counselorName", "اسم الموجه الطلاب/اتي"),
        L("unmasteredSubjects", "المواد غير المتقنة", [""], { span: 2 }),
        T("referrerName", "اسم المحيل"), T("principalNameReferral", "اسم قائد/ة المدرسة (الإحالة)"),
        { sec: "نموذج دعوة ولي/ة الأمر" }, T("invitationNumber", "رقم الدعوة"), D("invitationDate", "التاريخ"), T("invitationDay", "اليوم"), T("invitationTime", "الوقت"),
        T("classTeacher", "معلم الفصل"), T("principalNameInvitation", "قائد/ة المدرسة"), T("counselorNameInvitation", "الموجه الطلاب/اتي"),
        { sec: "نموذج الاتصال بولي/ة الأمر" }, T("callNumber", "رقم الاتصال"), D("callDate", "التاريخ"), T("callDay", "اليوم"), T("callTime", "الوقت"),
        A("callReport", "تقرير المكالمة", { span: 2 }), T("subjectTeacherCall", "معلم المادة"), T("principalNameCall", "قائد/ة المدرسة"),
        { sec: "محضر اجتماع ولي/ة الأمر" }, T("meetingNumber", "رقم الاجتماع"), T("meetingDay", "اليوم"), D("meetingDate", "التاريخ"), T("meetingTime", "الوقت"),
        A("meetingObjective", "أهداف الاجتماع", { span: 2 }), A("meetingDiscussion", "ما تم مناقشته", { span: 2 }), T("subjectTeacherMeeting", "معلم المادة"),
        T("principalNameMeeting", "قائد/ة المدرسة"), T("counselorNameMeeting", "الموجه الطلاب/اتي"), T("parentNameMeeting", "ولي/ة الأمر"),
        { sec: "المهارات غير المتقنة (نهاية فترة التقويم)" }, D("failedSkillsDate", "التاريخ"), T("evaluationPeriodFailed", "فترة التقويم"),
        f("failedSubjectsSkills", "المواد والمهارات غير المتقنة", "rows", { span: 2, cols: [{ id: "subject", label: "المادة" }, { id: "skill", label: "المهارة" }, { id: "notes", label: "ملاحظات" }] }),
        T("classTeacherFailed", "معلم الفصل"), T("principalNameFailed", "قائد/ة المدرسة"), T("parentNameFailed", "ولي/ة الأمر"),
        { sec: "نتائج نهاية الفترة" }, D("periodEndDate", "التاريخ"), T("studentLevel", "مستوى الطالب/ة"), T("periodSubject", "المادة"), T("evaluationPeriodEnd", "فترة التقويم"),
        f("periodSkills", "المهارات", "rows", { span: 2, cols: [{ id: "number", label: "م" }, { id: "skill", label: "المهارة" }, { id: "subSkills", label: "المهارات الفرعية" }] }),
        T("classTeacherPeriod", "معلم الفصل"), T("principalNamePeriod", "قائد/ة المدرسة"), T("parentNamePeriod", "ولي/ة الأمر")] },
    { id: "learning-loss", group: "الأداء التعليمي", icon: "📉", title: "الفاقد التعليمي", table: "learning_loss_plans", std: [5, 10], cat: "analysis-assessment", titleOf: ["title", "subject"], dateField: "planDate",
      list: ["subject", "grade", "semester"], fields: [
        T("title", "عنوان الخطة"), S("subject", "المادة", SUBJECTS), S("grade", "الصف", GRADES), S("semester", "الفصل الدراسي", SEMS), T("targetGroup", "الفئة المستهدفة"),
        N("targetStudentCount", "عدد الطلاب/ات المستهدفين"), T("planDate", "تاريخ إعداد الخطة (هجري)"), T("teacherName", "اسم المعلم/ة"), T("principalName", "اسم المدير/ة"),
        L("monitoringObjectives", "أهداف الرصد", ["تحديد المهارات الأساسية غير المتقنة من العام السابق.", "تشخيص أسباب ضعف التحصيل لدى الطلاب/ات المستهدفين.", "بناء خطط علاجية فردية وجماعية لسد الفجوة.", "قياس أثر المعالجة بعد تطبيق الخطة."], { span: 2 }),
        L("skills", "المهارات المستهدفة", ["القراءة والفهم القرائي", "الكتابة والتعبير الكتابي", "حل المشكلات والتفكير النقدي", "التطبيق العملي للمفاهيم", "التحليل والاستنتاج", "التواصل والعرض الشفوي"], { span: 2 }),
        f("studentsData", "جدول رصد الطلاب/ات (حالة كل مهارة والخطة المقترحة)", "students", { span: 2, statuses: ["أتقن", "أتقن جزئياً", "لم يتقن"], plans: ["دعم بالأقران", "خطة مكثفة فردية", "تدخل علاجي إضافي", "متابعة مستمرة"] }),
        N("masteredPercentage", "نسبة الإتقان (%)"), N("partiallyMasteredPercentage", "نسبة الإتقان الجزئي (%)"), N("notMasteredPercentage", "نسبة عدم الإتقان (%)"),
        L("groupRemedialPlan", "الخطة العلاجية الجماعية", ["حصص تقوية إضافية (حصتان أسبوعياً).", "استخدام أوراق عمل تفاعلية ومكثفة.", "التعلم بالأقران (طالب متقن مع طالب غير متقن).", "تفعيل الألعاب التعليمية الرقمية (مثل كاهوت)."], { span: 2 }),
        L("measurementTools", "أدوات القياس", ["اختبار بعدي (نفس مهارات الاختبار القبلي).", "ملاحظة الأداء في الأنشطة الصفية.", "تقييم شفوي فردي أثناء الحصة.", "مراجعة الواجبات المخصصة للخطة."], { span: 2 }),
        A("gapDescription", "وصف الفجوة التعليمية", { span: 2 }), A("intervention", "التدخل المنفذ", { span: 2 }), A("results", "النتائج", { span: 2 }),
        N("studentCount", "عدد الطلاب/ات"), N("improvementRate", "معدل التحسن (%)")] },
    { id: "improvement-plan", group: "الأداء التعليمي", icon: "📈", title: "خطة التحسين النصفية للطلاب الضعاف", table: "(صفحة خطة التحسين)", std: [5], cat: "plans", titleOf: ["planTitle", "subject"], dateField: "startDate",
      list: ["subject", "grade", "term"], fields: [
        T("planTitle", "عنوان الخطة", { def: "خطة التحسين النصفية للطلاب الضعاف", span: 2 }), A("officialText", "الجهة الرسمية", { def: "المملكة العربية السعودية\nوزارة التعليم\nالإدارة العامة للتعليم بالمنطقة الشرقية", span: 2 }),
        T("school", "المدرسة"), T("subject", "مادة الخطة"), T("grade", "الصف"), S("term", "الفصل الدراسي", ["الأول", "الثاني"]), T("year", "العام الدراسي (هـ)"),
        T("planDate", "تاريخ إعداد الخطة (هجري)"), T("note", "ملاحظة (اختياري)"), D("startDate", "بداية الأسبوع الأول (ميلادي)"), D("endDate", "نهاية الأسبوع الأخير (ميلادي)"),
        f("weeks", "الأسابيع", "imp-weeks", { span: 2 }),
        f("goals", "الأهداف", "list", { def: ["", "", ""], span: 2 }), f("actions", "الإجراءات", "list", { def: ["", "", "", "", "", ""], span: 2 }),
        f("impSkills", "تعبئة الأهداف والإجراءات من مهارات المادة", "imp-skills", { span: 2 }),
        T("midBreakDay", "بداية إجازة منتصف العام — اليوم"), T("midBreakMonth", "الشهر"), T("midBreakYear", "السنة (هجري)"),
        T("secondTermDay", "بداية الفصل الثاني — اليوم"), T("secondTermMonth", "الشهر"), T("secondTermYear", "السنة (هجري)"),
        T("teacherName", "اسم معلم/ة المادة"), T("principalName", "اسم مدير/ة المدرسة"), T("supervisorName", "اسم المشرف/ة التربوي/ة"),
        S("orientation", "اتجاه الطباعة", ["portrait", "landscape"], { def: "portrait" })] },

    // ===================== الإنجازات والمشاركة =====================
    { id: "achievement-evidence", group: "الإنجازات والمشاركة", icon: "🏆", title: "شاهد إنجاز (تقرير مصوّر)", table: "achievement_evidence_reports", std: [1], cat: "executive-reports", titleOf: ["reportType", "school"], titlePrefix: "شاهد إنجاز — ",
      list: ["reportType", "school"], fields: EDU.concat([
        T("school", "المدرسة"), S("reportType", "نوع الشاهد", REPORT_TYPES), A("studentNames", "أسماء الطلاب/ات", { span: 2 }),
        IMG("achievementImagesUrl", "صور الإنجاز"), IMG("parentMeetingImagesUrl", "صور لقاء أولياء الأمور"), IMG("evaluationFormsUrl", "استمارات التقييم"), IMG("trainingPapersUrl", "أوراق التدريب"),
        A("additionalNotes", "ملاحظات إضافية", { span: 2 })]) },
    { id: "program-activity", group: "الإنجازات والمشاركة", icon: "🎯", title: "نموذج تنفيذ برنامج / نشاط", table: "program_activity_forms", std: [2], cat: "initiatives-programs", titleOf: ["programName"], dateField: "executionDate",
      list: ["implementingEntity", "targetGroup", "executionDate"], fields: [
        T("school", "المدرسة"), D("executionDate", "التاريخ"), T("programName", "اسم البرنامج/النشاط"), T("programTitle", "مسمى البرنامج"), T("implementingEntity", "الجهة المنفذة"),
        T("targetGroup", "الفئة المستهدفة"), N("targetCount", "عدد المستهدفين"), T("studentsCommittee", "لجنة الطلاب/ات"), T("stage", "المرحلة"), T("implementationLocation", "مكان التنفيذ"),
        T("timing", "التوقيت"), T("viewersCommittee", "لجنة المشاهدين"), T("principalSignature", "مدير/ة المدرسة"), T("supervisorSignature", "المشرف/ة التربوي")] },
    { id: "program-execution", group: "الإنجازات والمشاركة", icon: "🚀", title: "تنفيذ البرامج والأنشطة", table: "program_execution_forms", std: [2], cat: "initiatives-programs", titleOf: ["title"],
      list: ["targetAudience", "activityType"], fields: [
        T("title", "عنوان البرنامج/النشاط"), S("targetAudience", "الفئة المستهدفة", ["طلاب", "معلمين", "أولياء أمور"]), S("activityType", "نوع النشاط", ["نادي علمي", "مسابقة", "إذاعة مدرسية", "زيارة خارجية"]),
        T("category", "التصنيف"), A("achievementSummary", "ملخص الإنجاز", { span: 2 }), IMG("mediaFiles", "صورة/ملف التوثيق")] },
    { id: "general-evidence", group: "الإنجازات والمشاركة", icon: "🗃️", title: "شاهد عام (غير مرتبط بمعيار)", table: "(GeneralEvidence — Base44)", std: [], cat: "executive-reports", titleOf: ["title"],
      list: ["stage"], fields: [T("title", "عنوان الشاهد"), S("stage", "المرحلة", ["ابتدائي", "متوسط", "ثانوي"]), A("description", "الوصف", { span: 2 }), IMG("file", "الملف / الصورة")] },
    { id: "learning-initiative", group: "الإنجازات والمشاركة", icon: "💡", title: "مبادرة تحسين نواتج التعلم", table: "(LearningOutcomesInitiative — Base44)", std: [5, 10], cat: "initiatives-programs", titleOf: ["initiativeName"],
      list: ["subject", "strategyName", "targetCategory"], fields: [
        T("initiativeName", "اسم المبادرة"), T("subject", "المادة"), T("strategyName", "اسم الاستراتيجية"), T("targetCategory", "الفئة المستهدفة"), T("targetCount", "عدد المستهدفين"), T("implementationPlace", "مكان التنفيذ"),
        A("initiativeGoal", "هدف المبادرة", { span: 2 }), A("implementationElements", "عناصر التنفيذ", { span: 2 }), A("activities", "الأنشطة", { span: 2 }), A("documentation", "التوثيق", { span: 2 }), A("successIndicators", "مؤشرات النجاح", { span: 2 }),
        IMG("logoUrl", "شعار المبادرة"), IMG("evidenceUrl", "شاهد / صورة")] },
    { id: "colleague-collaboration", group: "الإنجازات والمشاركة", icon: "🤝", title: "التعاون مع الزملاء", table: "colleague_collaborations", std: [2], cat: "initiatives-programs", titleOf: ["title"], dateField: "collaborationDate",
      list: ["collaborationType", "collaborationDate"], fields: [T("title", "عنوان التعاون"), S("collaborationType", "النوع", ["مجتمع تعلم", "فريق عمل", "تبادل خبرات"]), A("colleagues", "الزملاء المشاركون", { span: 2 }), A("description", "الوصف", { span: 2 }), D("collaborationDate", "التاريخ")] },
    { id: "mutual-visits", group: "الإنجازات والمشاركة", icon: "🔁", title: "الزيارات المتبادلة", table: "mutual_visits", std: [2], cat: "executive-reports", titleOf: ["lessonTitle", "visitDate"], titlePrefix: "زيارة متبادلة — ", dateField: "visitDate",
      list: ["visitorTeacher", "hostTeacher", "visitDate"], fields: [
        T("visitorTeacher", "المعلم/ة الزائر"), T("hostTeacher", "المعلم/ة المضيف"), D("visitDate", "تاريخ الزيارة"), S("subject", "المادة", SUBJECTS), S("grade", "الصف", GRADES), T("lessonTitle", "عنوان الدرس"),
        L("visitObjectives", "أهداف الزيارة", ["تبادل الخبرات التعليمية والتربوية.", "الاطلاع على استراتيجيات تدريس جديدة.", "مناقشة أساليب إدارة الصف الفعالة.", "تعزيز التطوير المهني بين المعلمين/ات.", "رصد الممارسات المتميزة لتطبيقها."], { span: 2 }),
        L("strengthPoints", "نقاط القوة", ["التمهيد الجيد للدرس وجذب انتباه الطلاب/ات.", "استخدام فعال لاستراتيجيات التعلم النشط.", "التفاعل الإيجابي بين المعلم/ة والطلاب/ات.", "إدارة وقت الحصة بكفاءة.", "تحقيق أهداف الدرس بوضوح."], { span: 2 }),
        L("discussionPoints", "نقاط النقاش", ["تنويع أساليب التقويم الختامي.", "زيادة فرص التفكير الناقد للطلاب.", "اقتراح استخدام وسيلة (...) للدرس القادم."], { span: 2 }),
        L("recommendations", "التوصيات", ["تعميم الممارسة المتميزة (ذكر الممارسة).", "عقد ورشة عمل مصغرة لنقل الخبرة.", "الاستمرار في الزيارات التبادلية."], { span: 2 })] },

    // ===================== التقييم =====================
    { id: "self-assessment", group: "التقييم", icon: "🪞", title: "التقييم الذاتي", table: "self_assessments", std: [1], cat: "analysis-assessment", titleOf: ["title"], dateField: "assessmentDate",
      list: ["assessmentTool", "assessmentDate"], fields: [T("title", "عنوان التقييم"), S("assessmentTool", "أداة التقييم", ["استبانة", "بطاقة ملاحظة", "مقياس"]), D("assessmentDate", "التاريخ"), A("strengths", "نقاط القوة", { span: 2 }), A("improvementAreas", "نقاط التطوير", { span: 2 }), A("improvementPlan", "خطة التحسين", { span: 2 })] },
    { id: "management-assessment", group: "التقييم", icon: "🧑‍💼", title: "التقييم الإداري", table: "management_assessments", std: [1], cat: "analysis-assessment", titleOf: ["evaluatorName", "visitType"], titlePrefix: "تقييم إداري — ", dateField: "assessmentDate",
      list: ["evaluatorType", "visitType", "assessmentDate"], fields: [S("evaluatorType", "نوع المقيّم", ["قائد/ة المدرسة", "المشرف/ة التربوي"]), T("evaluatorName", "اسم المقيّم"), S("visitType", "نوع الزيارة", ["زيارة صفية", "إشرافية", "توجيهية"]), D("assessmentDate", "التاريخ"), A("evaluation", "التقييم", { span: 2 }), A("recommendations", "التوصيات", { span: 2 })] }
  ];

  window.PF_FORMS = FORMS;
  window.PF_FORM_CONST = { SUBJECTS: SUBJECTS, GRADES: GRADES, SEMS: SEMS };
})();
