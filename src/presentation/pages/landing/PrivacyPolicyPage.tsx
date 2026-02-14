import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-soft-cloud" dir="rtl">
            {/* Header */}
            <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none transition-opacity hover:opacity-80"
                        onClick={() => navigate(ROUTES.HOME)}
                    >
                        <img src="/images/subol-red.png" alt="سُبُل" className="w-6 h-6 sm:w-8 sm:h-8" />
                        <span className="text-base sm:text-xl font-extrabold text-charcoal whitespace-nowrap">سُبُل</span>
                    </div>

                    <Link to={ROUTES.HOME} className="btn-secondary-pro flex items-center gap-2 px-4 py-2">
                        <span>العودة للرئيسية</span>
                        <ArrowLeft size={18} className="rotate-180" />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">سياسة الخصوصية لمنصة سُبُل</h1>
                        <p className="text-slate-500 bg-slate-100 inline-block px-4 py-1.5 rounded-full text-sm font-medium">آخر تحديث: فبراير 2026</p>
                    </div>

                    <div className="space-y-12 text-slate-600 leading-relaxed text-justify">
                        {/* المقدمة */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">المقدمة</h2>
                            <p className="mb-4">
                                مرحباً بكم في منصة سُبُل التعليمية. نحن نلتزم بحماية خصوصيتكم ونسعى جاهدين لضمان شفافية كاملة حول كيفية جمع واستخدام وحماية بياناتكم الشخصية. توضح سياسة الخصوصية هذه الممارسات المتبعة في جمع المعلومات واستخدامها وحمايتها عند استخدامكم لمنصتنا التعليمية المتكاملة.
                            </p>
                            <p className="mb-4">
                                باستخدامكم لمنصة سُبُل، فإنكم توافقون على جمع واستخدام معلوماتكم وفقاً لهذه السياسة. نحثكم على قراءة هذه الوثيقة بعناية لفهم حقوقكم والتزاماتكم.
                            </p>
                            <p className="text-sm">
                                تُعد سياسة الخصوصية هذه جزءاً لا يتجزأ من{' '}
                                <Link to="/terms-and-conditions" className="text-shibl-crimson font-bold hover:underline">الشروط والأحكام</Link>{' '}
                                الخاصة بالمنصة.
                            </p>
                        </section>

                        {/* 1. معلومات عنا */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">1. معلومات عنا</h2>
                            <p className="mb-4">
                                منصة سُبُل هي منصة تعليمية متكاملة تجمع بين الفصول التفاعلية المباشرة والتسجيلات المرئية والمتابعة الدقيقة لضمان أفضل تجربة تعليمية. تخدم المنصة أربع فئات من المستخدمين: الطلاب، أولياء الأمور، المعلمين، والمسؤولين. نسعى لتقديم بيئة تعليمية متميزة تساعد الطلاب على تحقيق أهدافهم الأكاديمية من خلال محتوى تعليمي عالي الجودة ومتابعة مستمرة لتقدمهم العلمي.
                            </p>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                                <h3 className="font-bold text-charcoal mb-2">يمكنكم التواصل معنا عبر:</h3>
                                <ul className="space-y-2 text-sm sm:text-base">
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold min-w-24">الموقع الإلكتروني:</span>
                                        <a href="https://www.soubul.net/" target="_blank" rel="noopener noreferrer" className="text-shibl-crimson hover:underline dir-ltr">https://www.soubul.net/</a>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold min-w-24">البريد الإلكتروني:</span>
                                        <a href="mailto:Academy@meet.soubul.net" className="text-shibl-crimson hover:underline dir-ltr">Academy@meet.soubul.net</a>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold min-w-24">رقم التواصل:</span>
                                        <span className="dir-ltr">91938082</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold min-w-24">ساعات العمل:</span>
                                        <span>24 ساعة</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold min-w-24">العنوان:</span>
                                        <span>عُمان</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* 2. المعلومات التي نجمعها */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">2. المعلومات التي نجمعها</h2>
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.1 المعلومات الشخصية
                                    </h3>
                                    <p className="mb-2 text-sm text-slate-500">عند تسجيلكم في منصة سُبُل، نقوم بجمع المعلومات الشخصية التالية حسب نوع الحساب:</p>
                                    <ul className="grid sm:grid-cols-2 gap-3">
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">الاسم الكامل:</strong>يُستخدم للتعريف بحسابكم الشخصي وعرض اسمكم في الفصول المباشرة.</li>
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">البريد الإلكتروني:</strong>يُستخدم لتسجيل الدخول والتحقق من الحساب والتواصل.</li>
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">رقم الهاتف:</strong>يُستخدم للتواصل والمصادقة على الحساب.</li>
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">تاريخ الميلاد:</strong>يُستخدم لتحديد الصف الدراسي المناسب.</li>
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">الجنس:</strong>يُستخدم لأغراض إحصائية وتخصيص المحتوى.</li>
                                        <li className="bg-white p-3 rounded-xl border border-slate-100 text-sm"><strong className="block text-charcoal mb-1">الدولة والمدينة:</strong>لتحديد الموقع الجغرافي والمنطقة الزمنية.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.2 المعلومات التعليمية
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li><strong>الصف والفصل الدراسي (السمستر):</strong> لتحديد المقررات المناسبة.</li>
                                        <li><strong>المقررات المسجلة:</strong> لتتبع تقدمكم في الدورات.</li>
                                        <li><strong>نتائج الاختبارات والتقييمات:</strong> بما في ذلك الاختيار المتعدد والصح/الخطأ والمقالي.</li>
                                        <li><strong>سجل الحضور والمشاركة:</strong> في الفصول التفاعلية المباشرة.</li>
                                        <li><strong>حالة الحصص:</strong> (مكتمل، فائت، قادم) لتتبع الالتزام.</li>
                                        <li><strong>الواجبات:</strong> المقدمة من قبل الطلاب مع التقييمات.</li>
                                        <li><strong>ملاحظات المعلمين:</strong> والملاحظات التعليمية على الاختبارات المقالية.</li>
                                        <li><strong>سجل مشاهدة التسجيلات:</strong> للفصول المباشرة المسجلة.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.3 بيانات أولياء الأمور
                                    </h3>
                                    <p className="mb-2 text-sm">عند ربط حساب ولي الأمر بحسابات الأبناء، نجمع:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>بيانات ولي الأمر الشخصية (الاسم، البريد الإلكتروني، الهاتف).</li>
                                        <li>معلومات الربط بحسابات الطلاب (الأبناء).</li>
                                        <li>سجل متابعة الأبناء والوصول لتقارير الأداء.</li>
                                        <li>سجل المشتريات والاشتراكات عبر المتجر.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.4 معلومات الاستخدام
                                    </h3>
                                    <p className="mb-2">نقوم تلقائياً بجمع معلومات حول كيفية استخدامكم للمنصة:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>سجل تسجيل الدخول والخروج.</li>
                                        <li>الصفحات التي تزورونها والمدة الزمنية.</li>
                                        <li>نوع الجهاز ونظام التشغيل المستخدم.</li>
                                        <li>عنوان IP والموقع الجغرافي العام.</li>
                                        <li>متصفح الإنترنت المستخدم وتفاعلاتكم مع المحتوى.</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.5 ملفات تعريف الارتباط (Cookies)
                                    </h3>
                                    <p className="mb-2">
                                        نستخدم ملفات تعريف الارتباط والتقنيات المماثلة لتحسين تجربة الاستخدام وتقديم محتوى مخصص. تشمل أنواع الكوكيز المستخدمة:
                                    </p>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">كوكيز ضرورية</span>
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">كوكيز الأداء</span>
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">كوكيز الوظائف</span>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        2.6 بيانات المعاملات المالية
                                    </h3>
                                    <p className="text-sm">
                                        عند شراء مقررات أو باقات تعليمية عبر المتجر، نجمع بيانات المعاملة (تفاصيل الطلب، المبلغ، تاريخ الدفع). <strong className="text-charcoal">لا نخزن بيانات البطاقات البنكية</strong>، وتتم معالجة الدفع عبر مزودي خدمة دفع معتمدين.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. كيف نستخدم المعلومات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">3. كيف نستخدم معلوماتكم</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">3.1 تقديم الخدمات التعليمية</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm text-slate-600 marker:text-slate-400">
                                        <li>إنشاء وإدارة حسابكم الشخصي.</li>
                                        <li>توفير الوصول للمقررات والفصول التفاعلية.</li>
                                        <li>تشغيل الفصول المباشرة وتوفير التسجيلات.</li>
                                        <li>تتبع التقدم الأكاديمي وتقارير الأداء.</li>
                                        <li>إدارة الاختبارات والواجبات والتقييمات.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">3.2 تحسين خدماتنا</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm text-slate-600 marker:text-slate-400">
                                        <li>تحليل أنماط الاستخدام لتحسين المنصة.</li>
                                        <li>تطوير محتوى تعليمي وتقني جديد.</li>
                                        <li>تحسين واجهة المستخدم وتجربة التصفح.</li>
                                        <li>تحسين جودة الفصول المباشرة والتسجيلات.</li>
                                        <li>معالجة المشاكل التقنية.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">3.3 التواصل معكم</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm text-slate-600 marker:text-slate-400">
                                        <li>إرسال التحديثات والإشعارات المهمة.</li>
                                        <li>تذكيرات مواعيد الحصص والاختبارات.</li>
                                        <li>الرد على الاستفسارات وطلبات الدعم.</li>
                                        <li>إرسال النشرات البريدية (بموافقتكم).</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">3.4 الأغراض الأمنية</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm text-slate-600 marker:text-slate-400">
                                        <li>حماية الحساب من الوصول غير المصرح به.</li>
                                        <li>اكتشاف ومنع الاحتيال.</li>
                                        <li>التحقق من هوية المستخدمين عبر OTP.</li>
                                        <li>الامتثال للمتطلبات القانونية.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 4. مشاركة المعلومات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">4. مشاركة المعلومات</h2>
                            <p className="mb-4">نحن نحترم خصوصيتكم ولا نبيع بياناتكم الشخصية. قد نشارك معلوماتكم في الحالات التالية فقط:</p>
                            <ul className="space-y-4">
                                <li className="bg-slate-50 p-4 rounded-xl">
                                    <strong className="block text-charcoal mb-1">4.1 مع أولياء الأمور المربوطين:</strong>
                                    <span className="text-sm">عند ربط حساب ولي الأمر بحساب الطالب عبر نظام الطلبات، يحصل ولي الأمر على: تقارير التقدم الأكاديمي، سجل الحضور والمشاركة في الفصول، ونتائج الاختبارات والواجبات.</span>
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl">
                                    <strong className="block text-charcoal mb-1">4.2 مع المعلمين المسؤولين:</strong>
                                    <span className="text-sm">يحصل المعلم المسؤول عن المقرر على بيانات الطلاب المسجلين: الاسم، الحضور، نتائج الاختبارات، والواجبات لأغراض التقييم والمتابعة التعليمية فقط.</span>
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl">
                                    <strong className="block text-charcoal mb-1">4.3 مقدمو الخدمات:</strong>
                                    <span className="text-sm">نستعين بمقدمي خدمات خارجيين (استضافة، فصول افتراضية، دفع إلكتروني، بريد إلكتروني) بموجب تعهدات سرية صارمة. يشمل ذلك خدمة الفصول الافتراضية المباشرة (BigBlueButton).</span>
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl">
                                    <strong className="block text-charcoal mb-1">4.4 المتطلبات القانونية:</strong>
                                    <span className="text-sm">الامتثال للقوانين أو الأوامر القضائية، أو لحماية الحقوق والسلامة.</span>
                                </li>
                            </ul>
                        </section>

                        {/* 5. تسجيلات الفصول المباشرة */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">5. خصوصية الفصول المباشرة والتسجيلات</h2>
                            <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">
                                    <strong className="block text-blue-800 mb-2">5.1 التسجيل التلقائي:</strong>
                                    <span className="text-blue-700">
                                        تُسجل جميع الفصول المباشرة تلقائياً. بحضوركم الفصل، فإنكم توافقون على تسجيل الحصة بما في ذلك الصوت والصورة والمحادثة النصية. تُتاح هذه التسجيلات للطلاب المسجلين في المقرر فقط.
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.2 استخدام التسجيلات</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm marker:text-slate-400">
                                        <li>التسجيلات متاحة لأغراض المراجعة التعليمية فقط.</li>
                                        <li>لا يُسمح بتحميل أو مشاركة التسجيلات خارج المنصة.</li>
                                        <li>تظهر علامة مائية (Watermark) تحمل بيانات المستخدم على جميع الفيديوهات لضمان حماية الحقوق.</li>
                                        <li>يمكن للمعلم والمسؤولين الوصول إلى تسجيلات الفصول.</li>
                                        <li>تُحذف التسجيلات وفقاً لسياسات الاحتفاظ بالبيانات.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.3 البيانات المجمعة أثناء الفصول</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm marker:text-slate-400">
                                        <li>وقت الانضمام والخروج من الفصل.</li>
                                        <li>مدة المشاركة والحضور الفعلي.</li>
                                        <li>تفاعلات المحادثة النصية داخل الفصل.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 6. أمن البيانات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">6. أمن البيانات</h2>
                            <p className="mb-4">نتخذ إجراءات أمنية قوية لحماية معلوماتكم الشخصية:</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <h3 className="font-bold text-charcoal mb-2">6.1 التدابير التقنية</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>تشفير البيانات أثناء النقل (SSL/TLS).</li>
                                        <li>جدران حماية وأنظمة كشف الاختراق.</li>
                                        <li>تقنيات العلامة المائية الرقمية (DRM) لحماية المحتوى المرئي.</li>
                                        <li>نسخ احتياطية وتحديثات منتظمة.</li>
                                        <li>تشفير كلمات المرور بتقنيات حديثة.</li>
                                        <li>التحقق بالبريد الإلكتروني (OTP).</li>
                                    </ul>
                                </div>
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <h3 className="font-bold text-charcoal mb-2">6.2 التدابير الإدارية</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>نظام صلاحيات متعدد المستويات.</li>
                                        <li>تقييد الوصول للموظفين المصرح لهم.</li>
                                        <li>عقود سرية وتدريب للموظفين.</li>
                                        <li>مراجعات أمنية دورية.</li>
                                        <li>نظام موافقات على المحتوى قبل النشر.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800">
                                <strong>6.3 مسؤولية المستخدم:</strong> نوصي باستخدام كلمات مرور قوية، عدم مشاركة بيانات تسجيل الدخول، وتسجيل الخروج بعد الاستخدام. أنتم مسؤولون عن جميع الأنشطة التي تتم عبر حسابكم.
                            </div>
                        </section>

                        {/* 7. حقوقكم */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">7. حقوقكم المتعلقة ببياناتكم</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">حق الوصول</strong>طلب نسخة من بياناتكم</div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">حق التصحيح</strong>تعديل بيانات غير دقيقة</div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">حق الحذف</strong>مع مراعاة المتطلبات القانونية</div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">تقييد المعالجة</strong>في ظروف معينة</div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">نقل البيانات</strong>بصيغة مقروءة آلياً</div>
                                <div className="p-3 bg-slate-50 rounded-lg text-center"><strong className="block mb-1 text-charcoal">سحب الموافقة</strong>في أي وقت</div>
                            </div>
                            <p className="mt-4 text-sm text-center">لممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر قنوات الاتصال المحددة.</p>
                        </section>

                        {/* 8. الاحتفاظ بالبيانات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">8. الاحتفاظ بالبيانات</h2>
                            <ul className="space-y-2 mb-4">
                                <li><strong>البيانات الأساسية:</strong> تُحذف خلال 90 يوماً من إغلاق الحساب.</li>
                                <li><strong>السجلات الأكاديمية:</strong> قد نحتفظ بها لمدة تصل إلى 7 سنوات.</li>
                                <li><strong>تسجيلات الفصول:</strong> تُحتفظ بها طوال فترة نشاط المقرر.</li>
                                <li><strong>بيانات المعاملات المالية:</strong> وفقاً للمتطلبات المحاسبية والقانونية.</li>
                                <li><strong>سجلات الامتثال:</strong> وفقاً للمتطلبات القانونية.</li>
                            </ul>
                            <p className="text-sm bg-slate-50 p-3 rounded-lg border border-slate-200 inline-block">تُحذف البيانات تلقائياً عند طلب الحذف، عدم النشاط لفترة محددة، أو انتهاء الغرض.</p>
                        </section>

                        {/* 9. خصوصية الأطفال */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">9. خصوصية الأطفال</h2>
                            <p className="mb-4">
                                تستهدف منصة سُبُل الطلاب من مختلف الأعمار والصفوف الدراسية. نلتزم بحماية خصوصية الأطفال. بالنسبة للمستخدمين دون سن 18 عاماً:
                            </p>
                            <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                <li>يجب التسجيل من خلال ولي الأمر أو بموافقته.</li>
                                <li>يحق لولي الأمر ربط حسابه بحساب الطالب عبر نظام الطلبات.</li>
                                <li>يمكن لولي الأمر مراجعة تقارير أداء الطالب والوصول لبياناته التعليمية.</li>
                                <li>لا نجمع معلومات زائدة عن الحاجة من الأطفال.</li>
                                <li>لا نشارك بيانات الأطفال مع أطراف ثالثة للإعلانات.</li>
                            </ul>
                        </section>

                        {/* 10. الروابط الخارجية */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">10. الروابط لمواقع خارجية</h2>
                            <p>
                                قد تحتوي منصتنا على روابط خارجية، بما في ذلك روابط الفصول الافتراضية. نحن لسنا مسؤولين عن ممارسات الخصوصية لتلك المواقع، وننصحكم بمراجعة سياساتها.
                            </p>
                        </section>

                        {/* 11. التحديثات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">11. التحديثات على السياسة</h2>
                            <p>
                                قد نقوم بتحديث السياسة من وقت لآخر. سنخطركم بالتغييرات الجوهرية عبر البريد أو إشعار في المنصة. استمرار الاستخدام يعني الموافقة على السياسة المحدثة.
                            </p>
                        </section>

                        {/* 12. الشكاوى */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">12. الاعتراضات والشكاوى</h2>
                            <p>
                                نلتزم بالرد على الشكاوى المتعلقة بالخصوصية خلال 30 يوماً. إذا لم نتمكن من حل الشكوى، يحق لكم اللجوء للسلطات المختصة في سلطنة عُمان.
                            </p>
                        </section>

                        {/* 13. أحكام عامة */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">13. أحكام عامة</h2>
                            <div className="space-y-3 text-sm">
                                <p>تخضع هذه السياسة لقوانين سلطنة عُمان. في حال وجود اختلاف في الترجمة، النص العربي هو المعتمد.</p>
                                <p>
                                    تُشكل هذه السياسة و<Link to="/terms-and-conditions" className="text-shibl-crimson hover:underline">الشروط والأحكام</Link> الاتفاقية الكاملة بين المستخدم والمنصة فيما يتعلق بالخصوصية.
                                </p>
                            </div>
                        </section>

                        {/* 14. التواصل */}
                        <section id="contact" className="bg-shibl-light-crimson/5 border border-shibl-crimson/10 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-shibl-crimson mb-6 text-center">14. كيفية التواصل معنا</h2>
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-charcoal border-b border-shibl-crimson/20 pb-2 inline-block">معلومات التواصل</h3>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-shibl-crimson"></span>
                                            <span className="font-semibold w-20">البريد:</span>
                                            <a href="mailto:Academy@meet.soubul.net" className="text-shibl-crimson hover:underline dir-ltr">Academy@meet.soubul.net</a>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-shibl-crimson"></span>
                                            <span className="font-semibold w-20">الموقع:</span>
                                            <a href="https://www.soubul.net/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-shibl-crimson dir-ltr">www.soubul.net</a>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-shibl-crimson"></span>
                                            <span className="font-semibold w-20">Whatsapp:</span>
                                            <a href="https://shorturl.at/Lenmh" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-green-600 dir-ltr">91938082</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-bold text-charcoal border-b border-shibl-crimson/20 pb-2 inline-block">قنوات التواصل</h3>
                                    <div className="flex flex-col gap-3">
                                        <a href="https://shorturl.at/Lenmh" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:shadow-md transition-shadow group">
                                            <img src="/images/social/whatsapp.svg" alt="Whatsapp" className="w-6 h-6" onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg')} />
                                            <span className="font-medium text-slate-700 group-hover:text-green-600">قناة واتساب الرسمية</span>
                                        </a>
                                        <a href="https://shorturl.at/BT1Yq" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:shadow-md transition-shadow group">
                                            <img src="/images/social/instagram.svg" alt="Instagram" className="w-6 h-6" onError={(e) => (e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg')} />
                                            <span className="font-medium text-slate-700 group-hover:text-pink-600">حساب إنستجرام</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 text-center border-t border-shibl-crimson/10 pt-4 text-slate-500 text-sm">
                                <p>© 2026 منصة سُبُل - جميع الحقوق محفوظة</p>
                                <p className="font-amiri mt-1 text-shibl-crimson font-bold">علم يوصل للمستقبل</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
