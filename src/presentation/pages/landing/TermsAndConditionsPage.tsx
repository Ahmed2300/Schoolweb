import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const TermsAndConditionsPage = () => {
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
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-4">الشروط والأحكام لمنصة سُبُل</h1>
                        <p className="text-slate-500 bg-slate-100 inline-block px-4 py-1.5 rounded-full text-sm font-medium">آخر تحديث: فبراير 2026</p>
                    </div>

                    <div className="space-y-12 text-slate-600 leading-relaxed text-justify">
                        {/* المقدمة */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">المقدمة</h2>
                            <p className="mb-4">
                                مرحباً بكم في منصة سُبُل التعليمية. يُرجى قراءة شروط الاستخدام هذه بعناية قبل استخدام المنصة. باستخدامكم لمنصة سُبُل، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. إذا لم توافقوا على أي جزء من هذه الشروط، يُرجى الامتناع عن استخدام المنصة.
                            </p>
                            <p>
                                تُعد هذه الشروط اتفاقية ملزمة قانونياً بينكم وبين منصة سُبُل وتُنظم علاقتكم بالمنصة وجميع الخدمات المقدمة من خلالها.
                            </p>
                        </section>

                        {/* 1. تعريفات ومصطلحات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">1. تعريفات ومصطلحات</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        1.1 المنصة
                                    </h3>
                                    <p className="text-sm sm:text-base">
                                        تعني منصة سُبُل التعليمية وجميع خدماتها الإلكترونية المتاحة عبر الموقع الإلكتروني{' '}
                                        <a href="https://www.soubul.net/" target="_blank" rel="noopener noreferrer" className="text-shibl-crimson hover:underline dir-ltr">https://www.soubul.net/</a>{' '}
                                        وتشمل المحتوى التعليمي والفصول التفاعلية المباشرة وخدمات المتابعة والتقييم.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        1.2 المستخدم
                                    </h3>
                                    <p className="mb-2 text-sm sm:text-base">كل شخص يقوم بالتسجيل في المنصة واستخدام خدماتها، ويشمل الفئات التالية:</p>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li><strong>الطالب:</strong> الشخص المسجل للاستفادة من المحتوى التعليمي والفصول المباشرة.</li>
                                        <li><strong>ولي الأمر:</strong> الشخص المسؤول عن متابعة أداء الطالب (الأبناء) عبر لوحة مراقبة خاصة.</li>
                                        <li><strong>المعلم:</strong> الشخص المعتمد من المنصة لتقديم المحتوى التعليمي وإدارة الفصول والاختبارات.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        1.3 المحتوى التعليمي
                                    </h3>
                                    <p className="text-sm sm:text-base">
                                        يشمل جميع المواد التعليمية المتاحة على المنصة، بما في ذلك: الدروس المباشرة والمسجلة، الفيديوهات التعليمية، الاختبارات والتقييمات، الواجبات، المرفقات والملفات الدراسية، والوحدات التعليمية المنظمة ضمن المقررات.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        1.4 الفصل التفاعلي المباشر
                                    </h3>
                                    <p className="text-sm sm:text-base">
                                        حصة دراسية مباشرة تُعقد عبر المنصة في الوقت الفعلي باستخدام تقنية الفصول الافتراضية، تتيح التفاعل المباشر بين المعلم والطلاب.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-charcoal mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson"></span>
                                        1.5 الباقة
                                    </h3>
                                    <p className="text-sm sm:text-base">
                                        مجموعة مقررات دراسية مجمّعة بسعر خاص، قد تتضمن خصومات تشجيعية.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. قبول الشروط */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">2. قبول الشروط</h2>
                            <div className="space-y-4">
                                <p>
                                    <strong className="text-charcoal">2.1 الموافقة على الشروط:</strong> بإنشائكم حساباً على المنصة أو استخدامكم لخدماتها، فإنكم تعلنون موافقتكم على هذه الشروط والأحكام وسياسة الخصوصية وتتعهدون بالالتزام بها.
                                </p>
                                <p>
                                    <strong className="text-charcoal">2.2 التعديلات:</strong> نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطار المستخدمين بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة. استمراركم في استخدام المنصة بعد نشر التعديلات يُعتبر موافقةً عليها.
                                </p>
                                <p>
                                    <strong className="text-charcoal">2.3 النسخة المعتمدة:</strong> النسخة العربية من هذه الشروط هي النسخة المعتمدة. في حال وجود أي تضارب بين النسخة العربية وأي ترجمة أخرى، تُعتبر النسخة العربية هي المرجع.
                                </p>
                            </div>
                        </section>

                        {/* 3. شروط التسجيل والحساب */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">3. شروط التسجيل والحساب</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">3.1 الأهلية للتسجيل</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>أن يكونوا قادرين على الالتزام بهذه الشروط والأحكام.</li>
                                        <li>بالنسبة للطلاب القصر، يجب أن يتم التسجيل من خلال ولي الأمر.</li>
                                        <li>تقديم معلومات صحيحة ودقيقة عند التسجيل.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">3.2 أنواع الحسابات</h3>
                                    <div className="grid sm:grid-cols-3 gap-4">
                                        <div className="border border-slate-100 rounded-xl p-4">
                                            <h4 className="font-bold text-charcoal mb-2 text-sm">حساب الطالب</h4>
                                            <ul className="text-xs sm:text-sm space-y-1 text-slate-600">
                                                <li>• الوصول إلى المقررات والدروس المسجل فيها</li>
                                                <li>• حضور الفصول التفاعلية المباشرة</li>
                                                <li>• أداء الاختبارات والواجبات</li>
                                                <li>• مشاهدة تسجيلات الحصص</li>
                                                <li>• متابعة الجدول الدراسي</li>
                                                <li>• إدارة طلبات ربط ولي الأمر</li>
                                            </ul>
                                        </div>
                                        <div className="border border-slate-100 rounded-xl p-4">
                                            <h4 className="font-bold text-charcoal mb-2 text-sm">حساب ولي الأمر</h4>
                                            <ul className="text-xs sm:text-sm space-y-1 text-slate-600">
                                                <li>• ربط حسابه بحسابات الأبناء</li>
                                                <li>• متابعة تقدم الأبناء الأكاديمي</li>
                                                <li>• الاطلاع على تقارير الأداء</li>
                                                <li>• شراء المقررات والباقات من المتجر</li>
                                            </ul>
                                        </div>
                                        <div className="border border-slate-100 rounded-xl p-4">
                                            <h4 className="font-bold text-charcoal mb-2 text-sm">حساب المعلم</h4>
                                            <ul className="text-xs sm:text-sm space-y-1 text-slate-600">
                                                <li>• إنشاء وإدارة المقررات والدروس</li>
                                                <li>• إدارة الفصول المباشرة</li>
                                                <li>• إعداد الاختبارات وتصحيحها</li>
                                                <li>• تقييم الطلاب ورصد الدرجات</li>
                                                <li>• تحليلات الأداء والحضور</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">3.3 إنشاء الحساب</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>تقديم معلومات شخصية صحيحة وكاملة ومحدَّثة.</li>
                                        <li>الحفاظ على سرية كلمة المرور وعدم مشاركتها مع الغير.</li>
                                        <li>عدم إنشاء أكثر من حساب شخصي واحد من نفس النوع.</li>
                                        <li>تأكيد البريد الإلكتروني عبر رمز التحقق المرسل لإتمام التسجيل.</li>
                                        <li>إبلاغنا فوراً في حال الاشتباه في اختراق الحساب.</li>
                                    </ul>
                                </div>
                                <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800">
                                    <strong>3.4 تعليق أو إلغاء الحساب:</strong> نحتفظ بالحق في تعليق أو إلغاء أي حساب في حالات انتهاك الشروط، تقديم معلومات كاذبة، السلوك الضار، أو عدم دفع الرسوم المستحقة.
                                </div>
                            </div>
                        </section>

                        {/* 4. الخدمات التعليمية */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">4. الخدمات التعليمية</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">4.1 نطاق الخدمات</h3>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            'فصول تفاعلية مباشرة عبر نظام الفصول الافتراضية',
                                            'تسجيلات تلقائية لجميع الفصول المباشرة',
                                            'مقررات دراسية منظمة في وحدات ودروس',
                                            'اختبارات إلكترونية متعددة الأنواع',
                                            'واجبات ومهام مع التصحيح والتقييم',
                                            'جدول دراسي أسبوعي ويومي',
                                            'نظام حضور ذكي يتتبع حالة كل طالب',
                                            'لوحة مراقبة خاصة بأولياء الأمور',
                                            'متجر إلكتروني لشراء المقررات والباقات',
                                            'تقارير أداء وتحليلات تفصيلية',
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 text-sm">
                                                <span className="w-1.5 h-1.5 rounded-full bg-shibl-crimson mt-1.5 shrink-0"></span>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">4.2 التنظيم التعليمي</h3>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-2 text-sm">
                                        <p><strong className="text-charcoal">الصفوف الدراسية:</strong> تمثل المرحلة الدراسية للطالب.</p>
                                        <p><strong className="text-charcoal">الفصول الدراسية (السمسترات):</strong> فترات زمنية محددة داخل كل صف دراسي.</p>
                                        <p><strong className="text-charcoal">المقررات:</strong> المواد الدراسية المتاحة ضمن كل صف وفصل دراسي.</p>
                                        <p><strong className="text-charcoal">الوحدات والدروس:</strong> محتوى تعليمي تفصيلي يشمل نصوصاً ومرفقات وفيديوهات.</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">4.3 الفصول المباشرة</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>تُعقد في مواعيد محددة وفقاً للجدول الدراسي.</li>
                                        <li>يمكن للطالب الانضمام عبر زر "انضمام" في الجدول.</li>
                                        <li>تُسجل تلقائياً وتُتاح للمشاهدة لاحقاً.</li>
                                        <li>الحصص التي لم يحضرها الطالب تُسجل بحالة "فائت".</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-3">4.4 الاختبارات والتقييمات</h3>
                                    <ul className="list-disc list-inside space-y-1 mr-2 text-sm sm:text-base marker:text-slate-400">
                                        <li>الاختبارات تتضمن: أسئلة اختيار متعدد، صح وخطأ، ومقالي.</li>
                                        <li>يُصحح المعلم الأسئلة المقالية يدوياً ويقدم ملاحظات.</li>
                                        <li>يُمنع منعاً باتاً الغش أو محاولة الغش في الاختبارات.</li>
                                        <li>تُعرض النتائج في صفحة النتائج الخاصة بالطالب.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 5. الرسوم والدفع */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-6 border-b pb-2 border-slate-100">5. الرسوم والدفع</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.1 رسوم الخدمات</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>بعض المقررات والخدمات مدفوعة.</li>
                                        <li>تُعلن الرسوم بوضوح في المتجر قبل الشراء.</li>
                                        <li>قد تتغير الرسوم مع إشعار مسبق.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.2 الباقات التعليمية</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>باقات تجمع عدة مقررات بسعر مخفض.</li>
                                        <li>قد تتضمن خصومات تشجيعية لفترات محدودة.</li>
                                        <li>يتم الشراء عبر المتجر بواسطة ولي الأمر.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.3 طرق الدفع</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>الدفع عبر الطرق المعتمدة في المنصة.</li>
                                        <li>عملية الدفع نهائية بعد التأكيد.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">5.4 سياسة الاسترداد</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>استرداد خلال 7 أيام إذا لم يبدأ المقرر.</li>
                                        <li>خصم إداري 10% من المبلغ المسترد.</li>
                                        <li>تتم عملية الاسترداد خلال 14 يوم عمل.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 6. حقوق الملكية الفكرية */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">6. حقوق الملكية الفكرية</h2>
                            <p className="mb-4">جميع المحتويات المتاحة على المنصة محمية بموجب قوانين الملكية الفكرية وتشمل:</p>
                            <div className="flex flex-wrap gap-2 text-sm mb-6">
                                {['النصوص والمواد المكتوبة', 'الفيديوهات والتسجيلات', 'الاختبارات والتقييمات', 'التصميمات والشعارات', 'البرمجيات والأكواد'].map((item, i) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-slate-700">{item}</span>
                                ))}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-sm">
                                    <strong className="block text-green-800 mb-2">يُسمح للمستخدم بـ:</strong>
                                    <ul className="space-y-1 text-green-700">
                                        <li>• الوصول للمحتوى لأغراض التعلم الشخصي فقط.</li>
                                        <li>• مشاهدة تسجيلات الحصص للمراجعة الشخصية.</li>
                                        <li>• تحميل المواد المسموح بتحميلها للاستخدام الشخصي.</li>
                                    </ul>
                                </div>
                                <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm">
                                    <strong className="block text-red-800 mb-2">يُمنع على المستخدم:</strong>
                                    <ul className="space-y-1 text-red-700">
                                        <li>• نسخ أو تسجيل الفصول المباشرة أو تسجيلاتها.</li>
                                        <li>• استخدام برامج تصوير الشاشة (Screen Recording) أو محاولة تجاوز العلامة المائية الأمنية.</li>
                                        <li>• توزيع أو نشر المحتوى دون إذن مسبق.</li>
                                        <li>• مشاركة المحتوى مع غير المسجلين.</li>
                                        <li>• استخدام المحتوى في منصات أخرى.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 7. سلوك المستخدم */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">7. سلوك المستخدم وواجباته</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">السلوك المقبول</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>الاحترام في التعامل أثناء الفصول المباشرة.</li>
                                        <li>المشاركة الإيجابية والبناءة.</li>
                                        <li>الالتزام بالأخلاقيات الأكاديمية.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal mb-2">السلوك المرفوض</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>لغة مسيئة أو تنمر على المستخدمين.</li>
                                        <li>تعطيل سير الدروس والفصول.</li>
                                        <li>محاولة اختراق المنصة أو انتحال شخصية.</li>
                                        <li>استخدام أدوات آلية للوصول للمنصة.</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mt-4 bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800">
                                <strong>العواقب:</strong> في حال المخالفة قد يتم: تنبيه كتابي، تعليق مؤقت أو إلغاء نهائي للحساب، حرمان من الخدمات، أو اتخاذ إجراءات قانونية.
                            </div>
                        </section>

                        {/* 8. الخصوصية */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">8. الخصوصية وحماية البيانات</h2>
                            <div className="space-y-3">
                                <p>
                                    تُحكم جمع واستخدام وحماية البيانات الشخصية{' '}
                                    <Link to="/privacy-policy" className="text-shibl-crimson font-bold hover:underline">سياسة الخصوصية المستقلة</Link>{' '}
                                    التي تُعتبر جزءاً لا يتجزأ من هذه الشروط.
                                </p>
                                <p className="text-sm">
                                    بموافقته على هذه الشروط، يوافق المستخدم على: جمع ومعالجة بياناته الشخصية، تتبع حضوره وتقدمه الأكاديمي، ومشاركة بياناته التعليمية مع أولياء الأمور المربوطين بحسابه ومع المعلم المسؤول.
                                </p>
                            </div>
                        </section>

                        {/* 9. التسجيلات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">9. التسجيلات المرئية للفصول</h2>
                            <ul className="space-y-2">
                                <li className="bg-slate-50 p-4 rounded-xl text-sm">
                                    <strong className="block text-charcoal mb-1">تسجيل الفصول:</strong>
                                    تُسجل الفصول المباشرة تلقائياً وتُتاح للطلاب المسجلين في المقرر لإعادة المشاهدة والمراجعة.
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl text-sm">
                                    <strong className="block text-charcoal mb-1">استخدام التسجيلات:</strong>
                                    التسجيلات متاحة للمشاهدة الشخصية فقط. يُمنع تحميل أو مشاركة أو إعادة نشر التسجيلات.
                                </li>
                                <li className="bg-slate-50 p-4 rounded-xl text-sm">
                                    <strong className="block text-charcoal mb-1">الحماية الأمنية:</strong>
                                    جميع التسجيلات محمية بعلامة مائية رقمية ديناميكية تحمل بيانات المستخدم. أي محاولة لتصوير الشاشة أو تسريب المحتوى ستؤدي إلى الحظر النهائي للحساب والملاحقة القانونية.
                                </li>
                            </ul>
                        </section>

                        {/* 10. الضمانات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">10. الضمانات والإخلاء من المسؤولية</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <h3 className="font-bold text-charcoal mb-2">نضمن للمستخدم:</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>خدمات تعليمية بجودة عالية.</li>
                                        <li>معالجة الشكاوى في أسرع وقت.</li>
                                        <li>حماية البيانات الشخصية.</li>
                                        <li>الوصول للمنصة قدر الإمكان.</li>
                                    </ul>
                                </div>
                                <div className="border border-slate-100 rounded-xl p-4">
                                    <h3 className="font-bold text-charcoal mb-2">لا نضمن:</h3>
                                    <ul className="list-disc list-inside text-sm space-y-1 marker:text-slate-400">
                                        <li>نتائج تعليمية محددة.</li>
                                        <li>عدم انقطاع الفصول المباشرة.</li>
                                        <li>التوافق مع جميع الأجهزة.</li>
                                        <li>جودة الاتصال (تعتمد على المستخدم).</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 11. إنهاء الاشتراك */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">11. إنهاء الاشتراك</h2>
                            <div className="space-y-3 text-sm">
                                <p><strong className="text-charcoal">من قِبل المستخدم:</strong> يمكن طلب حذف أو تعطيل الحساب عبر التواصل مع الدعم، مع الالتزام بأي التزامات مالية مستحقة.</p>
                                <p><strong className="text-charcoal">من قِبل المنصة:</strong> يمكننا إنهاء الاشتراك في حالات الانتهاك الجسيم أو السلوك الضار أو عدم الدفع أو تقديم معلومات كاذبة.</p>
                                <p><strong className="text-charcoal">آثار الإنهاء:</strong> فقدان الوصول للمقررات والفصول والتسجيلات، ولا يُسترد المبلغ المدفوع.</p>
                            </div>
                        </section>

                        {/* 12. فض المنازعات */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">12. فض المنازعات</h2>
                            <div className="space-y-3 text-sm">
                                <p>في حال وجود أي نزاع، يجب التواصل معنا أولاً عبر القنوات الرسمية ومنحنا مهلة 30 يوماً للرد والمعالجة.</p>
                                <p>تُخضع هذه الشروط وتُفسر وفقاً لقوانين سلطنة عُمان. أي نزاع ناشئ يُحال للمحاكم المختصة في عُمان.</p>
                                <p>نُفضل حل النزاعات ودياً من خلال الوساطة قبل اللجوء للقضاء.</p>
                            </div>
                        </section>

                        {/* 13. أحكام ختامية */}
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4 border-b pb-2 border-slate-100">13. أحكام ختامية</h2>
                            <div className="space-y-3 text-sm">
                                <p>إذا اعتبر أي حكم من أحكام هذه الشروط غير صالح، يبقى باقي الأحكام سارية المفعول.</p>
                                <p>عدم ممارستنا لأي حق من حقوقنا لا يُعتبر تخلياً عن هذا الحق.</p>
                                <p>لا يحق للمستخدم تفويض حقوقه أو التزاماته دون موافقة كتابية مسبقة.</p>
                                <p>تُشكل هذه الشروط و<Link to="/privacy-policy" className="text-shibl-crimson hover:underline">سياسة الخصوصية</Link> الاتفاقية الكاملة بين المستخدم والمنصة.</p>
                            </div>
                        </section>

                        {/* 14. التواصل */}
                        <section id="contact" className="bg-shibl-light-crimson/5 border border-shibl-crimson/10 rounded-2xl p-6 sm:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-shibl-crimson mb-6 text-center">14. التواصل والدعم</h2>
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
                                            <img src="/images/social/whatsapp.svg" alt="Whatsapp" className="w-6 h-6" onError={(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg')} />
                                            <span className="font-medium text-slate-700 group-hover:text-green-600">قناة واتساب الرسمية</span>
                                        </a>
                                        <a href="https://shorturl.at/BT1Yq" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:shadow-md transition-shadow group">
                                            <img src="/images/social/instagram.svg" alt="Instagram" className="w-6 h-6" onError={(e) => ((e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg')} />
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
