import React, { useState } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  User,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TrainingCourse } from '../types';

interface CoursePlayerModalProps {
  course: TrainingCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleModuleComplete: (courseId: string, moduleIndex: number) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CoursePlayerModal: React.FC<CoursePlayerModalProps> = ({
  course,
  isOpen,
  onClose,
  onToggleModuleComplete,
  onShowToast
}) => {
  if (!isOpen || !course) return null;

  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const activeModule = course.modulesList[activeModuleIdx] || course.modulesList[0];

  const handleCompleteLesson = () => {
    onToggleModuleComplete(course.id, activeModuleIdx);
    onShowToast('Module validé', `"${activeModule.title}" a été marqué comme terminé.`, 'success');

    if (course.completedModules + 1 >= course.totalModules) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onShowToast('Programme terminé !', 'Vous avez complété tous les modules de cette formation.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[88vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {course.badge} &bull; {course.category}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                {course.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Video / Lesson View */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col justify-between space-y-6">
            {/* Simulated Video Player */}
            <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-white relative shadow-lg overflow-hidden group">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform cursor-pointer">
                <Play className="w-6 h-6 ml-0.5 fill-current" />
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="font-bold text-sm sm:text-base drop-shadow-sm text-white">
                  {activeModule.title}
                </h4>
                <p className="text-xs text-slate-400">
                  Durée : {activeModule.duration} &bull; Formateur : {course.instructor}
                </p>
              </div>

              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
                <span>Lecture HD 1080p</span>
                <span>Bookly Academy Studio</span>
              </div>
            </div>

            {/* Lesson Summary & Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Module #{activeModuleIdx + 1} : {activeModule.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Consultez les notions clés et validez votre progression.
                  </p>
                </div>

                <button
                  onClick={handleCompleteLesson}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeModule.completed
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeModule.completed ? 'Validé ✓' : 'Marquer comme validé'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  Synthèse pédagogique :
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-400 text-xs">
                  <li>Comprendre l'articulation logique entre les chapitres d'un livre.</li>
                  <li>Formuler des accroches dynamiques pour retenir l'attention du lecteur.</li>
                  <li>Utiliser les outils de synthèse IA pour accélérer la structuration du plan.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Module List Sidebar */}
          <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Modules ({course.completedModules}/{course.totalModules})
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {course.progress}%
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {course.modulesList.map((mod, idx) => {
                const isSelected = idx === activeModuleIdx;

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveModuleIdx(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80'
                        : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleModuleComplete(course.id, idx);
                      }}
                      className={`mt-0.5 p-0.5 rounded-md transition-colors ${
                        mod.completed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Module {idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{mod.duration}</span>
                      </div>
                      <h5
                        className={`text-xs font-semibold mt-0.5 line-clamp-2 leading-snug ${
                          isSelected
                            ? 'text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {mod.title}
                      </h5>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Certification Bookly incluse</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
