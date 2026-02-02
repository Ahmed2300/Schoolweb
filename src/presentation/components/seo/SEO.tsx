import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    ogImage?: string;
    type?: 'website' | 'article';
}

export function SEO({
    title,
    description,
    canonical = 'https://www.soubul.net/',
    ogImage = '/images/subol-hero.png',
    type = 'website'
}: SEOProps) {
    const siteTitle = 'سُبُل - علم يوصل للمستقبل';
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

    // Schema.org Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Subol (سُبُل)",
        "url": "https://www.soubul.net/",
        "logo": "https://www.soubul.net/images/subol-red.png",
        "description": "منصة تعليمية متكاملة تجمع بين الفصول التفاعلية والمتابعة الدقيقة لضمان أفضل تجربة تعليمية.",
        "sameAs": [
            "https://www.instagram.com/soubul.om",
            // Add other social links here
        ]
    };

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonical} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
        </Helmet>
    );
}
