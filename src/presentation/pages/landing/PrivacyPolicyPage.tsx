import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../shared/constants';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '../../components/common/Footer';

export const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-soft-cloud" dir="rtl">
            {/* Simple Header */}
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
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal mb-8 text-center">سياسة الخصوصية</h1>
                    
                    <div className="space-y-8 text-slate-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">مقدمة</h2>
                            <p>
                                نرحب بكم في منصة سُبُل التعليمية. نحن نولي اهتماماً كبيراً لخصوصية بياناتكم ونلتزم بحماية المعلومات الشخصية التي تشاركونها معنا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية بياناتكم عند استخدامكم للمنصة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">البيانات التي نقوم بجمعها</h2>
                            <ul className="list-disc list-inside space-y-2 mr-4">
                                <li><strong>المعلومات الشخصية:</strong> مثل الاسم، البريد الإلكتروني، رقم الهاتف، والمرحلة الدراسية عند إنشاء الحساب.</li>
                                <li><strong>بيانات الاستخدام:</strong> معلومات حول تفاعلكم مع الدروس، الاختبارات، والواجبات لتحسين تجربتكم التعليمية.</li>
                                <li><strong>بيانات الجهاز:</strong> مثل نوع الجهاز ونظام التشغيل لضمان توافق المنصة وأدائها.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">كيف نستخدم بياناتكم</h2>
                            <p>نستخدم البيانات التي نجمعها للأغراض التالية:</p>
                            <ul className="list-disc list-inside space-y-2 mr-4 mt-2">
                                <li>توفير الخدمات التعليمية وإدارة حسابكم.</li>
                                <li>تحسين وتطوير محتوى المنصة وواجهة المستخدم.</li>
                                <li>التواصل معكم بخصوص التحديثات، الإشعارات المهمة، والرد على استفساراتكم.</li>
                                <li>إصدار الشهادات والتقارير الأكاديمية.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">حماية البيانات</h2>
                            <p>
                                نحن نتخذ كافة التدابير الأمنية والتقنية اللازمة لحماية بياناتكم من الوصول غير المصرح به، أو التغيير، أو الإفصاح، أو الإتلاف. يتم تخزين البيانات في خوادم آمنة ومشفرة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">مشاركة البيانات</h2>
                            <p>
                                نحن لا نقوم ببيع أو تأجير بياناتكم الشخصية لأي طرف ثالث. قد نشارك بعض البيانات مع مقدمي الخدمات التقنية الذين يساعدوننا في تشغيل المنصة، وذلك بموجب اتفاقيات سرية صارمة.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl sm:text-2xl font-bold text-charcoal mb-4">اتصل بنا</h2>
                            <p>
                                إذا كان لديكم أي أسئلة أو استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني:
                                <br />
                                <a href="mailto:support@subol.edu.om" className="text-shibl-crimson font-bold hover:underline dir-ltr inline-block mt-2">support@subol.edu.om</a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
