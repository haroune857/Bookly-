import React, { useState } from 'react';
import {
  Award,
  Zap,
  Video,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Play,
  Clock,
  GraduationCap
} from 'lucide-react';
import { TrainingCourse } from '../types';
import { RecommendedWorkshops } from './RecommendedWorkshops';

interface FormationsViewProps {
  courses: TrainingCourse[];
  onOpenCourse: (course: TrainingCourse) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const FormationsView: React.FC<FormationsViewProps> = ({
  courses,
  onOpenCourse
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'Toutes les formations' },
    { id: 'Édition & Créativité', label: 'Édition & Créativité' },
    { id: 'Marketing', label: 'Marketing & Lancement' },
    { id: 'Revenus Passifs', label: 'Publication & Diffusion' }
  ];

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory === 'all') return true;
    return c.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div id="view-formations" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/60 text-[11px] font-bold uppercase px-3 py-1 rounded-full tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              Catalogue Officiel &bull; Ouvert à Tous les Membres
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Formations &amp; Masterclasses Professionnelles
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Les formations Bookly Academy sont des programmes certifiants payants accessibles à tous les auteurs, quel que soit votre niveau d'abonnement.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-800 text-xs shrink-0">
            <div className="p-2 rounded-xl bg-indigo-600 text-white font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white">{courses.length} Programmes Disponibles</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">Formations payantes à la carte</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Workshops Section (Partenaires Certifiés) */}
      <RecommendedWorkshops />

      {/* Academy Courses Header & Categories */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Catalogue Bookly Academy
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Modules certifiants
          </span>
        </div>

        {/* Categories Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
            }`}
          >
            {cat.label}
          </button>
        ))}
        </div>
      </div>

      {/* Training Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const isFeatured = course.isFeatured;

          return (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 flex flex-col justify-between gap-4 border transition-all duration-200 hover:shadow-md ${
                isFeatured
                  ? 'border-indigo-500/50 dark:border-indigo-500/40 shadow-xs'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3.5">
                {/* Course Visual Preview */}
                <div
                  onClick={() => onOpenCourse(course)}
                  className="h-36 rounded-xl relative overflow-hidden flex flex-col justify-between p-4 cursor-pointer bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white transition-opacity hover:opacity-95"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white">
                      {course.badge}
                    </span>
                    <span className="text-[11px] font-extrabold bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md text-slate-950 shadow-xs">
                      {course.price ? `${course.price} €` : 'Payant'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-white/80 font-medium">{course.instructor}</span>
                      <div className="text-xs font-bold text-white line-clamp-1">{course.category} &bull; {course.duration}</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                      <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <h3
                    onClick={() => onOpenCourse(course)}
                    className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span>{course.completedModules}/{course.totalModules} modules validés</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                  <Video className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{course.totalModules} chapitres vidéo</span>
                </span>

                <button
                  onClick={() => onOpenCourse(course)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 font-semibold text-xs transition-colors"
                >
                  Continuer &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Global CTA Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2 max-w-xl text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Accompagnement Éditorial & Relecture
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Besoin d'un retour sur la structure de votre ouvrage ?
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Utilisez le Brainstorming IA et les outils d'exportation Google Docs pour partager vos épreuves avec vos co-auteurs et bêta-lecteurs.
          </p>
        </div>

        <button
          onClick={() => onOpenCourse(courses[0])}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all shrink-0"
        >
          Reprendre ma formation en cours
        </button>
      </div>
    </div>
  );
};

