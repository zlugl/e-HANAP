import React from 'react';
import { FileText, MapPin, Mail, Phone, Shield, ExternalLink, Heart } from 'lucide-react';
import { ROXAS_BARANGAYS } from '../data/mockData';

export const Footer: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 font-sans">
      {/* Top Footer Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pb-24 lg:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Mandate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white font-sans tracking-tight">
                e<span className="text-indigo-400">HANAP</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              eHANAP is the local job and skills matching marketplace designed specifically for the Public Employment Service Office (PESO) of <strong>Roxas, Oriental Mindoro</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Compliant with Data Privacy Act (RA 10173)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              System Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate?.('jobs')} className="hover:text-indigo-400 transition-colors">
                  Find Jobs in Roxas
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('landing')} className="hover:text-indigo-400 transition-colors">
                  AI Qualification Matcher
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('seeker-dashboard')} className="hover:text-indigo-400 transition-colors">
                  Job Seeker Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('employer-dashboard')} className="hover:text-indigo-400 transition-colors">
                  Employer Recruitment
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('admin-dashboard')} className="hover:text-indigo-400 transition-colors">
                  PESO Roxas Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Roxas Barangays Coverage */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Roxas Coverage Area
            </h4>
            <p className="text-[11px] text-slate-500 mb-2">Covering all 20 Barangays in Roxas:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-400">
              {ROXAS_BARANGAYS.slice(0, 10).map(b => (
                <span key={b}>• Brgy. {b}</span>
              ))}
              <span className="text-indigo-400 font-semibold">• +10 more barangays</span>
            </div>
          </div>

          {/* PESO Roxas Office Contact Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              PESO Roxas Office
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Municipal Hall Compound, Roxas, Oriental Mindoro 5212</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>peso.roxas@ormindoro.gov.ph</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>(043) 289-ROXAS • 0917-PESO-RXS</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>© 2026 eHANAP • Local Employment System for PESO Roxas, Oriental Mindoro. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-indigo-400 font-medium">📍 Roxas, Oriental Mindoro</span>
            <span>•</span>
            <span>DOLE-PESO Accredited</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
