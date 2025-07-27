import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'FitnessApp - Your Personal Fitness Journey',
  description = 'Transform your fitness journey with personalized workout plans, progress tracking, and expert guidance. Start your path to a healthier you today.',
  keywords = ['fitness', 'workout', 'health', 'exercise', 'personal trainer', 'fitness app', 'weight loss', 'muscle building'],
  image = '/images/og-image.jpg',
  url = 'https://fitness-app-bupe-staging.web.app',
  type = 'website',
  author = 'FitnessApp Team',
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonical,
}) => {
  const fullTitle = title.includes('FitnessApp') ? title : `${title} | FitnessApp`;
  const fullUrl = url.startsWith('http') ? url : `https://fitness-app-bupe-staging.web.app${url}`;
  const fullImage = image.startsWith('http') ? image : `https://fitness-app-bupe-staging.web.app${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      
      {/* Robots Meta */}
      <meta 
        name="robots" 
        content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`} 
      />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="FitnessApp" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@FitnessApp" />
      <meta name="twitter:creator" content="@FitnessApp" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="FitnessApp" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://firebase.googleapis.com" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "FitnessApp",
          "description": description,
          "url": fullUrl,
          "applicationCategory": "HealthApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "FitnessApp Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "FitnessApp",
            "logo": {
              "@type": "ImageObject",
              "url": `${fullUrl}/logo.png`
            }
          }
        })}
      </script>
    </Helmet>
  );
};

// SEO utility functions
export const generateSEOProps = (page: string, data?: any) => {
  const seoConfigs = {
    home: {
      title: 'FitnessApp - Your Personal Fitness Journey',
      description: 'Transform your fitness journey with personalized workout plans, progress tracking, and expert guidance. Start your path to a healthier you today.',
      keywords: ['fitness app', 'workout plans', 'personal trainer', 'health tracking', 'exercise'],
    },
    dashboard: {
      title: 'Dashboard - Track Your Fitness Progress',
      description: 'Monitor your fitness journey with detailed progress tracking, workout analytics, and personalized insights.',
      keywords: ['fitness dashboard', 'progress tracking', 'workout analytics', 'fitness metrics'],
    },
    onboarding: {
      title: 'Get Started - Personalized Fitness Plan',
      description: 'Create your personalized fitness plan in minutes. Answer a few questions to get workouts tailored to your goals.',
      keywords: ['fitness onboarding', 'personalized workout', 'fitness assessment', 'custom fitness plan'],
    },
    workout: {
      title: 'Workout Session - FitnessApp',
      description: 'Follow guided workout sessions with real-time tracking, exercise instructions, and progress monitoring.',
      keywords: ['workout session', 'guided exercise', 'fitness training', 'exercise tracking'],
    },
    profile: {
      title: 'Profile Settings - Manage Your Fitness Journey',
      description: 'Customize your fitness experience, update goals, and manage your account settings.',
      keywords: ['fitness profile', 'account settings', 'fitness goals', 'user preferences'],
    },
  };

  return seoConfigs[page as keyof typeof seoConfigs] || seoConfigs.home;
};

// Performance monitoring for SEO
export const trackPageView = (page: string, userId?: string) => {
  // Google Analytics 4 tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: document.title,
      page_location: window.location.href,
      user_id: userId,
    });
  }

  // Core Web Vitals tracking
  if ('web-vital' in window) {
    // Track LCP, FID, CLS
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

export default SEOHead;
