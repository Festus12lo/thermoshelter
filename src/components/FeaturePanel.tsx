import React from 'react';

interface FeaturePanelProps {
  onGetStarted?: () => void;
}

export function FeaturePanel({ onGetStarted }: FeaturePanelProps) {
  return (
    <div className="flex flex-col w-full text-on-surface">
      <section className="relative w-full min-h-[800px] flex flex-col justify-center items-center pb-24 overflow-hidden">
        
        <div className="relative z-20 px-5 md:px-16 w-full max-w-[1200px] flex flex-col items-center text-center mt-32">
          {/* Empty container */}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-20 border-t border-outline-variant/10">
        <div className="px-5 md:px-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-outline-variant/10 pb-12">
            <div className="max-w-md">
              <img 
                alt="ThermoShelter Logo" 
                className="h-8 w-auto object-contain mb-6 opacity-80 grayscale" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYDdOlGig6tIhskIXPfqiIWXub6MUqZCHQgRH7AlbyrOFupXI-62QrAYj3moFZLwnTYY89jLyJs0o0SgcbfTPDeLqnW7p-rapJsoH47s9VEkt3ma7NmaFsU7tPtOuHumWbV0rxEjqMvGWZowJgkjAeKhh4Lfwmssd34QO39-o6CfbRErt-d-Jlac84ZGwigj9Rw6PfPF8uM5jxLQWw-s3YO2xt9_TgH0TutfYZeIM6zPd0p4WpErgL-g" 
              />
              <p className="text-on-surface-variant font-body-md text-body-md leading-relaxed">
                Pioneering at the intersection of high-fidelity architectural practice and rigorous climate science. Structural integrity validated through material intelligence.
              </p>
            </div>
            <nav className="grid grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-4">
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">How It Works</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Technology</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Materials</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Evidence</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">GitHub</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Documentation</a>
              <a className="text-label-sm font-label-sm text-on-surface-variant hover:text-primary transition-colors" href="#">About</a>
            </nav>
          </div>
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="font-label-technical text-label-technical text-on-tertiary-container uppercase tracking-widest">
              © 2024 THERMOSHELTER ARCHITECTURAL SYSTEMS
            </span>
            <div className="flex gap-8">
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">share</span>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">monitoring</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
