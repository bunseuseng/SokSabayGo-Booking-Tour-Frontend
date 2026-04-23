import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-4 text-lg">Effective Date: April 2026</p>
      
      <section className="space-y-4">
        <p>
          At <strong>Soksabay Go</strong>, we value your privacy. This policy explains how we handle your information.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
        <p>
          When you log in via Google, we collect your name and email address to create your account and manage your bookings.
        </p>
        
        <h2 className="text-xl font-semibold mt-6">How We Use Data</h2>
        <p>
          Your data is used strictly for authentication and to provide tour booking services. We do not sell or share your personal data with third-party advertisers.
        </p>

        <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
        <p>If you have questions about your data, please contact us through the Soksabay Go support portal.</p>
      </section>
    </div>
  );
};

export default PrivacyPage;