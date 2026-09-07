import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Cpu,
  DollarSign,
  Sliders,
  Search,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Lock,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Ban,
  Activity,
  CreditCard,
  Download,
  Calendar,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  AdminUser,
  AdminApiDailyStat,
  AdminErrorLog,
  AdminGlobalConfig,
  AdminSubscriptionRevenueStat
} from '../types';
import { INITIAL_SUBSCRIPTION_REVENUE_STATS } from '../data/adminData';

interface AdminDashboardViewProps {
  users: AdminUser[];
  onUpdateUsers: (users: AdminUser[]) => void;
  apiStats: AdminApiDailyStat[];
  subscriptionRevenueStats?: AdminSubscriptionRevenueStat[];
  errorLogs: AdminErrorLog[];
  onUpdateErrorLogs: (logs: AdminErrorLog[]) => void;
  globalConfig: AdminGlobalConfig;
  onUpdateGlobalConfig: (config: AdminGlobalConfig) => void;
  onLockAdmin: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  onUpdateUsers,
  apiStats,
  subscriptionRevenueStats = INITIAL_SUBSCRIPTION_REVENUE_STATS,
  errorLogs,
  onUpdateErrorLogs,
  globalConfig,
  onUpdateGlobalConfig,
  onLockAdmin,
  onShowToast
}) => {
  // Navigation tabs: 'kpis' | 'finances' | 'users' | 'api' | 'settings_logs'
  const [activeTab, setActiveTab] = useState<'kpis' | 'finances' | 'users' | 'api' | 'settings_logs'>('kpis');

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | 'free' | 'pro' | 'premium' | 'blocked'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Compute real KPIs (zero-based factory metrics)
  const kpiData = useMemo(() => {
    const totalUsers = users.length;
    const freeCount = users.filter((u) => u.plan === 'free').length;
    const proCount = users.filter((u) => u.plan === 'pro').length;
    const premiumCount = users.filter((u) => u.plan === 'premium').length;
    const paidCount = proCount + premiumCount;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;

    const totalWords = users.reduce((acc, u) => acc + (u.totalWordsGenerated || 0), 0);
    const totalProjects = users.reduce((acc, u) => acc + (u.lifetimeProjects || 0), 0);

    // AI Token metrics (strictly token count, no monetary cost)
    const totalTokensMonth = apiStats.reduce((acc, stat) => acc + (stat.totalTokens || 0), 0);
    const groqTokensMonth = apiStats.reduce((acc, stat) => acc + (stat.groqTokens || 0), 0);
    const geminiTokensMonth = apiStats.reduce((acc, stat) => acc + (stat.geminiTokens || 0), 0);
    const inputTokensMonth = apiStats.reduce((acc, stat) => acc + (stat.inputTokens || 0), 0);
    const outputTokensMonth = apiStats.reduce((acc, stat) => acc + (stat.outputTokens || 0), 0);
    const totalRequestsMonth = apiStats.reduce((acc, stat) => acc + (stat.requestsCount || 0), 0);

    // Saspay SaaS subscription metrics (in FCFA)
    const totalSaspayRevenue = subscriptionRevenueStats.reduce((acc, s) => acc + (s.totalSubscriptionRevenue || 0), 0);
    const proSaspayRevenue = subscriptionRevenueStats.reduce((acc, s) => acc + (s.proRevenue || 0), 0);
    const premiumSaspayRevenue = subscriptionRevenueStats.reduce((acc, s) => acc + (s.premiumRevenue || 0), 0);
    const totalNewSubs = subscriptionRevenueStats.reduce((acc, s) => acc + (s.newSubscriptionsCount || 0), 0);
    const totalRenewals = subscriptionRevenueStats.reduce((acc, s) => acc + (s.renewalsCount || 0), 0);
    const totalChurn = subscriptionRevenueStats.reduce((acc, s) => acc + (s.churnCount || 0), 0);

    // Monthly Recurring Revenue (MRR) based on active paid subscribers
    // Pro: 19 000 FCFA/mois, Premium: 32 000 FCFA/mois
    const calculatedMRR = (proCount * 19000) + (premiumCount * 32000) + totalSaspayRevenue;
    const calculatedARR = calculatedMRR * 12;

    return {
      totalUsers,
      freeCount,
      proCount,
      premiumCount,
      paidCount,
      blockedCount,
      totalWords,
      totalProjects,
      totalTokensMonth,
      groqTokensMonth,
      geminiTokensMonth,
      inputTokensMonth,
      outputTokensMonth,
      totalRequestsMonth,
      totalSaspayRevenue,
      proSaspayRevenue,
      premiumSaspayRevenue,
      totalNewSubs,
      totalRenewals,
      totalChurn,
      mrr: calculatedMRR,
      arr: calculatedARR
    };
  }, [users, apiStats, subscriptionRevenueStats]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.id.toLowerCase().includes(userSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (userPlanFilter === 'blocked') return u.status === 'blocked';
      if (userPlanFilter === 'free') return u.plan === 'free';
      if (userPlanFilter === 'pro') return u.plan === 'pro';
      if (userPlanFilter === 'premium') return u.plan === 'premium';
      return true;
    });
  }, [users, userSearch, userPlanFilter]);

  // Actions on users
  const handleChangeUserPlan = (userId: string, newPlan: 'free' | 'pro' | 'premium') => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          plan: newPlan,
          dailyPromptsLimit:
            newPlan === 'free'
              ? globalConfig.freeDailyPromptLimit
              : newPlan === 'pro'
              ? globalConfig.proDailyPromptLimit
              : globalConfig.premiumDailyPromptLimit
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    onShowToast('Plan mis à jour', `Le forfait de l'utilisateur est maintenant ${newPlan.toUpperCase()}.`, 'success');
  };

  const handleResetUserCounters = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          dailyPromptsUsed: 0,
          totalWordsGenerated: 0,
          lifetimeProjects: 0
        };
      }
      return u;
    });
    onUpdateUsers(updated);
    onShowToast('Compteurs Réinitialisés', 'Les compteurs de l\'utilisateur ont été remis à zéro.', 'info');
  };

  const handleToggleBlockUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus: 'active' | 'blocked' = target.status === 'blocked' ? 'active' : 'blocked';
    const updated = users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u));
    onUpdateUsers(updated);
    onShowToast(
      newStatus === 'blocked' ? 'Utilisateur Bloqué' : 'Utilisateur Débloqué',
      `L'accès a été mis à jour pour ${target.name}.`,
      newStatus === 'blocked' ? 'error' : 'success'
    );
  };

  // Export Saspay Financial Report
  const handleExportSaspayReport = () => {
    const headers = ['Date', 'Jour', 'Abonnements Pro (FCFA)', 'Abonnements Premium (FCFA)', 'Revenus Saspay Totaux (FCFA)', 'Nouveaux Abonnés'];
    const rows = subscriptionRevenueStats.map((s) => [
      s.date,
      s.dayLabel,
      s.proRevenue,
      s.premiumRevenue,
      s.totalSubscriptionRevenue,
      s.newSubscriptionsCount
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bookly_saspay_revenus_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Export Réussi', 'Le rapport des revenus SaaS Saspay a été téléchargé.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans transition-colors">
      
      {/* ============================================================= */}
      {/* HEADER PRINCIPAL AVEC STATUT DU SYSTÈME & ACTIONS GLOBALES */}
      {/* ============================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Console de Contrôle Master
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Moteurs IA en Ligne (Groq & Gemini)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Administration Bookly Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Supervision des abonnements SaaS Saspay, consommation des tokens IA, et gestion des auteurs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportSaspayReport}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors shadow-xs"
              title="Exporter le rapport des revenus Saspay"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Saspay (CSV)</span>
            </button>

            <button
              onClick={() => onShowToast('Données Synchronisées', 'Les métriques de tokens et revenus ont été actualisées.', 'info')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>

            <button
              onClick={onLockAdmin}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 border border-red-500/30 transition-colors shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SUMMARY BAR : 5 CARTES CLÉS */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          
          {/* Card 1: Revenus SaaS Saspay */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-indigo-500/30">
            <div className="text-[11px] text-indigo-300 font-semibold flex items-center justify-between">
              <span>Revenus SaaS Saspay</span>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white mt-1">
              {kpiData.totalSaspayRevenue.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">FCFA</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <TrendingUp className="w-3 h-3" /> MRR : {kpiData.mrr.toLocaleString('fr-FR')} FCFA
            </div>
          </div>

          {/* Card 2: Abonnés Payants (Pro & Premium) */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-emerald-500/30">
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-between">
              <span>Abonnés Payants</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
              {kpiData.paidCount} <span className="text-xs font-normal text-slate-400">actifs</span>
            </div>
            <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
              <span>{kpiData.proCount} Pro • {kpiData.premiumCount} Premium</span>
            </div>
          </div>

          {/* Card 3: Total Auteurs / Membres */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Auteurs & Membres</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white mt-1">
              {kpiData.totalUsers}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
              <span>{kpiData.freeCount} Forfait Gratuit</span>
            </div>
          </div>

          {/* Card 4: Volume Rédaction */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Volume Rédaction</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-white mt-1">
              {kpiData.totalWords.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">mots</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {kpiData.totalProjects} livres & manuscrits
            </div>
          </div>

          {/* Card 5: Utilisation des Tokens IA (Strictly Tokens) */}
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Tokens IA Consommés</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 mt-1">
              {kpiData.totalTokensMonth.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">tokens</span>
            </div>
            <div className="text-[10px] text-purple-400 mt-0.5 font-medium">
              {kpiData.totalRequestsMonth} requêtes IA totales
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================= */}
      {/* NAVIGATION TABS SELECTOR */}
      {/* ============================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('kpis')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kpis'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>1. Indicateurs Clés & Performance</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'finances'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Revenus SaaS Saspay</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Gestion des Utilisateurs ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>4. Utilisation des Tokens IA</span>
        </button>

        <button
          onClick={() => setActiveTab('settings_logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'settings_logs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>5. Journal Système & Paramètres Globaux</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: KPIS & APERÇU GÉNÉRAL */}
      {/* ============================================================= */}
      {activeTab === 'kpis' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Graphique 1: Revenus SaaS Saspay */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Revenus SaaS Saspay (Abonnements)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Souscriptions Pro (19 000 FCFA) & Premium (32 000 FCFA)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {kpiData.totalSaspayRevenue.toLocaleString('fr-FR')} FCFA
                  </div>
                  <span className="text-[10px] text-slate-400">Total période</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={subscriptionRevenueStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSaspay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any) => [`${Number(val).toLocaleString('fr-FR')} FCFA`, 'Saspay']}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalSubscriptionRevenue"
                      name="Revenus Saspay (FCFA)"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSaspay)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graphique 2: Utilisation des Tokens IA (Strictly Tokens) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Consommation des Tokens IA
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tokens d'inférence consommés (Groq & Gemini)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-black text-purple-600 dark:text-purple-400">
                    {kpiData.totalTokensMonth.toLocaleString('fr-FR')}
                  </div>
                  <span className="text-[10px] text-slate-400">Tokens totaux</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={apiStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="groqTokens" name="Tokens Groq" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="geminiTokens" name="Tokens Gemini" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* KPI Mini-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Forfaits Pro Actifs</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiData.proCount} auteur(s)
              </div>
              <span className="text-[11px] text-indigo-500 font-semibold mt-0.5 block">19 000 FCFA / mois</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Forfaits Premium Actifs</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiData.premiumCount} auteur(s)
              </div>
              <span className="text-[11px] text-purple-500 font-semibold mt-0.5 block">32 000 FCFA / mois</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Taux d'Abonnés Payants</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {kpiData.totalUsers > 0 ? ((kpiData.paidCount / kpiData.totalUsers) * 100).toFixed(1) : '0.0'}%
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">Ratio de conversion SaaS</span>
            </div>
          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: REVENUS SAAS SASPAY */}
      {/* ============================================================= */}
      {activeTab === 'finances' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  Passerelle Saspay Active
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Revenus des Abonnements SaaS (Saspay)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Suivi des souscriptions Pro (19 000 FCFA) et Premium (32 000 FCFA) encaissées via Saspay.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportSaspayReport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger Rapport CSV</span>
                </button>
              </div>
            </div>

            {/* Financial Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                  MRR Actuel (Revenus Récurrents Mensuels)
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {kpiData.mrr.toLocaleString('fr-FR')} FCFA
                </div>
                <span className="text-[11px] text-indigo-500 font-medium mt-0.5 block">
                  ARR projeté : {kpiData.arr.toLocaleString('fr-FR')} FCFA / an
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                  Souscriptions Encaissées Période
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {kpiData.totalSaspayRevenue.toLocaleString('fr-FR')} FCFA
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  Via Saspay Mobile Money & Cartes
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">
                  Abonnés Payants Actifs
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {kpiData.paidCount}
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                  {kpiData.proCount} Pro • {kpiData.premiumCount} Premium
                </span>
              </div>
            </div>

            {/* Table of Subscriptions */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                Historique Journalier des Souscriptions Saspay
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3 rounded-l-xl">Date</th>
                      <th className="p-3">Forfait Pro (FCFA)</th>
                      <th className="p-3">Forfait Premium (FCFA)</th>
                      <th className="p-3">Revenu Total (FCFA)</th>
                      <th className="p-3">Nouveaux Abonnés</th>
                      <th className="p-3 rounded-r-xl">Statut Passerelle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {subscriptionRevenueStats.map((stat, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{stat.date} ({stat.dayLabel})</span>
                        </td>
                        <td className="p-3 font-medium">{stat.proRevenue.toLocaleString('fr-FR')} FCFA</td>
                        <td className="p-3 font-medium">{stat.premiumRevenue.toLocaleString('fr-FR')} FCFA</td>
                        <td className="p-3 font-black text-indigo-600 dark:text-indigo-400">
                          {stat.totalSubscriptionRevenue.toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                            +{stat.newSubscriptionsCount}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Saspay Validé
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: GESTION DES UTILISATEURS */}
      {/* ============================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Répertoire des Auteurs & Comptes ({filteredUsers.length} affichés)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contrôle des accès, changement de forfait et réinitialisation des quotas.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <select
                  value={userPlanFilter}
                  onChange={(e: any) => setUserPlanFilter(e.target.value)}
                  className="py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 outline-none"
                >
                  <option value="all">Tous les forfaits</option>
                  <option value="free">Gratuit ({kpiData.freeCount})</option>
                  <option value="pro">Pro ({kpiData.proCount})</option>
                  <option value="premium">Premium ({kpiData.premiumCount})</option>
                  <option value="blocked">Bloqués ({kpiData.blockedCount})</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Utilisateur</th>
                    <th className="p-3">Forfait</th>
                    <th className="p-3">Prompts Utilisés</th>
                    <th className="p-3">Volume Mots</th>
                    <th className="p-3">Projets</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                        Aucun utilisateur ne correspond aux critères.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                              style={{ background: u.avatarBg || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                            >
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              u.plan === 'premium'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : u.plan === 'pro'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-900 dark:text-white">{u.dailyPromptsUsed}</span>
                          <span className="text-slate-400 text-[10px]"> / {u.dailyPromptsLimit}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {(u.totalWordsGenerated || 0).toLocaleString('fr-FR')}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {u.lifetimeProjects || 0}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'blocked'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {u.status === 'blocked' ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Plan toggle */}
                            <select
                              value={u.plan}
                              onChange={(e: any) => handleChangeUserPlan(u.id, e.target.value)}
                              className="text-[11px] p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              <option value="free">Gratuit</option>
                              <option value="pro">Pro</option>
                              <option value="premium">Premium</option>
                            </select>

                            {/* Reset counters */}
                            <button
                              type="button"
                              onClick={() => handleResetUserCounters(u.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                              title="Réinitialiser les compteurs à zéro"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Block/Unblock */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlockUser(u.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                u.status === 'blocked'
                                  ? 'text-emerald-600 hover:bg-emerald-50'
                                  : 'text-red-500 hover:bg-red-50'
                              }`}
                              title={u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: CONSOMMATION DES TOKENS IA (SANS AUCUN COÛT MONÉTAIRE) */}
      {/* ============================================================= */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                Métriques d'Inférence d'Intelligence Artificielle
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Consommation des Tokens IA (Gemini & Groq)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Surveillance exclusive du volume de tokens consommés, sans indicateur de coût financier.
              </p>
            </div>

            {/* Tokens Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Tokens Totaux</span>
                <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-1">
                  {kpiData.totalTokensMonth.toLocaleString('fr-FR')}
                </div>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Tous modèles confondus</span>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Tokens Groq</span>
                <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                  {kpiData.groqTokensMonth.toLocaleString('fr-FR')}
                </div>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">LPUs Haute Vitesse</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Tokens Gemini</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {kpiData.geminiTokensMonth.toLocaleString('fr-FR')}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Google DeepMind</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Requêtes IA</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {kpiData.totalRequestsMonth}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Appels API traités</span>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Tokens par Fournisseur */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Volume Quotidien de Tokens : Groq vs Gemini
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={apiStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Bar dataKey="groqTokens" name="Tokens Groq" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="geminiTokens" name="Tokens Gemini" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Tokens Entrée vs Sortie */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Répartition : Tokens d'Entrée (Prompt) vs Sortie (Complétion)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={apiStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="inputTokens"
                        name="Tokens d'Entrée"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorInput)"
                      />
                      <Area
                        type="monotone"
                        dataKey="outputTokens"
                        name="Tokens de Sortie"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorOutput)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Model details */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                Modèles d'Intelligence Artificielle en Ligne
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">qwen/qwen3.8-27b (Groq)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Moteur principal de rédaction de chapitres et relecture.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">groq/compound (Groq)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Brainstorming, structuration de plans et idéation rapide.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="font-bold text-slate-900 dark:text-white">gemini-2.5-flash (Google)</p>
                  <p className="text-[11px] text-slate-500 mt-1">Raisonnement complexe et synthèses de contenu.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: JOURNAL SYSTÈME & PARAMÈTRES GLOBAUX */}
      {/* ============================================================= */}
      {activeTab === 'settings_logs' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Global Settings */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Quotas & Limites Quotidiennes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajustez les quotas de requêtes IA journalières autorisées par type de compte.
              </p>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Limite quotidienne Plan Gratuit (prompts / jour)
                  </label>
                  <input
                    type="number"
                    value={globalConfig.freeDailyPromptLimit}
                    onChange={(e) =>
                      onUpdateGlobalConfig({
                        ...globalConfig,
                        freeDailyPromptLimit: Number(e.target.value) || 5
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Limite quotidienne Plan Pro (prompts / jour)
                  </label>
                  <input
                    type="number"
                    value={globalConfig.proDailyPromptLimit}
                    onChange={(e) =>
                      onUpdateGlobalConfig({
                        ...globalConfig,
                        proDailyPromptLimit: Number(e.target.value) || 50
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Limite quotidienne Plan Premium (prompts / jour)
                  </label>
                  <input
                    type="number"
                    value={globalConfig.premiumDailyPromptLimit}
                    onChange={(e) =>
                      onUpdateGlobalConfig({
                        ...globalConfig,
                        premiumDailyPromptLimit: Number(e.target.value) || 200
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bandeau d'Annonce Global
                  </label>
                  <input
                    type="text"
                    value={globalConfig.announcementBanner}
                    onChange={(e) =>
                      onUpdateGlobalConfig({
                        ...globalConfig,
                        announcementBanner: e.target.value
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Error Logs */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Journal des Événements & Santé Système
                </h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Système Sain
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Tous les services opérationnels</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Aucune erreur critique n'est signalée. Les appels API Groq, Gemini et Saspay sont surveillés en temps réel.
                </p>
              </div>

              {errorLogs.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {errorLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs">
                      <div className="flex items-center justify-between font-bold text-red-700 dark:text-red-400">
                        <span>{log.service.toUpperCase()} - {log.errorCode}</span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
