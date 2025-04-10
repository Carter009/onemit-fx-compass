
import React from 'react';
import DashboardContainer from '@/components/dashboard/DashboardContainer';

const Index = () => {
  return (
    <div className="flex-1 overflow-auto py-4">
      <DashboardContainer />
      
      <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Oneremit FX Terminal - Powered by <a href="#" className="text-primary hover:underline">Oneremit</a></p>
      </footer>
    </div>
  );
};

export default Index;
