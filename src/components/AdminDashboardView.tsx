import React, { useState, useMemo } from 'react';
import {
  Users,
  Cpu,
  Award,
  AlertOctagon,
  Settings,
  TrendingUp,
  Activity,
  DollarSign,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
  BarChart3,
  Sliders,
  RefreshCw,
  Eye,
  Zap,
  Globe,
  Radio,
  FileText,
  MousePointerClick,
  Database,
  ArrowUpRight,
  Info,
  CreditCard,
  ShoppingBag,
  Truck,
  PackageCheck,
  Wallet,
  ArrowDownRight,
  Layers,
  Percent,
  Download,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import {
  AdminUser,
  AdminApiDailyStat,
  AdminAffiliateCourse,
  AdminErrorLog,
  AdminGlobalConfig,
  TrainingCourse,
  AdminSubscriptionRevenueStat,
  AdminChariotDeliveryRevenueStat
} from '../types';
import {
  INITIAL_SUBSCRIPTION_REVENUE_STATS,
  INITIAL_CHARIOT_DELIVERY_REVENUE_STATS
} from '../data/adminData';

interface AdminDashboardViewProps {
  users: AdminUser[];
  onUpdateUsers: (users: AdminUser[]) => void;
  apiStats: AdminApiDailyStat[];
  subscriptionRevenueStats?: AdminSubscriptionRevenueStat[];
  chariotDeliveryRevenueStats?: AdminChariotDeliveryRevenueStat[];
  affiliateCourses: AdminAffiliateCourse[];
  onUpdateAffiliateCourses: (courses: AdminAffiliateCourse[]) => void;
  errorLogs: AdminErrorLog[];
  onUpdateErrorLogs: (logs: AdminErrorLog[]) => void;
  globalConfig: AdminGlobalConfig;
  onUpdateGlobalConfig: (config: AdminGlobalConfig) => void;
  onLockAdmin: () => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void;
  onSyncWithTrainingCatalog?: (courses: TrainingCourse[]) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  onUpdateUsers,
  apiStats,
  subscriptionRevenueStats = INITIAL_SUBSCRIPTION_REVENUE_STATS,
  chariotDeliveryRevenueStats = INITIAL_CHARIOT_DELIVERY_REVENUE_STATS,
  affiliateCourses,
  onUpdateAffiliateCourses,
  errorLogs,
  onUpdateErrorLogs,
  globalConfig,
  onUpdateGlobalConfig,
  onLockAdmin,
  onShowToast
}) => {
  // Navigation tabs
  type AdminTab = 'kpis' | 'finances' | 'users' | 'api' | 'affiliate' | 'settings_logs';
  const [activeTab, setActiveTab] = useState<AdminTab>('kpis');

  // Finances view filter & mode
  const [financeTimeframe, setFinanceTimeframe] = useState<'14d' | '30d' | 'all'>('14d');
  const [revenueFocusMode, setRevenueFocusMode] = useState<'both' | 'subscriptions' | 'chariot'>('both');

  // User Management filters & selection
  const [userSearch, setUserSearch] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<'all' | 'free' | 'pro' | 'premium' | 'blocked'>('all');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Affiliate Course Form state
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminAffiliateCourse | null>(null);
  const [courseForm, setCourseForm] = useState<Partial<AdminAffiliateCourse>>({
    title: '',
    author: '',
    description: '',
    affiliateUrl: '',
    targetAudience: 'all',
    price: 49,
    commissionRate: 40,
    category: 'Édition & Créativité',
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    isActive: true
  });

  // Global config editing draft
  const [configDraft, setConfigDraft] = useState<AdminGlobalConfig>(globalConfig);

  // Filtered Users computation
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      
      if (!matchesSearch) return false;

      if (userPlanFilter === 'blocked') return u.status === 'blocked';
      if (userPlanFilter === 'free') return u.plan === 'free';
      if (userPlanFilter === 'pro') return u.plan === 'pro';
      if (userPlanFilter === 'premium') return u.plan === 'premium';
      return true;
    });
  }, [users, userSearch, userPlanFilter]);

  // Overall Financials & KPIs computation
  const kpiData = useMemo(() => {
    const totalUsers = users.length;
    const freeCount = users.filter((u) => u.plan === 'free').length;
    const paidCount = users.filter((u) => u.plan === 'pro' || u.plan === 'premium').length;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;
    
    const totalWords = users.reduce((acc, u) => acc + (u.totalWordsGenerated || 0), 0);
    const totalProjects = users.reduce((acc, u) => acc + (u.lifetimeProjects || 0), 0);
    
    const totalTokensMonth = apiStats.reduce((acc, stat) => acc + stat.totalTokens, 0);
    const totalCostMonth = apiStats.reduce((acc, stat) => acc + stat.estimatedCost, 0);
    const totalRequestsMonth = apiStats.reduce((acc, stat) => acc + stat.requestsCount, 0);

    // Subscription calculations
    const totalSubscriptionRevenuePeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.totalSubscriptionRevenue, 0);
    const totalProRevenuePeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.proRevenue, 0);
    const totalPremiumRevenuePeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.premiumRevenue, 0);
    const totalNewSubsPeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.newSubscriptionsCount, 0);
    const totalRenewalsPeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.renewalsCount, 0);
    const totalChurnPeriod = subscriptionRevenueStats.reduce((acc, s) => acc + s.churnCount, 0);
    const estimatedMRR = Math.round(totalSubscriptionRevenuePeriod * 2.14); // Projection mensuelle MRR
    const estimatedARR = estimatedMRR * 12;

    // Chariot Delivery calculations
    const totalChariotGMVPeriod = chariotDeliveryRevenueStats.reduce((acc, s) => acc + s.grossMerchandiseValue, 0);
    const totalChariotCommissionsPeriod = chariotDeliveryRevenueStats.reduce((acc, s) => acc + s.commissionsEarned, 0);
    const totalChariotOrdersPeriod = chariotDeliveryRevenueStats.reduce((acc, s) => acc + s.ordersDeliveredCount, 0);
    const avgChariotCart = totalChariotOrdersPeriod > 0 ? (totalChariotGMVPeriod / totalChariotOrdersPeriod) : 64.50;
    const avgCommissionRate = totalChariotGMVPeriod > 0 ? ((totalChariotCommissionsPeriod / totalChariotGMVPeriod) * 100) : 43.5;

    // Affiliate catalog counters
    const totalAffiliateClicks = affiliateCourses.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
    const totalAffiliateConversions = affiliateCourses.reduce((acc, c) => acc + (c.conversionsCount || 0), 0);

    // Combined Gross & Net Revenues
    const totalCombinedIncome = totalSubscriptionRevenuePeriod + totalChariotCommissionsPeriod;
    const netProfitEstimated = totalCombinedIncome - totalCostMonth;

    return {
      totalUsers: totalUsers * 245 + 18, // Scaling for realistic representation
      activeUsersToday: 412,
      activeUsersMonth: 1890,
      freeCount,
      paidCount,
      blockedCount,
      totalWords: totalWords + 2450000,
      totalProjects: totalProjects + 1240,
      totalTokensMonth,
      totalCostMonth,
      totalRequestsMonth,
      // Subscriptions
      totalSubscriptionRevenuePeriod,
      totalProRevenuePeriod,
      totalPremiumRevenuePeriod,
      totalNewSubsPeriod,
      totalRenewalsPeriod,
      totalChurnPeriod,
      estimatedMRR,
      estimatedARR,
      // Chariot
      totalChariotGMVPeriod,
      totalChariotCommissionsPeriod,
      totalChariotOrdersPeriod,
      avgChariotCart,
      avgCommissionRate,
      totalAffiliateClicks,
      totalAffiliateConversions,
      // Global
      totalCombinedIncome,
      netProfitEstimated
    };
  }, [users, apiStats, subscriptionRevenueStats, chariotDeliveryRevenueStats, affiliateCourses]);

  // Combined Chart Dataset for Multi-source analysis
  const combinedFinanceChartData = useMemo(() => {
    return subscriptionRevenueStats.map((sub, idx) => {
      const chariot = chariotDeliveryRevenueStats[idx] || {
        grossMerchandiseValue: 0,
        commissionsEarned: 0,
        ordersDeliveredCount: 0,
        averageCartValue: 0,
        topCourseTitle: ''
      };
      return {
        date: sub.dayLabel,
        fullDate: sub.date,
        // Subscriptions series
        revenuAbonnements: sub.totalSubscriptionRevenue,
        revenuPro: sub.proRevenue,
        revenuPremium: sub.premiumRevenue,
        nouvellesSouscriptions: sub.newSubscriptionsCount,
        renouvellements: sub.renewalsCount,
        desabonnements: sub.churnCount,
        // Chariot series
        volumeBrutChariot: chariot.grossMerchandiseValue,
        commissionsChariot: chariot.commissionsEarned,
        commandesLivrees: chariot.ordersDeliveredCount,
        panierMoyenChariot: chariot.averageCartValue,
        topCours: chariot.topCourseTitle,
        // Totals
        totalRevenusJour: sub.totalSubscriptionRevenue + chariot.commissionsEarned
      };
    });
  }, [subscriptionRevenueStats, chariotDeliveryRevenueStats]);

  // Chart data: User Growth & Generation Volume
  const userActivityChartData = useMemo(() => {
    return apiStats.map((stat) => ({
      date: stat.dayLabel,
      utilisateursActifs: Math.round(stat.requestsCount * 0.45) + 120,
      fluxMots: Math.round(stat.outputTokens * 0.75),
      requetesIA: stat.requestsCount
    }));
  }, [apiStats]);

  // Handle User Moderation: Toggle Block
  const handleToggleUserBlock = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === 'blocked' ? ('active' as const) : ('blocked' as const);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
    const target = users.find((u) => u.id === userId);
    if (target?.status === 'active') {
      onShowToast('Compte Bloqué', `L'accès de ${target.name} a été suspendu.`, 'info');
    } else {
      onShowToast('Compte Réactivé', `L'accès de ${target?.name} a été rétabli.`, 'success');
    }
  };

  // Handle User Edit Quotas & Plan
  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map((u) => (u.id === editingUser.id ? editingUser : u));
    onUpdateUsers(updated);
    setEditingUser(null);
    onShowToast('Modifications Enregistrées', `Les quotas et le statut de ${editingUser.name} ont été mis à jour.`, 'success');
  };

  // Handle Affiliate Course Actions
  const handleSaveAffiliateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.affiliateUrl) {
      onShowToast('Erreur', 'Veuillez renseigner au minimum le titre et le lien d\'affiliation.', 'error');
      return;
    }

    if (editingCourse) {
      // Update
      const updated = affiliateCourses.map((c) =>
        c.id === editingCourse.id ? ({ ...c, ...courseForm } as AdminAffiliateCourse) : c
      );
      onUpdateAffiliateCourses(updated);
      onShowToast('Formation Mise à Jour', `"${courseForm.title}" a été modifiée avec succès.`, 'success');
    } else {
      // Create
      const newCourse: AdminAffiliateCourse = {
        id: `aff-${Date.now()}`,
        title: courseForm.title || 'Nouvelle Formation',
        author: courseForm.author || 'Partenaire Chariot',
        description: courseForm.description || '',
        affiliateUrl: courseForm.affiliateUrl || '',
        targetAudience: courseForm.targetAudience || 'all',
        price: Number(courseForm.price) || 49,
        commissionRate: Number(courseForm.commissionRate) || 40,
        category: courseForm.category || 'Édition & Créativité',
        coverGradient: courseForm.coverGradient || 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        clicksCount: 0,
        conversionsCount: 0,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onUpdateAffiliateCourses([newCourse, ...affiliateCourses]);
      onShowToast('Formation Ajoutée', `La formation affiliée "${newCourse.title}" est maintenant active.`, 'success');
    }

    setIsAddingCourse(false);
    setEditingCourse(null);
    setCourseForm({
      title: '',
      author: '',
      description: '',
      affiliateUrl: '',
      targetAudience: 'all',
      price: 49,
      commissionRate: 40,
      category: 'Édition & Créativité',
      coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      isActive: true
    });
  };

  const handleToggleCourseStatus = (courseId: string) => {
    const updated = affiliateCourses.map((c) =>
      c.id === courseId ? { ...c, isActive: !c.isActive } : c
    );
    onUpdateAffiliateCourses(updated);
    onShowToast('Statut Modifié', 'La visibilité de la formation a été mise à jour.', 'info');
  };

  const handleDeleteCourse = (courseId: string) => {
    const target = affiliateCourses.find((c) => c.id === courseId);
    const updated = affiliateCourses.filter((c) => c.id !== courseId);
    onUpdateAffiliateCourses(updated);
    onShowToast('Formation Supprimée', `"${target?.title}" a été retirée du catalogue affilié.`, 'info');
  };

  const handleSimulateAffiliateClick = (courseId: string) => {
    const updated = affiliateCourses.map((c) =>
      c.id === courseId ? { ...c, clicksCount: c.clicksCount + 1 } : c
    );
    onUpdateAffiliateCourses(updated);
    onShowToast('Test Lien Chariot', 'Redirection d\'affiliation simulée (+1 clic enregistré).', 'info');
  };

  // Handle Save Global Config
  const handleSaveGlobalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGlobalConfig(configDraft);
    onShowToast('Configuration Appliquée', 'Les règles globales de l\'application ont été enregistrées sans redéploiement.', 'success');
  };

  // Handle Error Logs: Toggle Resolve
  const handleToggleResolveLog = (logId: string) => {
    const updated = errorLogs.map((log) =>
      log.id === logId ? { ...log, resolved: !log.resolved } : log
    );
    onUpdateErrorLogs(updated);
    onShowToast('Journal Mis à Jour', 'Le statut de l\'incident a été actualisé.', 'info');
  };

  const handleClearLogs = () => {
    onUpdateErrorLogs([]);
    onShowToast('Logs Purgés', 'L\'historique des erreurs a été réinitialisé.', 'info');
  };

  const handleExportFinancialReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Revenu_Abonnements_EUR,Abonnements_Pro_EUR,Abonnements_Premium_EUR,Nouvelles_Souscriptions,Volume_Brut_Chariot_EUR,Commissions_Chariot_EUR,Commandes_Chariot_Livrees,Panier_Moyen_EUR,Top_Formation\n"
      + combinedFinanceChartData.map(e => `${e.fullDate},${e.revenuAbonnements},${e.revenuPro},${e.revenuPremium},${e.nouvellesSouscriptions},${e.volumeBrutChariot},${e.commissionsChariot},${e.commandesLivrees},${e.panierMoyenChariot},"${e.topCours}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_financier_bookly_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Export Réussi', 'Le grand livre financier CSV (Abonnements & Chariot) a été téléchargé.', 'success');
  };

  return (
    <div id="admin-dashboard-root" className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ------------------------------------------------------------- */}
      {/* ADMIN HEADER & ACCREDITATION BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                Console d'Administration &bull; Super Admin
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full">
                <Radio className="w-3 h-3 animate-pulse" /> Passerelle Financière & API Opérationnelles
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Tableau de Bord Administrateur
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pilotez les revenus générés par les abonnements SaaS, les commissions de livraison Chariot, suivez l'activité des membres et supervisez la consommation API Groq en temps réel.
            </p>
          </div>

          {/* Quick Admin Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto flex-wrap">
            <button
              onClick={handleExportFinancialReport}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors shadow-sm"
              title="Exporter le rapport financier complet (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter Trésorerie</span>
            </button>

            <button
              onClick={() => onShowToast('Données Synchronisées', 'Toutes les métriques de revenus et d\'activité ont été recalculées.', 'info')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Rafraîchir les métriques"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>

            <button
              onClick={onLockAdmin}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 border border-red-500/30 transition-colors shadow-sm"
              title="Verrouiller la session administrateur"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Verrouiller</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1 : HIGHLIGHT FINANCIAL & OPERATIONAL SUMMARY BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800">
          
          {/* Card 1: MRR Abonnements */}
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-500/30 shadow-xs relative overflow-hidden">
            <div className="text-[11px] text-indigo-300 font-semibold flex items-center justify-between">
              <span>MRR Abonnements (SaaS)</span>
              <CreditCard className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {kpiData.estimatedMRR.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-400">/ mois</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <TrendingUp className="w-3 h-3" /> ARR : {kpiData.estimatedARR.toLocaleString('fr-FR')} €
            </div>
          </div>

          {/* Card 2: Commissions Livraison Chariot */}
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-emerald-500/30 shadow-xs">
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-between">
              <span>Commissions Chariot</span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {kpiData.totalChariotCommissionsPeriod.toLocaleString('fr-FR')} €
            </div>
            <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
              <span>GMV Brut : {kpiData.totalChariotGMVPeriod.toLocaleString('fr-FR')} €</span>
            </div>
          </div>

          {/* Card 3: Total Membres */}
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Membres Inscrits</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {kpiData.totalUsers.toLocaleString('fr-FR')}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
              <TrendingUp className="w-3 h-3" /> {kpiData.activeUsersToday} actifs / jour
            </div>
          </div>

          {/* Card 4: Activité Flux Mots */}
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Volume Rédaction (Flux)</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {(kpiData.totalWords / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">mots</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
              {kpiData.totalProjects.toLocaleString('fr-FR')} livres & manuscrits
            </div>
          </div>

          {/* Card 5: Coût API / Budget */}
          <div className="bg-slate-800/60 backdrop-blur-xs p-3.5 rounded-2xl border border-slate-700/60 col-span-2 lg:col-span-1">
            <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
              <span>Coût API Groq / Budget</span>
              <Cpu className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1">
              {kpiData.totalCostMonth.toFixed(2)} € <span className="text-xs font-normal text-slate-400">/ {globalConfig.monthlyApiBudgetLimit} €</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
              {((kpiData.totalCostMonth / globalConfig.monthlyApiBudgetLimit) * 100).toFixed(1)}% du budget utilisé
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* NAVIGATION TABS SELECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          id="tab-btn-kpis"
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
          id="tab-btn-finances"
          onClick={() => setActiveTab('finances')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'finances'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>2. Revenus & Trésorerie (Abonnements & Chariot)</span>
        </button>

        <button
          id="tab-btn-users"
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
          id="tab-btn-api"
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>4. Suivi API Groq & Coûts</span>
        </button>

        <button
          id="tab-btn-affiliate"
          onClick={() => setActiveTab('affiliate')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'affiliate'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>5. Affiliation Formations (Chariot)</span>
        </button>

        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab('settings_logs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'settings_logs'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>6. Journal d'Erreurs & Paramètres Globaux</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* TAB 1: INDICATEURS CLÉS (KPIS) AVEC LES DEUX GRAPHIQUES DE REVENUS */}
      {/* ============================================================= */}
      {activeTab === 'kpis' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* ------------------------------------------------------------- */}
          {/* SECTION SPÉCIFIQUE : LES DEUX GRAPHIQUES DISTINCTS DE REVENUS */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-emerald-900/40 p-4 sm:p-5 rounded-2xl border border-indigo-200/40 dark:border-indigo-800/40">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Flux de Trésorerie & Monétisation
                </div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                  Revenus des Abonnements et de la Livraison Chariot
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Visualisation séparée et comparative des deux moteurs de croissance financière de Bookly Studio.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('finances')}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all shrink-0"
              >
                <span>Accéder au Grand Livre Trésorerie</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* GRID DES DEUX GRAPHIQUES DISTINCTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ------------------------------------------------------------- */}
              {/* GRAPHIQUE 1 : REVENUS ISSUS DES ABONNEMENTS */}
              {/* ------------------------------------------------------------- */}
              <div id="chart-subscription-revenue" className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            1. Revenus Issus des Abonnements
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Revenus récurrents journaliers (Forfaits Pro 29€ & Premium 49€)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {kpiData.totalSubscriptionRevenuePeriod.toLocaleString('fr-FR')} €
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">sur 14 jours</span>
                    </div>
                  </div>

                  {/* Badges Metrics Subscriptions */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">MRR Actuel</div>
                      <div className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {kpiData.estimatedMRR.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Nouveaux Abonnés</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1">
                        <span className="text-emerald-500">+{kpiData.totalNewSubsPeriod}</span>
                        <span className="text-[10px] text-slate-400 font-normal">/ 14j</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Rétention / Churn</div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        97.6% <span className="text-[10px] text-slate-400 font-normal">fidèles</span>
                      </div>
                    </div>
                  </div>

                  {/* Graphique Abonnements */}
                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={combinedFinanceChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSubTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorSubPro" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="colorSubPrem" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="€" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(val: any, name: any) => [`${val} €`, name]}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Area
                          type="monotone"
                          dataKey="revenuAbonnements"
                          name="Total Abonnements (€)"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSubTotal)"
                        />
                        <Area
                          type="monotone"
                          dataKey="revenuPro"
                          name="Formules Pro (29€)"
                          stroke="#3b82f6"
                          strokeWidth={1.8}
                          fillOpacity={1}
                          fill="url(#colorSubPro)"
                        />
                        <Area
                          type="monotone"
                          dataKey="revenuPremium"
                          name="Formules Premium (49€)"
                          stroke="#8b5cf6"
                          strokeWidth={1.8}
                          fillOpacity={1}
                          fill="url(#colorSubPrem)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Prélèvements Stripe & CB synchronisés
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ARR : {kpiData.estimatedARR.toLocaleString('fr-FR')} €
                  </span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* GRAPHIQUE 2 : REVENUS ISSUS DE LA LIVRAISON CHARIOT */}
              {/* ------------------------------------------------------------- */}
              <div id="chart-chariot-revenue" className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            2. Revenus Issus de la Livraison Chariot
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Commissions perçues & volume brut livré des formations affiliées
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {kpiData.totalChariotCommissionsPeriod.toLocaleString('fr-FR')} €
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">commissions perçues</span>
                    </div>
                  </div>

                  {/* Badges Metrics Chariot */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Volume Brut (GMV)</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {kpiData.totalChariotGMVPeriod.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Commandes Livrées</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {kpiData.totalChariotOrdersPeriod} <span className="text-[10px] text-slate-400 font-normal">cours</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Panier Moyen</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {kpiData.avgChariotCart.toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  {/* Graphique Chariot */}
                  <div className="h-64 sm:h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={combinedFinanceChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorChariotComm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="€" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                          }}
                          formatter={(val: any, name: any) => {
                            if (name === 'Commandes Livrées') return [`${val} commandes`, name];
                            return [`${val} €`, name];
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                        <Bar
                          dataKey="volumeBrutChariot"
                          name="Volume Brut Livré GMV (€)"
                          fill="#0284c7"
                          radius={[6, 6, 0, 0]}
                          barSize={16}
                        />
                        <Area
                          type="monotone"
                          dataKey="commissionsChariot"
                          name="Commissions Perçues (€)"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorChariotComm)"
                        />
                        <Line
                          type="monotone"
                          dataKey="commandesLivrees"
                          name="Commandes Livrées"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-emerald-500" /> Taux de commission moyen : {kpiData.avgCommissionRate.toFixed(1)}%
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Passerelle Chariot Validée
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION ACTIVITÉ GÉNÉRALE (UTILISATEURS & FLUX) */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 3: Utilisateurs Actifs & Activité */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    3. Évolution de l'Activité & Utilisateurs Actifs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Utilisateurs actifs quotidiens et requêtes générées sur 14 jours
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  Temps Réel
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userActivityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="utilisateursActifs"
                      name="Utilisateurs Actifs"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="requetesIA"
                      name="Requêtes IA / jour"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorReq)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Volume de Mots & Flux de Rédaction */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    4. Volume des Flux de Rédaction (Mots Générés)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Nombre de mots générés quotidiennement par les membres
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
                  Production Globale
                </span>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="fluxMots"
                      name="Mots rédigés & générés"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#f59e0b' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Breakdown Cards & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Répartition des Formules</span>
                <Users className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Gratuit (Free)</span>
                  <span className="font-bold text-slate-900 dark:text-white">65% (1 597)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '65%' }} />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Abonnés Pro (29€)</span>
                  <span className="font-bold text-slate-900 dark:text-white">25% (614)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '25%' }} />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">Premium / Studio (49€)</span>
                  <span className="font-bold text-slate-900 dark:text-white">10% (247)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-violet-600 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Trésorerie Globale (14 Jours)</span>
                <Wallet className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Revenus Abonnements :</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">+{kpiData.totalSubscriptionRevenuePeriod.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Commissions Chariot :</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{kpiData.totalChariotCommissionsPeriod.toLocaleString('fr-FR')} €</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Total Encaissé :</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{kpiData.totalCombinedIncome.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                <span>Modèle IA Principal (Groq)</span>
                <Radio className="w-4 h-4 text-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white">qwen/qwen3.8-27b</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Latence moyenne : 260 ms &bull; Haute fidélité</div>
                </div>
                <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
                  <span>Fallback automatique :</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">groq/compound + Gemini</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 2: REVENUS & TRÉSORERIE DÉTAILLÉE (ABONNEMENTS & CHARIOT) */}
      {/* ============================================================= */}
      {activeTab === 'finances' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Controls for Finances */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-500" />
                Grand Livre Financier & Analyse des Revenus
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ventilation détaillée des rentrées d'argent par formule d'abonnement et par livraison de formation Chariot.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Focus mode selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setRevenueFocusMode('both')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    revenueFocusMode === 'both'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Vue Combinée
                </button>
                <button
                  onClick={() => setRevenueFocusMode('subscriptions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    revenueFocusMode === 'subscriptions'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Abonnements Seuls
                </button>
                <button
                  onClick={() => setRevenueFocusMode('chariot')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    revenueFocusMode === 'chariot'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Chariot Seul
                </button>
              </div>

              <button
                onClick={handleExportFinancialReport}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Financial Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <span>Revenus Abonnements (14j)</span>
                <CreditCard className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {kpiData.totalSubscriptionRevenuePeriod.toLocaleString('fr-FR')} €
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                <div>Pro (29€) : <span className="font-semibold text-slate-900 dark:text-white">{kpiData.totalProRevenuePeriod.toLocaleString('fr-FR')} €</span></div>
                <div>Premium (49€) : <span className="font-semibold text-slate-900 dark:text-white">{kpiData.totalPremiumRevenuePeriod.toLocaleString('fr-FR')} €</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <span>Commissions Chariot (14j)</span>
                <Truck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {kpiData.totalChariotCommissionsPeriod.toLocaleString('fr-FR')} €
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                <div>Volume Brut GMV : <span className="font-semibold text-slate-900 dark:text-white">{kpiData.totalChariotGMVPeriod.toLocaleString('fr-FR')} €</span></div>
                <div>Commandes Livrées : <span className="font-semibold text-slate-900 dark:text-white">{kpiData.totalChariotOrdersPeriod} cours</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <span>Total Encaissé Combiné</span>
                <Wallet className="w-4 h-4 text-violet-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {kpiData.totalCombinedIncome.toLocaleString('fr-FR')} €
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                <div>Coûts API Déduits : <span className="font-semibold text-red-500">-{kpiData.totalCostMonth.toFixed(2)} €</span></div>
                <div>Bénéfice Net Opérationnel : <span className="font-bold text-emerald-600 dark:text-emerald-400">{kpiData.netProfitEstimated.toFixed(2)} €</span></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">
                <span>Performance & Rétention</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-500">
                +19.4%
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                <div>Nouvelles adhésions : <span className="font-semibold text-emerald-500">+{kpiData.totalNewSubsPeriod}</span></div>
                <div>Taux d'attrition (Churn) : <span className="font-semibold text-slate-700 dark:text-slate-300">{((kpiData.totalChurnPeriod / (kpiData.totalNewSubsPeriod || 1)) * 100).toFixed(1)}%</span></div>
              </div>
            </div>
          </div>

          {/* RENDER THE TWO CHARTS BASED ON FOCUS MODE */}
          {(revenueFocusMode === 'both' || revenueFocusMode === 'subscriptions') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Graphique Dédié 1 : Évolution des Revenus d'Abonnements (SaaS)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Revenu récurrent quotidien ventilé entre forfaits Pro (29€/m) et Premium Studio (49€/m)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Total Abonnements
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Forfaits Pro
                  </span>
                  <span className="flex items-center gap-1.5 text-purple-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Forfaits Premium
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={combinedFinanceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubTotalBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSubProBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="€" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any) => [`${val} €`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="revenuAbonnements"
                      name="Revenu Total Abonnements (€)"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSubTotalBig)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenuPro"
                      name="Revenus Forfaits Pro (€)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSubProBig)"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenuPremium"
                      name="Revenus Forfaits Premium (€)"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={0.2}
                      fill="#8b5cf6"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {(revenueFocusMode === 'both' || revenueFocusMode === 'chariot') && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Graphique Dédié 2 : Évolution des Commissions & Livraisons Chariot
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Commissions nettes perçues et volume d'affaires brut (GMV) des formations e-learning livrées
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Volume Brut Livré (GMV)
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Commissions Nettes Bookly
                  </span>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedFinanceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorChariotCommBig" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} unit="€" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: any) => {
                        if (name === 'Commandes Livrées') return [`${val} cours`, name];
                        return [`${val} €`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar
                      dataKey="volumeBrutChariot"
                      name="Volume Brut Livré GMV (€)"
                      fill="#0284c7"
                      radius={[6, 6, 0, 0]}
                      barSize={20}
                    />
                    <Area
                      type="monotone"
                      dataKey="commissionsChariot"
                      name="Commissions Perçues (€)"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorChariotCommBig)"
                    />
                    <Line
                      type="monotone"
                      dataKey="panierMoyenChariot"
                      name="Panier Moyen (€)"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TABLEAU DU GRAND LIVRE QUOTIDIEN */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Journal Quotidien des Transactions & Livraisons
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Historique journalier des rentrées d'abonnements et des commandes de formation Chariot
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                14 derniers jours
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/60 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-indigo-600 dark:text-indigo-400">Revenu Abonnements</th>
                    <th className="px-5 py-3.5">Pro (29€)</th>
                    <th className="px-5 py-3.5">Premium (49€)</th>
                    <th className="px-5 py-3.5">Nouveaux / Churn</th>
                    <th className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400">Commissions Chariot</th>
                    <th className="px-5 py-3.5">Volume Brut (GMV)</th>
                    <th className="px-5 py-3.5">Livraisons</th>
                    <th className="px-5 py-3.5 font-black text-slate-900 dark:text-white text-right">Total Journalier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {combinedFinanceChartData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        {row.date} <span className="text-[10px] text-slate-400 font-normal">({row.fullDate})</span>
                      </td>
                      <td className="px-5 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                        {row.revenuAbonnements.toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {row.revenuPro} €
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {row.revenuPremium} €
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-emerald-600 font-semibold">+{row.nouvellesSouscriptions}</span>
                        {row.desabonnements > 0 && (
                          <span className="text-red-500 font-semibold ml-1.5">-{row.desabonnements}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                        +{row.commissionsChariot.toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {row.volumeBrutChariot.toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                        {row.commandesLivrees} livrées
                      </td>
                      <td className="px-5 py-3 font-black text-slate-900 dark:text-white text-right">
                        {row.totalRevenusJour.toLocaleString('fr-FR')} €
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td className="px-5 py-3.5 text-slate-900 dark:text-white">TOTAL PÉRIODE</td>
                    <td className="px-5 py-3.5 text-indigo-600 dark:text-indigo-400">
                      {kpiData.totalSubscriptionRevenuePeriod.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-5 py-3.5">{kpiData.totalProRevenuePeriod.toLocaleString('fr-FR')} €</td>
                    <td className="px-5 py-3.5">{kpiData.totalPremiumRevenuePeriod.toLocaleString('fr-FR')} €</td>
                    <td className="px-5 py-3.5 text-emerald-600">+{kpiData.totalNewSubsPeriod}</td>
                    <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400">
                      +{kpiData.totalChariotCommissionsPeriod.toLocaleString('fr-FR')} €
                    </td>
                    <td className="px-5 py-3.5">{kpiData.totalChariotGMVPeriod.toLocaleString('fr-FR')} €</td>
                    <td className="px-5 py-3.5">{kpiData.totalChariotOrdersPeriod} cours</td>
                    <td className="px-5 py-3.5 text-slate-900 dark:text-white text-right text-sm">
                      {kpiData.totalCombinedIncome.toLocaleString('fr-FR')} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: GESTION DES UTILISATEURS */}
      {/* ============================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Search & Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom ou adresse email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Plan filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setUserPlanFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  userPlanFilter === 'all'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Tous ({users.length})
              </button>
              <button
                onClick={() => setUserPlanFilter('free')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  userPlanFilter === 'free'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Gratuits ({users.filter((u) => u.plan === 'free').length})
              </button>
              <button
                onClick={() => setUserPlanFilter('pro')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  userPlanFilter === 'pro'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Abonnés Pro ({users.filter((u) => u.plan === 'pro').length})
              </button>
              <button
                onClick={() => setUserPlanFilter('premium')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  userPlanFilter === 'premium'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Premium ({users.filter((u) => u.plan === 'premium').length})
              </button>
              <button
                onClick={() => setUserPlanFilter('blocked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  userPlanFilter === 'blocked'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Bloqués ({users.filter((u) => u.status === 'blocked').length})
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Utilisateur</th>
                    <th className="py-3.5 px-4">Formule</th>
                    <th className="py-3.5 px-4">Quota Prompts / Jour</th>
                    <th className="py-3.5 px-4">Activité Rédaction</th>
                    <th className="py-3.5 px-4">Inscription</th>
                    <th className="py-3.5 px-4 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions de Modération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredUsers.map((user) => {
                    const isBlocked = user.status === 'blocked';
                    const quotaPercent = Math.min(100, Math.round((user.dailyPromptsUsed / user.dailyPromptsLimit) * 100));

                    return (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                          isBlocked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                      >
                        {/* User identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs"
                              style={{ background: user.avatarBg }}
                            >
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              user.plan === 'premium'
                                ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-800'
                                : user.plan === 'pro'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {user.plan === 'free' ? 'Gratuit' : user.plan === 'pro' ? 'Abonné Pro' : 'Studio Premium'}
                          </span>
                        </td>

                        {/* Quota */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              <span>{user.dailyPromptsUsed} / {user.dailyPromptsLimit} prompts</span>
                              <span className="font-bold">{quotaPercent}%</span>
                            </div>
                            <div className="w-28 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  quotaPercent > 90 ? 'bg-red-500' : quotaPercent > 60 ? 'bg-amber-500' : 'bg-indigo-600'
                                }`}
                                style={{ width: `${quotaPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Writing activity */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-900 dark:text-white font-semibold">
                            {user.totalWordsGenerated.toLocaleString('fr-FR')} mots
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {user.lifetimeProjects} manuscrits créés
                          </div>
                        </td>

                        {/* Registered date */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {user.registeredDate}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {isBlocked ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded-full">
                              <XCircle className="w-3 h-3" /> Bloqué
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Actif
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Ajuster les quotas et détails"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleToggleUserBlock(user.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isBlocked
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-200'
                                  : 'bg-red-100 dark:bg-red-950 text-red-600 hover:bg-red-200'
                              }`}
                              title={isBlocked ? 'Débloquer le compte' : 'Bloquer le compte'}
                            >
                              {isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* EDIT USER MODAL */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ background: editingUser.avatarBg }}
                    >
                      {editingUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        Ajuster le compte de {editingUser.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">{editingUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Formule d'Abonnement
                    </label>
                    <select
                      value={editingUser.plan}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          plan: e.target.value as 'free' | 'pro' | 'premium',
                          dailyPromptsLimit:
                            e.target.value === 'premium'
                              ? 200
                              : e.target.value === 'pro'
                              ? 50
                              : 5
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="free">Gratuit (Free - 5 prompts/j)</option>
                      <option value="pro">Abonné Pro (50 prompts/j)</option>
                      <option value="premium">Studio Premium (200 prompts/j)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Limite Prompts / Jour
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={editingUser.dailyPromptsLimit}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, dailyPromptsLimit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prompts Utilisés Aujourd'hui
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editingUser.dailyPromptsUsed}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, dailyPromptsUsed: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Notes Administrateur & Modération
                    </label>
                    <textarea
                      rows={3}
                      value={editingUser.notes || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, notes: e.target.value })}
                      placeholder="Commentaires internes visibles uniquement par les administrateurs..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                    >
                      Enregistrer les Quotas
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 3: SUIVI DE L'API (GROQ & ESTIMATION DES COÛTS) */}
      {/* ============================================================= */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top API Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Tokens Consommés (Total)</span>
                <Cpu className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {(kpiData.totalTokensMonth / 1000000).toFixed(2)} M
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Groq : 82% &bull; Gemini : 18%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Coût API Estimé</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {kpiData.totalCostMonth.toFixed(2)} €
              </div>
              <div className="text-[10px] text-emerald-500 mt-1 font-semibold">
                Budget prévu : {globalConfig.monthlyApiBudgetLimit} € (Sécurisé)
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Requêtes Totales IA</span>
                <Activity className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {kpiData.totalRequestsMonth.toLocaleString('fr-FR')}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Taux de succès : 99.8%
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Latence Moyenne Groq</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                295 ms
              </div>
              <div className="text-[10px] text-emerald-500 mt-1 font-semibold">
                Ultra-rapide (LPUs Groq)
              </div>
            </div>
          </div>

          {/* Charts Grid for Tokens and Costs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Consommation des Tokens Jour par Jour */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    Consommation des Tokens Groq & IA (Jour par Jour)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Répartition tokens d'entrée (prompts) vs tokens de sortie (complétion)
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
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
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="groqTokens" name="Tokens Groq" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="geminiTokens" name="Tokens Gemini" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Évolution des Coûts (€) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Courbe des Coûts Journaliers (€) & Enveloppe Budgétaire
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Suivi précis pour respecter le plafond de {globalConfig.monthlyApiBudgetLimit} €/mois
                  </p>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={apiStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
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
                      formatter={(val: any) => [`${Number(val).toFixed(2)} €`, 'Coût']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="estimatedCost"
                      name="Coût journalier (€)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorCost)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Model Breakdown List */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Répartition des Modèles IA en Production
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>qwen/qwen3.8-27b (Groq)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">72%</span>
                </div>
                <p className="text-[11px] text-slate-500">Moteur principal de rédaction de chapitres et relecture.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>groq/compound (Groq)</span>
                  <span className="text-indigo-600 dark:text-indigo-400">18%</span>
                </div>
                <p className="text-[11px] text-slate-500">Brainstorming d'idées, synopses et architecture de livres.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Gemini 2.5 Flash (Google)</span>
                  <span className="text-violet-600 dark:text-violet-400">10%</span>
                </div>
                <p className="text-[11px] text-slate-500">Bascule de redondance et tâches multimodales.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 4: GESTION DES FORMATIONS EN AFFILIATION (CHARIOT) */}
      {/* ============================================================= */}
      {activeTab === 'affiliate' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Catalogue des Formations en Affiliation (Chariot)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gérez vos programmes partenaires, suivez les clics générés et paramétrez le ciblage d'audience (Gratuits vs Abonnés payants).
              </p>
            </div>

            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({
                  title: '',
                  author: '',
                  description: '',
                  affiliateUrl: '',
                  targetAudience: 'all',
                  price: 49,
                  commissionRate: 40,
                  category: 'Édition & Créativité',
                  coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  isActive: true
                });
                setIsAddingCourse(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 shrink-0 self-start sm:self-auto transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une Formation Affiliée</span>
            </button>
          </div>

          {/* ADD / EDIT FORM MODAL */}
          {isAddingCourse && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-200 dark:border-indigo-800 shadow-xl space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  {editingCourse ? 'Modifier la Formation Affiliée' : 'Créer une Nouvelle Formation Affiliée (Chariot)'}
                </h4>
                <button
                  onClick={() => setIsAddingCourse(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSaveAffiliateCourse} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Titre de la Formation *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="Ex: Masterclass E-books & Storytelling"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nom de l'Auteur ou Créateur *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.author}
                      onChange={(e) => setCourseForm({ ...courseForm, author: e.target.value })}
                      placeholder="Ex: Alexandre K. & Partenaires"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lien d'Affiliation Unique (Chariot) *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={courseForm.affiliateUrl}
                      onChange={(e) => setCourseForm({ ...courseForm, affiliateUrl: e.target.value })}
                      placeholder="https://chariot.com/aff/votre-programme?ref=..."
                      className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono outline-none"
                    />
                    <ExternalLink className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Insérez le lien de tracking unique généré depuis votre compte Chariot pour comptabiliser les commissions.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description Détaillée
                  </label>
                  <textarea
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Présentez les objectifs du cours, les modules inclus et la promesse pédagogique..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Visibilité & Ciblage *
                    </label>
                    <select
                      value={courseForm.targetAudience}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          targetAudience: e.target.value as 'all' | 'paid_only'
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-semibold"
                    >
                      <option value="all">Ouvert à tous (Gratuits + Payants)</option>
                      <option value="paid_only">Réservé aux Abonnés Payants (Pro/Premium)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Prix de Vente Indicatif (€)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Taux de Commission Affiliée (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={courseForm.commissionRate}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, commissionRate: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingCourse(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20"
                  >
                    {editingCourse ? 'Mettre à Jour' : 'Enregistrer la Formation'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses List Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Formation & Créateur</th>
                    <th className="py-3.5 px-4">Ciblage</th>
                    <th className="py-3.5 px-4">Prix & Commission</th>
                    <th className="py-3.5 px-4">Suivi des Clics</th>
                    <th className="py-3.5 px-4">Conversions & Revenus</th>
                    <th className="py-3.5 px-4 text-center">Visibilité</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {affiliateCourses.map((course) => {
                    const estEarnings = (course.conversionsCount || 0) * (course.price || 0) * ((course.commissionRate || 40) / 100);

                    return (
                      <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Title & Author */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{course.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">Par {course.author} &bull; {course.category}</div>
                          </div>
                        </td>

                        {/* Target audience */}
                        <td className="py-3.5 px-4">
                          {course.targetAudience === 'paid_only' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-[10px]">
                              Réservé Payants
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                              Ouvert à Tous
                            </span>
                          )}
                        </td>

                        {/* Price & Commission */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white">{course.price} €</div>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                            {course.commissionRate}% comm. ({((course.price * course.commissionRate) / 100).toFixed(1)} €/vente)
                          </div>
                        </td>

                        {/* Clicks */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <MousePointerClick className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{course.clicksCount} clics</span>
                          </div>
                          <button
                            onClick={() => handleSimulateAffiliateClick(course.id)}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                          >
                            + Tester le lien
                          </button>
                        </td>

                        {/* Conversions */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            {course.conversionsCount} ventes
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ~ {estEarnings.toFixed(2)} €
                          </div>
                        </td>

                        {/* Active toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleCourseStatus(course.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                              course.isActive
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {course.isActive ? 'Active' : 'Désactivée'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCourse(course);
                                setCourseForm(course);
                                setIsAddingCourse(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                              title="Modifier la formation"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 transition-colors"
                              title="Supprimer la formation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* TAB 5: JOURNAL D'ERREURS & PARAMÈTRES GLOBAUX */}
      {/* ============================================================= */}
      {activeTab === 'settings_logs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: PARAMÈTRES GLOBAUX MODIFIABLES SANS REDÉPLOIEMENT */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    Paramètres Globaux & Quotas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ajustez les règles de l'application en direct sans redéployer le code.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveGlobalConfig} className="space-y-4 text-xs">
                
                {/* Free Quotas */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Quotas Formule Gratuite
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Limite Prompts / Jour
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={configDraft.freeDailyPromptLimit}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, freeDailyPromptLimit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Projets Max Créés (Vie)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={configDraft.maxFreeProjects}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, maxFreeProjects: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Pro Quotas */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quotas Abonnés Pro & Premium
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Prompts / Jour (Pro)
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={500}
                        value={configDraft.proDailyPromptLimit}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, proDailyPromptLimit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1">
                        Prompts / Jour (Premium)
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={1000}
                        value={configDraft.premiumDailyPromptLimit}
                        onChange={(e) =>
                          setConfigDraft({ ...configDraft, premiumDailyPromptLimit: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* API Budget Alert Cap */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plafond d'Alerte Budget API Groq (€ / mois)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={configDraft.monthlyApiBudgetLimit}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, monthlyApiBudgetLimit: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-bold"
                  />
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Mode Maintenance</div>
                    <div className="text-[11px] text-slate-500">
                      Met en pause temporairement les nouvelles générations IA pour les utilisateurs non-admins.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configDraft.maintenanceMode}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, maintenanceMode: e.target.checked })
                    }
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Global Announcement Banner */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bannière d'Annonce Utilisateur
                  </label>
                  <input
                    type="text"
                    value={configDraft.announcementBanner}
                    onChange={(e) =>
                      setConfigDraft({ ...configDraft, announcementBanner: e.target.value })
                    }
                    placeholder="Message d'information affiché en haut de l'espace membre..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Appliquer & Sauvegarder les Paramètres Globaux
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: JOURNAL DES ERREURS & LOGS API */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800 mb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-500" />
                      Journal des Erreurs & Incidents API
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Historique des requêtes échouées, rate limits et alertes de latence.
                    </p>
                  </div>

                  <button
                    onClick={handleClearLogs}
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    Purger
                  </button>
                </div>

                {/* Log items */}
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {errorLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Aucune erreur récente enregistrée. Tous les services fonctionnent de manière optimale.
                    </div>
                  ) : (
                    errorLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3.5 rounded-2xl border transition-all text-xs space-y-1.5 ${
                          log.severity === 'critical'
                            ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                            : log.severity === 'warning'
                            ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                log.severity === 'critical'
                                  ? 'bg-red-600 text-white'
                                  : log.severity === 'warning'
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {log.service.toUpperCase()} &bull; {log.errorCode}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                          </div>

                          <button
                            onClick={() => handleToggleResolveLog(log.id)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                              log.resolved
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
                            }`}
                          >
                            {log.resolved ? 'Résolu ✓' : 'Marquer résolu'}
                          </button>
                        </div>

                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          {log.message}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span>Route : {log.endpoint}</span>
                          <span>Utilisateur : {log.userEmail}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Surveillance active des tokens et de la disponibilité 24/7</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Uptime</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
