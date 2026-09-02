import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight } from 'lucide-react';
import { AVAILABLE_SKILLS } from '../utils/skills';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter skills based on query
  const filteredSkills = AVAILABLE_SKILLS.filter(skill => 
    skill.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Keyboard listener for Command+K or '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      // Only trigger on '/' if we aren't typing in an input
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow render
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
    }
  }, [isOpen]);

  // Handle navigation inside the palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredSkills.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSkills[selectedIndex]) {
        executeSkill(filteredSkills[selectedIndex]);
      }
    }
  };

  const executeSkill = (skill: string) => {
    console.log(`Executing skill: ${skill}`);
    setIsOpen(false);
    // In a real implementation, this would trigger an agentic workflow or dispatch a global event
    alert(`Skill activated: ${skill}\n\n(AI Execution Engine not connected in UI)`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[60vh]"
          >
            {/* Header & Search */}
            <div className="flex items-center px-4 border-b border-slate-700/50">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent border-none py-5 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                placeholder="Search 100+ installed skills..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
              <div className="flex items-center gap-1 text-slate-500 text-xs font-bold border border-slate-700 rounded px-2 py-1 bg-slate-800">
                <Command className="w-3 h-3" />
                <span>K</span>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredSkills.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <p>No skills found for "{query}"</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filteredSkills.map((skill, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <li key={skill}>
                        <button
                          onClick={() => executeSkill(skill)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                            isSelected 
                              ? 'bg-amber-500/10 text-amber-500' 
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">/{skill}</span>
                          </div>
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-amber-500" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-950/50 px-4 py-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]">↑</kbd> <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]">↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px]">↵</kbd> Execute</span>
              </div>
              <div>
                <span>{filteredSkills.length} skills available</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
