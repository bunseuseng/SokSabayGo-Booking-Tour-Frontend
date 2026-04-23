import React from 'react';

const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-4">Last Updated: April 2026</p>
      
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p>By using Soksabay Go, you agree to follow our rules for booking and interacting with drivers.</p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold">2. Booking & Cancellations</h2>
          <p>Users are responsible for showing up to their booked tours. Drivers have the right to cancel if a user is more than 30 minutes late.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. User Conduct</h2>
          <p>Users must treat drivers with respect. Any report of harassment will result in immediate account suspension.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Limitation of Liability</h2>
          <p>Soksabay Go is a platform connecting users to independent drivers. We are not liable for incidents occurring during the physical tour.</p>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;