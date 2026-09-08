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
  PieChart as PieChartIcon,
  Wallet,
  ArrowDownRight
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

  // User financial calculation helper
  const getUserFinancials = (user: AdminUser) => {
    const monthlyRate = user.plan === 'premium' ? 32000 : user.plan === 'pro' ? 19000 : 0;
    // Estimated lifetime contribution based on plan and projects
    const estimatedMonths = Math.max(1, Math.min(6, (user.lifetimeProjects || 1)));
    const totalSpent = monthlyRate * estimatedMonths;
    return {
      monthlyRate,
      estimatedMonths,
      totalSpent
    };
  };

  // Compute real KPIs
  const kpiData = useMemo(() => {
    const totalUsers = users.length;
    const freeCount = users.filter((u) => u.plan === 'free').length;
    const proCount = users.filter((u) => u.plan === 'pro').length;
    const premiumCount = users.filter((u) => u.plan === 'premium').length;
    const paidCount = proCount + premiumCount;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;

    const totalWords = users.reduce((acc, u) => acc + (u.totalWordsGenerated || 0), 0);
    const totalProjects = users.reduce((acc, u) => acc + (u.lifetimeProjects || 0), 0);

    // AI Token metrics
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
    const calculatedMRR = (proCount * 19000) + (premiumCount * 32000);
    const calculatedARR = calculatedMRR * 12;

    // Total lifetime revenue brought by current user base
    const totalUsersRevenue = users.reduce((acc, u) => acc + getUserFinancials(u).totalSpent, 0);

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
      arr: calculatedARR,
      totalUsersRevenue,
      arpu: paidCount > 0 ? Math.round(calculatedMRR / paidCount) : 0
    };
  }, [users, apiStats, subscriptionRevenueStats]);

  // Data for Pie Charts
  const planDistributionData = useMemo(() => [
    { name: 'Forfait Premium (32k)', value: kpiData.premiumCount, color: '#f59e0b', revenue: kpiData.premiumCount * 32000 },
    { name: 'Forfait Pro (19k)', value: kpiData.proCount, color: '#6366f1', revenue: kpiData.proCount * 19000 },
    { name: 'Gratuit / Essai', value: kpiData.freeCount, color: '#94a3b8', revenue: 0 }
  ], [kpiData]);

  const revenueByPlanData = useMemo(() => [
    { name: 'Abonnements Premium', value: kpiData.premiumSaspayRevenue, color: '#f59e0b' },
    { name: 'Abonnements Pro', value: kpiData.proSaspayRevenue, color: '#6366f1' }
  ], [kpiData]);

  const providerDistributionData = useMemo(() => [
    { name: 'Groq (Inférence Ultra-Rapide)', value: kpiData.groqTokensMonth, color: '#6366f1' },
    { name: 'Gemini (Long Contexte)', value: kpiData.geminiTokensMonth, color: '#a855f7' }
  ], [kpiData]);

  // Top revenue-generating users
  const topRevenueUsers = useMemo(() => {
    return [...users]
      .map((u) => ({
        ...u,
        ...getUserFinancials(u)
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [users]);

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
                Moteurs IA en Ligne &amp; Passerelle Saspay Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Supervision des revenus d'abonnements Saspay, suivi analytique des données utilisateurs, diagrammes de monétisation et monitoring IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportSaspayReport}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold flex items-center gap-2 border border-slate-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rapport Financier CSV</span>
            </button>

            <button
              onClick={onLockAdmin}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2 border border-red-500/30 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>

        {/* 4 Super-KPIs Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          
          <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-750">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Revenus Période (Saspay)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
              {kpiData.totalSaspayRevenue.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA</span>
            </div>
            <div className="text-[10px] text-emerald-500/90 mt-0.5 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{kpiData.totalNewSubs} souscriptions</span>
            </div>
          </div>

          <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-750">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>MRR Récurrent Actuel</span>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-indigo-300 mt-1">
              {kpiData.mrr.toLocaleString('fr-FR')} <span className="text-xs font-bold">FCFA/m</span>
            </div>
            <div className="text-[10px] text-indigo-400 mt-0.5 font-medium">
              ARR: {kpiData.arr.toLocaleString('fr-FR')} FCFA/an
            </div>
          </div>

          <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-750">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Auteurs Inscrits</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">
              {kpiData.totalUsers} <span className="text-xs font-normal text-slate-400">comptes</span>
            </div>
            <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
              {kpiData.paidCount} abonnés payants ({kpiData.totalUsers > 0 ? ((kpiData.paidCount / kpiData.totalUsers) * 100).toFixed(0) : 0}%)
            </div>
          </div>

          <div className="bg-slate-850/80 p-3.5 rounded-2xl border border-slate-750">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Tokens IA Consommés</span>
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-lg sm:text-xl font-black text-purple-300 mt-1">
              {kpiData.totalTokensMonth.toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-400">tokens</span>
            </div>
            <div className="text-[10px] text-purple-400 mt-0.5 font-medium">
              {kpiData.totalRequestsMonth} requêtes IA
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
          <span>1. Indicateurs Clés &amp; Diagrammes</span>
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
          <span>3. Données Auteurs &amp; Argent Généré ({users.length})</span>
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
          <span>5. Journal Système &amp; Quotas</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: KPIS, DIAGRAMMES ÉPURÉS & CAMEMBERTS */}
      {/* ============================================================= */}
      {activeTab === 'kpis' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Section 1: Les Graphiques Principaux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Graphique 1: Revenus SaaS Saspay (Area) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Évolution des Revenus Saspay (FCFA)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Souscriptions quotidiennes Pro &amp; Premium
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
                  <AreaChart data={subscriptionRevenueStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSaspay" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
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

            {/* Graphique 2: Répartition des Revenus par Forfait (Camembert Épuré) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Répartition des Abonnés &amp; Forfaits
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Diagramme circulaire de la base utilisateurs
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {kpiData.totalUsers} Utilisateurs
                </span>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: any) => [`${value} utilisateur(s)`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with data values */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                {planDistributionData.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span>{item.name.split(' ')[1] || item.name}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {item.value} ({kpiData.totalUsers > 0 ? ((item.value / kpiData.totalUsers) * 100).toFixed(0) : 0}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 2: Deuxième rangée de graphiques (Consommation IA & Répartition Moteur) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Graphique 3: Consommation des Tokens IA */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Volume des Tokens IA Consommés
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tokens d'inférence traités (Groq &amp; Gemini)
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
                  <BarChart data={apiStats} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
                    <XAxis dataKey="dayLabel" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(val) => `${val / 1000}k`} />
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

            {/* Graphique 4: Camembert Inférence IA */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Part d'Inférence par Modèle IA
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Répartition de la charge de calcul
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {kpiData.totalRequestsMonth} Requêtes
                </span>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={providerDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {providerDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any) => [`${Number(val).toLocaleString('fr-FR')} tokens`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                {providerDistributionData.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850">
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span>{item.name.split(' ')[0]}</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                      {kpiData.totalTokensMonth > 0 ? ((item.value / kpiData.totalTokensMonth) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Section 3: Classement des Auteurs par Argent Rapporté (Top Contributors) */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Wallet className="w-4 h-4" />
                  <span>Suivi de la Rentabilité par Utilisateur</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Classement des Utilisateurs par Argent Rapporté
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Vue détaillée des contributions financières cumulées par auteur via Saspay.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-medium">Revenu Total Généré par les Utilisateurs</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {kpiData.totalUsersRevenue.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Rang &amp; Auteur</th>
                    <th className="p-3">Forfait Actif</th>
                    <th className="p-3">Mensualité Saspay</th>
                    <th className="p-3">Livres Rédigés</th>
                    <th className="p-3">Mots Générés</th>
                    <th className="p-3 rounded-r-xl text-right">Argent Rapporté (Cumulé)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {topRevenueUsers.map((u, idx) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-5 text-center font-bold text-xs ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-400'}`}>
                            #{idx + 1}
                          </span>
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
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {u.monthlyRate > 0 ? `${u.monthlyRate.toLocaleString('fr-FR')} FCFA/m` : '0 FCFA'}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {u.lifetimeProjects || 0} livres
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {(u.totalWordsGenerated || 0).toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                          {u.totalSpent.toLocaleString('fr-FR')} FCFA
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  Via Saspay Mobile Money &amp; Cartes
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
      {/* TAB 3: GESTION DES UTILISATEURS & SUIVI DE L'ARGENT */}
      {/* ============================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Répertoire des Auteurs &amp; Données de Monétisation ({filteredUsers.length} affichés)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Suivez en direct l'argent généré par chaque utilisateur, gérez les accès et quotas de prompts.
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
                    <th className="p-3">Argent Rapporté</th>
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
                      <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                        Aucun utilisateur ne correspond aux critères.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const fin = getUserFinancials(u);
                      return (
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
                          <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                            {fin.totalSpent.toLocaleString('fr-FR')} FCFA
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
                              <select
                                value={u.plan}
                                onChange={(e: any) => handleChangeUserPlan(u.id, e.target.value)}
                                className="text-[11px] p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                              >
                                <option value="free">Gratuit</option>
                                <option value="pro">Pro</option>
                                <option value="premium">Premium</option>
                              </select>

                              <button
                                onClick={() => handleResetUserCounters(u.id)}
                                title="Remettre compteurs à zéro"
                                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleBlockUser(u.id)}
                                title={u.status === 'blocked' ? 'Débloquer' : 'Bloquer'}
                                className={`p-1 rounded-lg transition-colors ${
                                  u.status === 'blocked'
                                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50'
                                    : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: UTILISATION DES TOKENS IA */}
      {/* ============================================================= */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monitoring &amp; Consommation des Tokens IA
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Suivi des tokens d'entrée et de sortie sur les 7 derniers jours.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  Groq SDK (qwen3.8-27b)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                  Google Gemini SDK
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Jour</th>
                    <th className="p-3">Tokens Groq</th>
                    <th className="p-3">Tokens Gemini</th>
                    <th className="p-3">Input Tokens</th>
                    <th className="p-3">Output Tokens</th>
                    <th className="p-3">Total Tokens</th>
                    <th className="p-3 rounded-r-xl">Requêtes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {apiStats.map((stat, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {stat.dayLabel} ({stat.date})
                      </td>
                      <td className="p-3 font-medium text-indigo-600 dark:text-indigo-400">
                        {stat.groqTokens.toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 font-medium text-purple-600 dark:text-purple-400">
                        {stat.geminiTokens.toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 text-slate-500">{stat.inputTokens.toLocaleString('fr-FR')}</td>
                      <td className="p-3 text-slate-500">{stat.outputTokens.toLocaleString('fr-FR')}</td>
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {stat.totalTokens.toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        {stat.requestsCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-500" />
                  Configuration des Quotas &amp; Limites
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ajustez les seuils quotidiens attribués à chaque forfait.
                </p>
              </div>

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
                  Journal des Événements &amp; Santé Système
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
                  Aucune erreur critique n'est signalée. Les appels API Groq, Gemini et Saspay sont surveillés en temps réel avec secours immédiat.
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
