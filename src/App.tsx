import { useState, useEffect } from 'react';
import { 
  Store, 
  Users, 
  HelpCircle, 
  Wallet, 
  Award, 
  PhoneCall, 
  BookOpen, 
  Search, 
  Plus, 
  Minus, 
  Menu, 
  X, 
  Check, 
  ChevronRight, 
  RefreshCw, 
  MessageSquare, 
  Smartphone,
  MapPin,
  Facebook,
  Instagram,
  Vote,
  FileText,
  AlertTriangle,
  Flame,
  Settings,
  ShoppingBag,
  Clock,
  ExternalLink
} from 'lucide-react';

// Custom Type for Points Users
interface PointUser {
  pseudo: string;
  phone: string;
  points: number;
  total_earned: number;
  total_spent: number;
}

// Custom Type for Marketplace Store Card
interface StoreCard {
  id: string;
  name: string;
  tags: string[];
  description: string;
  address: string;
  image: string;
  phone: string;
  facebook?: string;
  instagram?: string;
  color: string;
}

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('accueil');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Expanded details on Afilye and Konkou pages
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({
    promo: false,
    vande: false,
    konkouRecrut: false,
    konkouTrim: false,
  });

  // Points State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<PointUser | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [pointsLoading, setPointsLoading] = useState<boolean>(false);
  
  // Google Sheets custom URL config
  // Default URL is empty or can be a placeholder.
  const defaultSheetsUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-A_h3M66JpXwFwKExrF9CWhr-6c8CqfWhS3zXw8JpD4z0G3U6vpx-P-N_Z7-vDwVcl7eS6R6n95bU/pub?output=csv';
  const [sheetsUrl, setSheetsUrl] = useState<string>(() => {
    return localStorage.getItem('marchenou_sheets_url') || '';
  });
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [sheetsInput, setSheetsInput] = useState<string>(sheetsUrl);

  // Discount calculator
  const [calcPoints, setCalcPoints] = useState<string>('20');
  const [calcResult, setCalcResult] = useState<number>(10);

  // Marketplace filter
  const [marketSearch, setMarketSearch] = useState<string>('');
  const [marketFilterTag, setMarketFilterTag] = useState<string>('tout');

  // Hardcoded default users for immediate out-of-the-box usage
  const defaultUsers: PointUser[] = [
    { pseudo: "Milio", phone: "50956005344", points: 120, total_earned: 150, total_spent: 30 },
    { pseudo: "Alande", phone: "50931871206", points: 450, total_earned: 600, total_spent: 150 },
    { pseudo: "Ketsia", phone: "50912345678", points: 80, total_earned: 80, total_spent: 0 },
    { pseudo: "Admin", phone: "50956610630", points: 1000, total_earned: 1500, total_spent: 500 }
  ];

  // Sync index of sheetsInput when modal opens
  useEffect(() => {
    setSheetsInput(sheetsUrl);
  }, [sheetsUrl]);

  // Handle calculator change
  useEffect(() => {
    const pts = parseFloat(calcPoints);
    if (!isNaN(pts) && pts >= 0) {
      // 20 pwen = 10 HTG, kidonk 1 pwen = 0.5 HTG
      setCalcResult(pts * 0.5);
    } else {
      setCalcResult(0);
    }
  }, [calcPoints]);

  const toggleDetail = (key: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveSheetsUrl = () => {
    localStorage.setItem('marchenou_sheets_url', sheetsInput);
    setSheetsUrl(sheetsInput);
    setShowConfigModal(false);
  };

  const resetSheetsUrl = () => {
    localStorage.removeItem('marchenou_sheets_url');
    setSheetsUrl('');
    setSheetsInput('');
    setShowConfigModal(false);
  };

  // Main search points routine
  const handlePointsSearch = async () => {
    const val = searchQuery.trim().toLowerCase();
    setSearchError('');
    setSearchResult(null);
    setHasSearched(true);

    if (!val) {
      setSearchError('Tanpri antre yon pseudo oswa yon nimewo WhatsApp.');
      return;
    }

    setPointsLoading(true);

    try {
      // If user has defined a custom Google Sheets URL, try fetching it
      if (sheetsUrl && (sheetsUrl.startsWith('http://') || sheetsUrl.startsWith('https://'))) {
        const response = await fetch(sheetsUrl);
        if (!response.ok) {
          throw new Error('Eske URL Google Sheet ou pibliye a kòrèk?');
        }
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          throw new Error('Fay feuy la vid oswa li gen pwoblèm.');
        }

        const users: PointUser[] = [];
        // Header line represents indices: pseudo, phone, points, total_earned, total_spent
        // We can parse dynamically or assume columns order
        for (let i = 1; i < lines.length; i++) {
          const rowText = lines[i].trim();
          if (!rowText) continue;
          
          // Split by comma while respecting potential quotes (simple CSV parser)
          const row = rowText.split(',').map(s => s.replace(/^["']|["']$/g, '').trim());
          if (row.length < 3) continue;

          users.push({
            pseudo: row[0] || '',
            phone: row[1] || '',
            points: parseInt(row[2]) || 0,
            total_earned: parseInt(row[3]) || 0,
            total_spent: parseInt(row[4]) || 0
          });
        }

        // Search in fetched list
        const found = users.find(u => 
          u.pseudo.toLowerCase() === val || 
          u.phone.toLowerCase() === val || 
          u.phone.replace(/[^0-9]/g, '').endsWith(val.replace(/[^0-9]/g, ''))
        );

        if (found) {
          setSearchResult(found);
        } else {
          setSearchError('Nou pa jwenn non oswa nimewo sa a. Kontakte yon admin pou w enskri.');
        }

      } else {
        // Fallback to internal list since no sheets URL is defined yet
        // Search in hardcoded/initial defaults
        const found = defaultUsers.find(u => 
          u.pseudo.toLowerCase() === val || 
          u.phone === val || 
          u.phone.replace(/[^0-9]/g, '').endsWith(val.replace(/[^0-9]/g, ''))
        );

        if (found) {
          setSearchResult(found);
        } else {
          setSearchError('Nou pa jwenn non oswa nimewo sa a nan lis tès la. Tanpri enskri oswa mete URL Google Sheets pwen yo.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setSearchError('Gen yon erè ki rive lè n ap chèche done yo nan Google Sheets. Tcheke si URL la pibliye kòm CSV kòrèk.');
    } finally {
      setPointsLoading(false);
    }
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Mock stores database (all existing descriptions are strictly kept and polished!)
  const stores: StoreCard[] = [
    {
      id: 'didirecord',
      name: '🎧 Didi Record',
      tags: ['Manèt', 'Mikro', 'Bann LED', 'Elektwonik'],
      description: 'Manèt PS3/PS4, mikro san fil, bann LED, sipò TV ak lòt akseswar elektwonik ekselan ak garanti.',
      address: '📍 Livrezon nan zòn Okap & Pòtoprens',
      image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=800',
      phone: '50956005344',
      facebook: 'https://facebook.com/didirecord',
      color: 'from-green-600 to-emerald-900'
    },
    {
      id: 'boulanjetibout',
      name: '🥖 Boulanjri Tibout',
      tags: ['Pen Ayiti', 'Boulanjri'],
      description: 'Pen frè, pen kout, pen long. Fèt tou cho chak maten ak bon jan kalite lokal pou tout fanmi an, livrezon lakay ou tou.',
      address: '📌 3yèm Avni Bolòs #784, Kapital Pòtoprens',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      phone: '50912345678',
      color: 'from-orange-500 to-amber-800'
    },
    {
      id: 'samarafashion',
      name: '👗 Samara Fashion',
      tags: ['Rad', 'Tenis', 'Akseswar'],
      description: 'Rad sipè, tenis danyèl, mont klere, bijou mak – enpòtasyon meyè kalite, pri konpetitif anpil ak nouvo koleksyon.',
      address: '🚚 Livrezon Okap & Pòtoprens (gratis pou 2 atik oswa plis!)',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      phone: '50940384898',
      instagram: 'https://instagram.com/samara_fashion',
      color: 'from-teal-600 to-indigo-900'
    },
    {
      id: 'sephoratech',
      name: '💡 Sephora Tech',
      tags: ['Telefòn', 'Akseswar', 'Kas bluetooth'],
      description: 'Telefòn entèlijan kalite siperyè, akseswar, powerbank, kas bluetooth ak garanti serye pou 3 mwa.',
      address: '✈️ Livrezon toupatou nan peyi a san tèt chaje',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
      phone: '50940761237',
      facebook: 'https://facebook.com/sephoratech',
      color: 'from-red-600 to-rose-900'
    }
  ];

  // Filter stores
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(marketSearch.toLowerCase()) || 
                          store.description.toLowerCase().includes(marketSearch.toLowerCase()) ||
                          store.tags.some(t => t.toLowerCase().includes(marketSearch.toLowerCase()));
    
    if (marketFilterTag === 'tout') return matchesSearch;
    return matchesSearch && store.tags.some(t => t.toLowerCase() === marketFilterTag.toLowerCase());
  });

  const allTags = ['tout', ...Array.from(new Set(stores.flatMap(s => s.tags)))];

  // Barème points definitions list
  const baremeList = [
    { action: "Ganyen konkou rekritman (1ye plas)", points: 200, category: "Konkou" },
    { action: "Ganyen konkou trimestriyèl", points: 400, category: "Konkou" },
    { action: "Rive finalis nan yon konkou", points: 50, category: "Konkou" },
    { action: "Vote nan yon tiraj valid", points: 2, category: "Patisipasyon" },
    { action: "Rekrite 60+ moun anmenmtan", points: 50, category: "Patisipasyon" },
    { action: "Parennen yon vandè BASIC", points: 20, category: "Parennaj" },
    { action: "Parennen yon vandè PRO", points: 40, category: "Parennaj" },
    { action: "Parennen yon vandè ENTREPRISE", points: 60, category: "Parennaj" },
    { action: "Parennen yon vandè PREMIUM", points: 80, category: "Parennaj" },
    { action: "Parennen yon vandè VIP", points: 100, category: "Parennaj" },
    { action: "Parennen yon vandè VVIP", points: 150, category: "Parennaj" },
    { action: "Parennen yon vandè BOUNDLESS", points: 250, category: "Parennaj" },
    { action: "Parennen yon afilye (Pwomosyonèl, elatriye)", points: 50, category: "Parennaj" },
    { action: "Envite yon nouvo manm aktif (ki rete 30 jou)", points: 10, category: "Patisipasyon" },
    { action: "Peye abònman anvan tèm (Pou 3 mwa)", points: 15, category: "Abònman" },
    { action: "Peye abònman anvan tèm (Pou 6 mwa)", points: 35, category: "Abònman" },
    { action: "Peye abònman anvan tèm (Pou 9 mwa)", points: 60, category: "Abònman" },
    { action: "Peye abònman anvan tèm (Pou 12 mwa)", points: 100, category: "Abònman" },
    { action: "Rete abone chak mwa (BASIC)", points: 50, category: "Abònman" },
    { action: "Rete abone chak mwa (PRO)", points: 100, category: "Abònman" },
    { action: "Rete abone chak mwa (ENTREPRISE)", points: 150, category: "Abònman" },
    { action: "Rete abone chak mwa (PREMIUM)", points: 250, category: "Abònman" },
    { action: "Rete abone chak mwa (VIP)", points: 400, category: "Abònman" },
    { action: "Rete abone chak mwa (VVIP)", points: 600, category: "Abònman" },
    { action: "Rete abone chak mwa (BOUNDLESS)", points: 1000, category: "Abònman" },
    { action: "Ede yon nouvo manm (bay yon repons ki trè itil)", points: 5, category: "Kominote" },
    { action: "Pibliye yon kontni bon jan kalite (ki valide)", points: 3, category: "Kominote" },
    { action: "Siyale yon kontni ki pa kòrèk (ki gen valè)", points: 2, category: "Kominote" },
    { action: "Vin tounen yon anbasadè zòn", points: 150, category: "Kominote" },
  ];

  return (
    <div id="root-container" className="flex flex-col min-height-screen font-sans">
      
      {/* ================= NAVBAR ================= */}
      <nav id="nav-bar" className="sticky top-0 z-50 bg-[#0a1510]/85 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div id="logo-block" className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigateTo('accueil')}>
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8c42] to-[#ea580c] shadow-lg shadow-orange-500/10">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-2xl tracking-wide leading-none">
                MARCHE<span className="text-[#ff8c42]">NOU</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">BIZNIS AYISYEN</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div id="desktop-links" className="hidden lg:flex items-center gap-1">
            <button 
              id="lnk-akey"
              onClick={() => navigateTo('accueil')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'accueil' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Akèy
            </button>
            <button 
              id="lnk-afilye"
              onClick={() => navigateTo('afilye')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'afilye' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Afilye
            </button>
            <button 
              id="lnk-marketplace"
              onClick={() => navigateTo('marketplace')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'marketplace' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Marketplace
            </button>
            <button 
              id="lnk-konkou"
              onClick={() => navigateTo('konkou')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'konkou' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Konkou
            </button>
            <button 
              id="lnk-portefeuille"
              onClick={() => navigateTo('portefeuille')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${currentPage === 'portefeuille' ? 'bg-emerald-500/20 text-emerald-400' : 'text-emerald-300 hover:text-emerald-450 hover:bg-emerald-500/5'}`}
            >
              <Wallet className="h-4 w-4" />
              Pwen
            </button>
            <button 
              id="lnk-bareme"
              onClick={() => navigateTo('bareme')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'bareme' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Barèm
            </button>
            <button 
              id="lnk-kontak"
              onClick={() => navigateTo('kontak')} 
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${currentPage === 'kontak' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300 hover:text-[#ff8c42] hover:bg-white/5'}`}
            >
              Kontak
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sheets Settings Button */}
            <button 
              id="btn-settings"
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
              title="Konfigirasyon Google Sheets"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Mobile Nav Button */}
            <button 
              id="btn-mobile-menu"
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Links */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-2 bg-[#0c1a14]/95 p-4 rounded-xl absolute left-4 right-4 top-16 shadow-2xl">
            <button 
              id="m-lnk-akey"
              onClick={() => navigateTo('accueil')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'accueil' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Akèy
            </button>
            <button 
              id="m-lnk-afilye"
              onClick={() => navigateTo('afilye')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'afilye' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Afilye
            </button>
            <button 
              id="m-lnk-marketplace"
              onClick={() => navigateTo('marketplace')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'marketplace' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Marketplace
            </button>
            <button 
              id="m-lnk-konkou"
              onClick={() => navigateTo('konkou')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'konkou' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Konkou
            </button>
            <button 
              id="m-lnk-portefeuille"
              onClick={() => navigateTo('portefeuille')} 
              className={`px-4 py-2.5 rounded-xl text-left font-bold text-sm bg-emerald-500/10 text-emerald-300 flex items-center gap-1.5`}
            >
              <Wallet className="h-4 w-4" />
              Pwen MARCHENOU
            </button>
            <button 
              id="m-lnk-bareme"
              onClick={() => navigateTo('bareme')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'bareme' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Barèm (Kijan pou gen pwen)
            </button>
            <button 
              id="m-lnk-kontak"
              onClick={() => navigateTo('kontak')} 
              className={`px-4 py-2.5 rounded-xl text-left font-semibold text-sm transition-all ${currentPage === 'kontak' ? 'bg-[#ff8c42]/20 text-[#ff8c42]' : 'text-neutral-300'}`}
            >
              Kontak
            </button>
          </div>
        )}
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main id="main-content" className="flex-1 py-12 px-4 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300">
        
        {/* ================= PAGE ACCUEIL ================= */}
        {currentPage === 'accueil' && (
          <div id="page-accueil" className="space-y-16 animate-fadeIn">
            {/* Hero Banner Section */}
            <div id="hero" className="relative glass-panel rounded-3xl overflow-hidden p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1e5a3a]/15 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="flex-1 space-y-6 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  🇭🇹 Kominote Biznis lokal
                </div>
                
                <h1 className="font-display text-5xl lg:text-7xl leading-none">
                  MARCHE<span className="text-[#ff8c42]">NOU</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-neutral-300 leading-relaxed max-w-xl">
                  “Vann, achte – sa nou pa genyen pa egziste.”
                </p>
                <p className="text-neutral-400 text-sm max-w-xl">
                  Platfòm kominotè ak komèsyal ayisyen ki pi solid la, kote vandè, achtè, sèvis, ak bèl opòtinite konekte chak jou atravè WhatsApp ak rezo nou yo.
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
                  <a 
                    href="https://chat.whatsapp.com/GCsXKgiEhZCKciOQv0UXXT" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 bg-[#ff8c42] hover:bg-[#ea580c] text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Antre nan Gwoup Gwopo a
                  </a>
                  <button 
                    onClick={() => navigateTo('afilye')} 
                    className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 active:bg-white/12 border border-white/10 px-6 py-3 rounded-full font-bold transition-all hover:-translate-y-0.5"
                  >
                    Vin yon Afilye
                  </button>
                </div>
              </div>

              {/* Handcrafted Generated Banner */}
              <div className="flex-1 w-full max-w-md lg:max-w-none z-10">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#091510]">
                  <img 
                    src="/src/assets/images/marchenou_banner_1779419464254.png" 
                    alt="MARCHENOU Byenveni Banner" 
                    className="w-full h-auto object-cover transform hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-16">
                    <div className="flex items-center gap-3">
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <p className="text-sm text-emerald-300 font-semibold tracking-wide uppercase">Kominote a ap grandi chak jou</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Core Stats Grid */}
            <div id="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#1e5a3a]/40 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Kwasans Kominote</h3>
                <p className="text-neutral-400 text-sm">5,000+ manm serye, 800+ pwodwi divès, ak plis pase 300+ sèvis aktif ap pibliye chak jou.</p>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#ff8c42]/40 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#ff8c42] mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Opòtinite Ekonomik</h3>
                <p className="text-neutral-400 text-sm">Afilye nou yo touche jiska 30% komisyon regilye. Gen plan abònman ki adapte ak tout ti biznis.</p>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
                <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-110 transition-transform">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Solidarite Lokal</h3>
                <p className="text-neutral-400 text-sm">Yon espas solidè kote tout vandè ak kliyan ede youn lòt grandi, pwoteje kont spam oswa fo kont.</p>
              </div>
            </div>

            {/* Live Numbers Section */}
            <div id="numbers" className="space-y-8">
              <div className="text-center space-y-2">
                <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">📊 MARCHENOU AN CHIF</div>
                <h2 className="font-display text-4xl">Kominote solid k ap grandi pi plis toujou</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <a 
                  href="https://chat.whatsapp.com/GCsXKgiEhZCKciOQv0UXXT" 
                  target="_blank" 
                  rel="noreferrer"
                  className="glass-panel hover:glass-panel-accent hover:border-[#ff8c42]/30 p-8 rounded-3xl text-center space-y-2 block transition-all hover:-translate-y-1"
                >
                  <span className="font-display text-5xl text-[#ff8c42]">5K+</span>
                  <h4 className="font-bold text-lg">Manm nan Gwoup Prensipal</h4>
                  <p className="text-xs text-neutral-400">Klike la a pou w antre ranfòse komak yo sou WhatsApp.</p>
                </a>

                <a 
                  href="https://chat.whatsapp.com/EpP7nTIgqGIBlytCEuvpLT" 
                  target="_blank" 
                  rel="noreferrer"
                  className="glass-panel hover:glass-panel-accent hover:border-[#ff8c42]/30 p-8 rounded-3xl text-center space-y-2 block transition-all hover:-translate-y-1"
                >
                  <span className="font-display text-5xl text-[#ff8c42]">800+</span>
                  <h4 className="font-bold text-lg">Pwodwi & Sèvis Pibliye</h4>
                  <p className="text-xs text-neutral-400">Gwo varyete atik ak machandiz ki ankouraje ekonomi lokal la.</p>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* ================= PAGE AFILYE ================= */}
        {currentPage === 'afilye' && (
          <div id="page-afilye" className="space-y-12 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">🏆 AFILYASYON MARCHENOU</div>
              <h2 className="font-display text-4xl">Chwazi wòl pa w la epi koumanse fè lajan</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto">Chak manm gen yon plas espesyal ki ba yo posiblite vin yon gwo poto nan ekonomi MARCHENOU.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Afilye Pwomosyonèl */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-[#ff8c42]/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#ff8c42]">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 text-[#ff8c42] text-xs font-bold uppercase">Komisyon 30%</span>
                </div>
                <h3 className="text-2xl font-bold">🔥 Afilye Pwomosyonèl</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Wòl ou se rekrite nouvo vandè pou enskri sou platfòm lan. Ou jwenn 30% komisyon dirèk sou chak frè abònman yo peye!
                </p>
                
                {/* Accordion detail */}
                <button 
                  onClick={() => toggleDetail('promo')} 
                  className="text-sm font-semibold text-[#ff8c42] hover:underline flex items-center gap-1 focus:outline-none"
                >
                  {expandedDetails.promo ? 'Kache detay' : 'Plis detay sou sa'}
                  <ChevronRight className={`h-4 w-4 transform transition-transform ${expandedDetails.promo ? 'rotate-90' : ''}`} />
                </button>

                {expandedDetails.promo && (
                  <div className="pt-4 border-t border-white/5 space-y-2 bg-[#0c1a14]/60 p-4 rounded-xl text-neutral-300 text-sm">
                    <p className="font-bold text-white mb-2">Kondisyon ak Avantaj:</p>
                    <ul className="space-y-1.5 list-none">
                      <li className="flex items-center gap-2 text-emerald-400"><Check className="h-3.5 w-3.5" /> Ganyen konkou rekritman regilye</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Gen 18 an oswa plis epi aktif nan gwoup yo</li>
                      <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Kreye pwòp gwoup WhatsApp MARCHENOU-AFI00X pa w</li>
                      <li className="flex items-center gap-2 text-[#ff8c42] font-semibold mt-2">
                        💸 Egzanp Kalkil: Yon moun peye plan BASIC (250 HTG) → komisyon pa w se 75 HTG chak mwa. Peye BOUNDLESS (25 000 HTG) → komisyon w se 7,500 HTG!
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Afilye Vandè */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Store className="h-6 w-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">Plan Flex</span>
                </div>
                <h3 className="text-2xl font-bold">🛍️ Afilye Vandè</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Vann pwodwi ak sèvis pa w bay gwo kominote a. Nou genyen plan depi BASIC (250 HTG) rive BOUNDLESS (25,000 HTG).
                </p>

                <button 
                  onClick={() => toggleDetail('vande')} 
                  className="text-sm font-semibold text-emerald-400 hover:underline flex items-center gap-1 focus:outline-none"
                >
                  {expandedDetails.vande ? 'Kache detay' : 'Plis detay sou sa'}
                  <ChevronRight className={`h-4 w-4 transform transition-transform ${expandedDetails.vande ? 'rotate-90' : ''}`} />
                </button>

                {expandedDetails.vande && (
                  <div className="pt-4 border-t border-white/5 space-y-2 bg-[#0c1a14]/60 p-4 rounded-xl text-neutral-300 text-sm">
                    <p className="font-bold text-white mb-2">Gwo Pwomosyon pou Vandè:</p>
                    <p className="text-xs leading-relaxed">
                      Siyen non ofisyèl pou 6 mwa → jwenn avantaj ofisyèl: 2 piblikasyon gratis chak mwa pandan premye 3 mwa yo, plis yon rediksyon -1% pandan 6 mwa.
                    </p>
                    <p className="text-xs font-semibold text-emerald-300 mt-2">
                       Double Wòl: Si w se afilye pwomosyonèl tou, ou jwenn -10% sou pwòp plan vandè pa w, oswa -5% si w gen lòt kalite wòl.
                    </p>
                  </div>
                )}
              </div>

              {/* Afilye Patnè */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-blue-500/30 transition-all">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">🤝 Afilye Patnè</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Wòl ou se vann pwodwi lòt vandè nan rezo a epi touche gwo komisyon. Jwenn jiska 8 piblikasyon gratis pa mwa. Komisyon yo negosyab ant 10% ak 20% sou chak vant.
                </p>
              </div>

              {/* Afilye Sèvis */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-purple-500/30 transition-all">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">🧰 Afilye Sèvis</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Ofri konpetans ou oswa sèvis pwofesyonèl ou. Ou jwenn 3 premye piblikasyon yo nèt ale gratis! Apre sa, frè yo varye ant 500 HTG ak 25,000 HTG. Double wòl ba w -50% rabè!
                </p>
              </div>

            </div>

            <div className="text-center pt-4">
              <a 
                href="https://chat.whatsapp.com/GCsXKgiEhZCKciOQv0UXXT" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-emerald-500 hover:bg-emerald-600 font-bold px-8 py-3.5 rounded-full inline-flex items-center gap-2 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/15 transition-all text-white"
              >
                Vin yon Afilye — Antre nan Gwoup la
              </a>
            </div>
          </div>
        )}

        {/* ================= PAGE MARKETPLACE ================= */}
        {currentPage === 'marketplace' && (
          <div id="page-marketplace" className="space-y-10 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">🛒 MARKETPLACE MARCHENOU</div>
              <h2 className="font-display text-4xl">Vizite boutik patnè ofisyèl yo</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto">Klike sou bouton yo pou w kontakte vandè a dwat sou WhatsApp oswa vizite paj yo. Pwodwi yo klase e yo gen bon kalite garanti!</p>
            </div>

            {/* Filter and Search controls */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Chèche yon pwodwi, boutik oswa tag..." 
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="w-full bg-[#0a1611] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#ff8c42]/80 font-medium transition-all"
                />
                {marketSearch && (
                  <button onClick={() => setMarketSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white">Klè</button>
                )}
              </div>

              {/* Tags Filters */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setMarketFilterTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                      marketFilterTag.toLowerCase() === tag.toLowerCase() 
                        ? 'bg-[#ff8c42] text-white shadow-md shadow-orange-500/10' 
                        : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tag === 'tout' ? 'Tout Pwodwi' : tag}
                  </button>
                ))}
              </div>

            </div>

            {/* Grid of Stores */}
            {filteredStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredStores.map((store) => (
                  <div key={store.id} className="glass-panel rounded-3xl overflow-hidden flex flex-col group hover:border-[#ff8c42]/40 transition-all duration-300">
                    
                    {/* Header Image */}
                    <div className="h-48 overflow-hidden relative">
                      <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 duration-500" />
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-6 flex flex-col justify-end`}>
                        <h3 className="text-2xl font-bold tracking-tight text-white mb-1">{store.name}</h3>
                        <p className="text-xs text-[#ff8c42] flex items-center gap-1 font-semibold">
                          <MapPin className="h-3.5 w-3.5" />
                          {store.address}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="px-6 pt-5 flex flex-wrap gap-1.5">
                      {store.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-[#ff8c42]/10 text-orange-300 border border-[#ff8c42]/18">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Body */}
                    <div className="p-6 pt-4 flex-1 flex flex-col justify-between space-y-6">
                      
                      {/* Description - Made extremely readable, formatted with light contrast as requested */}
                      <div className="bg-white px-4 py-3.5 rounded-xl border-l-4 border-[#ff8c42] shadow-sm">
                        <p className="text-md font-bold text-slate-900 leading-relaxed font-sans">{store.description}</p>
                      </div>

                      {/* Contact Social buttons */}
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        <a 
                          href={`https://wa.me/${store.phone}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/10"
                        >
                          <MessageSquare className="h-4 w-4" />
                          WhatsApp
                        </a>

                        {store.facebook && (
                          <a 
                            href={store.facebook} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
                          >
                            <Facebook className="h-4 w-4" />
                            Facebook
                          </a>
                        )}

                        {store.instagram && (
                          <a 
                            href={store.instagram} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-day-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all"
                          >
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </a>
                        )}
                      </div>

                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-xl mx-auto">
                <AlertTriangle className="h-10 w-10 text-orange-400 mx-auto" />
                <h4 className="text-xl font-bold">Nou pa jwenn boutik sa a</h4>
                <p className="text-neutral-400 text-sm">Eseye chanje mo kle w yo oswa tcheke tag ou chwazi yo pou wè lòt bèl prodwi.</p>
                <button onClick={() => { setMarketSearch(''); setMarketFilterTag('tout'); }} className="text-[#ff8c42] hover:underline font-bold text-sm">Repati a zero</button>
              </div>
            )}

            {/* Admin Add Boutique Alert */}
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-[#ff8c42] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-md text-white">🔹 Èske ou se yon vandè aktif nan gwoup yo?</h4>
                <p className="text-xs text-neutral-400">Ou ka fè boutik pa w parèt isit la sou sit la pou plizyè milye manm ka jwenn ou fasilman.</p>
              </div>
              <a 
                href="https://wa.me/50956610630" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#ff8c42] hover:bg-[#ea580c] font-bold px-6 py-2.5 rounded-lg text-xs tracking-wider uppercase inline-flex items-center gap-1.5 transition-all"
              >
                <PhoneCall className="h-4 w-4" />
                Kontakte Admin yo
              </a>
            </div>

          </div>
        )}

        {/* ================= PAGE KONKOU ================= */}
        {currentPage === 'konkou' && (
          <div id="page-konkou" className="space-y-12 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">🏆 KONKOU MARCHENOU</div>
              <h2 className="font-display text-4xl">Gwo konkou ak prim enteresan chak trimès</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto">Patisipasyon aktif ak kominikasyon serye louvri pòt pou w genyen bèl prim lajan kach oswa lòt kado enteresan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Konkou Rekritman */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-[#ff8c42]/30 transition-all">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#ff8c42]">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">📅 Konkou rekritman (Chak mwa)</h3>
                <p className="text-neutral-400 text-sm">
                  Chak mwa pwofesyonèl, nou bay sipò epi chwazi nouvo Afilye Pwomosyonèl. Moun ki rekrite plis manm serye jwenn gwo prim ak estati ofisyèl!
                </p>
                <button 
                  onClick={() => toggleDetail('konkouRecrut')} 
                  className="text-xs font-bold text-[#ff8c42] hover:underline flex items-center gap-1"
                >
                  {expandedDetails.konkouRecrut ? 'Kache detay etap yo' : 'Etap ak kijan li fèt'}
                  <ChevronRight className={`h-3 w-3 transform transition-transform ${expandedDetails.konkouRecrut ? 'rotate-90' : ''}`} />
                </button>

                {expandedDetails.konkouRecrut && (
                  <ul className="pt-3 border-t border-white/5 space-y-2 text-xs text-neutral-300 list-disc list-inside">
                    <li>Se yon peryòd de 48 rive 72 èdtan premye manm yo genyen pou fè rekritman serye.</li>
                    <li>Vòt ak kontwòl yo fèt an dirèk sou chanèl edikatif ofisyèl MARCHENOU WhatsApp la.</li>
                  </ul>
                )}
              </div>

              {/* Konkou Trimestriyèl */}
              <div className="glass-panel rounded-3xl p-8 space-y-4 hover:border-emerald-500/30 transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">🏅 Konkou gwo trimès la</h3>
                <p className="text-neutral-400 text-sm">
                  Gwo konkou final ak 3 gwo manm finalis. Tout tiraj yo fèt an dirèk devan tout moun, san paspouki, pou montre vrè transparans nou genyen.
                </p>
                <button 
                  onClick={() => toggleDetail('konkouTrim')} 
                  className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {expandedDetails.konkouTrim ? 'Kache detay regleman' : 'Regleman ak kondisyon'}
                  <ChevronRight className={`h-3 w-3 transform transition-transform ${expandedDetails.konkouTrim ? 'rotate-90' : ''}`} />
                </button>

                {expandedDetails.konkouTrim && (
                  <ul className="pt-3 border-t border-white/5 space-y-2 text-xs text-neutral-300 list-disc list-inside">
                    <li>3 finalis yo diskite an dirèk sou rezo sosyal nou yo (Facebook oswa gwoup prensipal).</li>
                    <li>Champion an dwe remèt 30% nan gwo prim lan bay manm ki te vote pou li yo nan yon tiraj espesyal!</li>
                    <li>💰 Egzanp: Si w genyen 10 000 HTG → ou remèt 3 000 HTG bay votan pa w yo.</li>
                    <li>🎡 Roulette la transparan nèt ale sou entènèt.</li>
                    <li>📅 Dat limit pou pwochen tiraj la: <span className="font-bold text-white">03 Jen 2026</span>.</li>
                  </ul>
                )}
              </div>

            </div>

            <div className="text-center">
              <a 
                href="https://pollie.app/wclor" 
                target="_blank" 
                rel="noreferrer" 
                className="bg-[#ff8c42] hover:bg-[#ea580c] font-bold px-8 py-3 rounded-full inline-flex items-center gap-2"
              >
                <Vote className="h-5 w-5" />
                Pote Vòt Pa W sou Pollie
              </a>
            </div>
          </div>
        )}

        {/* ================= NEW PAGE: PORTEFEUILLE (PWEN) ================= */}
        {currentPage === 'portefeuille' && (
          <div id="page-portefeuille" className="space-y-12 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5Packed">
                <Wallet className="h-4 w-4" />
                PORTEFÈY PWEN FIDELITE
              </div>
              <h2 className="font-display text-4xl">Sistèm Pwen MARCHENOU</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto">Tcheke pwen ou genyen, kalkile rabè w ka jwenn sou abònman yo, epi kontakte admin pou voye prèv WhatsApp w yo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Search Core Block */}
              <div className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-6 relative">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Chèche pwen ou genyen</h3>
                  <p className="text-xs text-neutral-400">Mete pseudo WhatsApp ou oswa nimewo telefòn ou (egz: Milio oswa 50956005344) pou dekouvri solde ou.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
                    <input 
                      type="text" 
                      placeholder="Mete pseudo oswa nimewo w la a..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handlePointsSearch();
                      }}
                      className="w-full bg-[#0a1611] border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-neutral-500 focus:outline-none focus:border-[#ff8c42] font-semibold text-lg"
                    />
                  </div>
                  <button 
                    onClick={handlePointsSearch}
                    disabled={pointsLoading}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 text-white font-bold px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-lg shadow-emerald-500/10 shrink-0"
                  >
                    {pointsLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                    Chèche Pwen yo
                  </button>
                </div>

                {/* Display Sheets Status info inside */}
                <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Sistèm statik ak Google Sheets
                  </span>
                  <button 
                    onClick={() => setShowConfigModal(true)} 
                    className="text-[#ff8c42] hover:underline font-bold flex items-center gap-1 focus:outline-none"
                  >
                    {sheetsUrl ? '✅ Google Sheets Konekte' : '⚙️ Sèvi ak Tès (Chanje Sheets)'}
                  </button>
                </div>

                {/* Search Result display block */}
                {hasSearched && (
                  <div className="pt-4 border-t border-white/5 animate-fadeIn">
                    {searchResult ? (
                      <div className="bg-gradient-to-br from-[#1e5a3a]/40 to-[#07110d] border border-emerald-500/30 p-6 rounded-2xl space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                          <div>
                            <span className="text-[10px] text-emerald-300 font-bold uppercase block mb-1">Manm MARCHENOU</span>
                            <h4 className="text-2xl font-bold text-white flex items-center gap-1.5">
                              {searchResult.pseudo}
                            </h4>
                            <p className="text-xs text-neutral-400 font-mono">📱 Nimewo: {searchResult.phone}</p>
                          </div>
                          <div className="bg-[#ff8c42]/10 border border-[#ff8c42]/30 px-4 py-1.5 rounded-xl">
                            <span className="text-[10px] text-[#ff8c42] font-bold block uppercase text-center">Solde Aktif</span>
                            <span className="font-mono text-xl font-bold text-[#ff8c42]">{searchResult.points} pwen</span>
                          </div>
                        </div>

                        {/* Point details breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 p-4 rounded-xl space-y-1 text-center sm:text-left">
                            <span className="text-[10px] text-neutral-400 block uppercase font-bold">Total Touche (Earned)</span>
                            <span className="text-xl font-bold text-emerald-300 font-mono">{searchResult.total_earned} <span className="text-xs font-sans text-neutral-400">pts</span></span>
                          </div>
                          <div className="bg-white/5 p-4 rounded-xl space-y-1 text-center sm:text-left">
                            <span className="text-[10px] text-neutral-400 block uppercase font-bold">Total Depanse (Spent)</span>
                            <span className="text-xl font-bold text-[#ff8c42] font-mono">{searchResult.total_spent} <span className="text-xs font-sans text-neutral-400">pts</span></span>
                          </div>
                        </div>

                        {/* Equivalence and Calculator Shortcut */}
                        <div className="p-3 bg-white/5 rounded-xl flex flex-wrap justify-between items-center text-xs text-neutral-300 gap-2">
                          <span>💰 Konvèsyon rabè sou abònman:</span>
                          <span className="font-bold text-emerald-300">
                            {searchResult.points} pts = {(searchResult.points * 0.5)} HTG Rabè
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center space-y-2">
                        <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
                        <h4 className="text-md font-bold text-red-200">Nou pa jwenn anyen</h4>
                        <p className="text-sm text-neutral-400 max-w-md mx-auto">
                          {searchError || 'Lis la pa genyen non oswa nimewo sa a. Souple tcheke lòt non oswa kontakte admin yo.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Equivalence and Calculator Box */}
              <div className="glass-panel p-8 rounded-3xl space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold flex items-center gap-1.5 text-[#ff8c42]">
                    <Clock className="h-5 w-5" />
                    Balanse Pwen w pou reduction
                  </h3>
                  <p className="text-xs text-neutral-400">Ekivalans: <span className="font-bold text-white">20 pwen = 10 HTG</span> rabè sou abònman w.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
                  <label className="text-xs font-bold text-neutral-300 block">Antre kanti pwen w pou kalkile:</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      value={calcPoints}
                      onChange={(e) => setCalcPoints(e.target.value)}
                      placeholder="Egz: 100"
                      className="bg-[#0a1611] border border-white/10 rounded-xl px-3 py-2 w-full text-white font-mono text-center font-bold text-lg"
                    />
                    <ChevronRight className="text-neutral-500 h-5 w-5 shrink-0" />
                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2 w-full text-center shrink-0">
                      <span className="font-mono font-bold text-[#ff8c42] text-lg">{calcResult}</span>
                      <span className="text-[10px] block text-emerald-300 font-bold">HTG Rabè</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <button 
                    onClick={() => navigateTo('bareme')}
                    className="w-full bg-[#ff8c42]/10 text-[#ff8c42] border border-[#ff8c42]/20 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider hover:bg-[#ff8c42]/18 transition-all flex items-center justify-center gap-1"
                  >
                    <BookOpen className="h-4 w-4" />
                    Wè rEg jwèt ak Barèm yo
                  </button>
                  
                  <a 
                    href="https://wa.me/50956610630" 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Voye prèv WhatsApp bay Admin
                  </a>
                </div>
              </div>

            </div>

            {/* Validation Process Walkthrough */}
            <div className="glass-panel rounded-3xl p-8 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Kouman pwosesis sa a travay pou manm yo?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center text-sm">1</div>
                  <h4 className="font-bold text-md text-white">Fè yon aksyon valid</h4>
                  <p className="text-xs text-neutral-400">Peye abònman anvan tèm, parennen nouvo vandè, ede manm yo taye, oswa vote.</p>
                </div>

                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#ff8c42] text-white font-extrabold flex items-center justify-center text-sm">2</div>
                  <h4 className="font-bold text-md text-white">Voye prèv bay admin</h4>
                  <p className="text-xs text-neutral-400">Pran yon kapti ekran (screenshot) prèv tranzaksyon oswa vote epi ekri admin sou WhatsApp.</p>
                </div>

                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 text-black font-extrabold flex items-center justify-center text-sm">3</div>
                  <h4 className="font-bold text-md text-white">Admin valide done yo</h4>
                  <p className="text-xs text-neutral-400">Admin yo verifye screenshot la epi ogmante pwen ou yo dirèkteman sou Google Sheets la.</p>
                </div>

                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-full bg-[#ff8c42] text-white font-extrabold flex items-center justify-center text-sm">4</div>
                  <h4 className="font-bold text-md text-white">De kout je solde w parèt</h4>
                  <p className="text-xs text-neutral-400">Ouvri sit MARCHENOU, chèche pseudo w epi wè nouvo solde pwen pa w la imedyatman!</p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ================= PAGE BAREME ================= */}
        {currentPage === 'bareme' && (
          <div id="page-bareme" className="space-y-10 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">🏆 BARÈM MARCHENOU</div>
              <h2 className="font-display text-4xl">Kijan pou w rasanble plis pwen?</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto font-sans">Tablo sa a genyen lis tout aksyon ki ka ba ou pwen ansanm ak kantite pwen pou chak. Ekivalans: 20 pwen = 10 HTG pou tout manm!</p>
            </div>

            {/* Barème table with simple categories filter */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="bg-[#1e5a3a] text-white font-bold text-sm">
                      <th className="p-4 pl-6">Lis Aksyon Valid yo</th>
                      <th className="p-4 text-center">Kategori</th>
                      <th className="p-4 pr-6 text-right">Kantite Pwen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/20 text-sm">
                    {baremeList.map((item, index) => (
                      <tr 
                        key={index} 
                        className="hover:bg-white/5 transition-all"
                      >
                        <td className="p-4 pl-6 font-semibold text-neutral-100">{item.action}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.category === 'Konkou' ? 'bg-orange-500/10 text-[#ff8c42]' :
                            item.category === 'Parennaj' ? 'bg-emerald-500/10 text-emerald-450' :
                            item.category === 'Abònman' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-neutral-500/15 text-neutral-300'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right font-bold text-emerald-400 font-mono">+{item.points} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center pt-2">
              <button 
                onClick={() => navigateTo('portefeuille')}
                className="bg-emerald-500 hover:bg-emerald-600 font-bold px-8 py-3 rounded-full text-white inline-flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
              >
                <Wallet className="h-5 w-5" />
                Ouvri Portefèy Pwen Pa Mwen
              </button>
            </div>

          </div>
        )}

        {/* ================= PAGE KONTAK ================= */}
        {currentPage === 'kontak' && (
          <div id="page-kontak" className="space-y-12 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-[#ff8c42] text-xs font-bold uppercase tracking-widest">📞 KONTAK JE SÈVAY</div>
              <h2 className="font-display text-4xl">Fè koneksyon ak ekip MARCHENOU la</h2>
              <p className="text-neutral-400 text-sm max-w-2xl mx-auto">Tout gwoup ofisyèl, rezo sosyal ak nimewo telefòn administratif yo pou sipòte w rapid nan tout sa w ap antreprann.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Official Groups */}
              <div className="glass-panel rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                  <MessageSquare className="h-5 w-5 text-[#ff8c42]" />
                  Gwo Gwoup WhatsApp Ofisyèl yo
                </h3>
                <div className="space-y-3.5">
                  <a 
                    href="https://chat.whatsapp.com/GCsXKgiEhZCKciOQv0UXXT" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex justify-between items-center bg-white/5 hover:glass-panel-accent border border-white/5 hover:border-[#ff8c42]/30 px-5 py-4 rounded-2xl group transition-all"
                  >
                    <div>
                      <span className="font-bold text-neutral-100 group-hover:text-[#ff8c42] transition-colors">🏛️ MARCHENOU-OFC</span>
                      <p className="text-xs text-neutral-400 mt-1">Gwo gwoup prensipal pou tout manm yo</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-[#ff8c42]" />
                  </a>

                  <a 
                    href="https://chat.whatsapp.com/EpP7nTIgqGIBlytCEuvpLT" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex justify-between items-center bg-white/5 hover:glass-panel-accent border border-white/5 hover:border-[#ff8c42]/30 px-5 py-4 rounded-2xl group transition-all"
                  >
                    <div>
                      <span className="font-bold text-neutral-100 group-hover:text-[#ff8c42] transition-colors">🇭🇹 MARCHENOU_HAITI509</span>
                      <p className="text-xs text-neutral-400 mt-1">Zòn nasyonal pou opòtinite ak pataj rapid</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-[#ff8c42]" />
                  </a>

                  <a 
                    href="https://chat.whatsapp.com/FZqU5LOLhosA6qkLccIKS6" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex justify-between items-center bg-white/5 hover:glass-panel-accent border border-white/5 hover:border-[#ff8c42]/30 px-5 py-4 rounded-2xl group transition-all"
                  >
                    <div>
                      <span className="font-bold text-neutral-100 group-hover:text-[#ff8c42] transition-colors">🏙️ MARCHENOU-KAPITAL</span>
                      <p className="text-xs text-neutral-400 mt-1">Espas lokal pou tout pwodwi ki nan zòn kapital la</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-[#ff8c42]" />
                  </a>
                </div>
              </div>

              {/* Administrative Contacts */}
              <div className="glass-panel rounded-3xl p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                  <PhoneCall className="h-5 w-5 text-emerald-400" />
                  Sèvis Admin ak Rezo Sosyal yo
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-[#ff8c42] font-bold block uppercase tracking-wide">Nimewo Administrasyon:</span>
                    <p className="text-lg font-semibold text-neutral-100 font-mono">📞 +509 5661 0630</p>
                    <p className="text-lg font-semibold text-neutral-100 font-mono">📞 +509 3187 1206</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] text-[#ff8c42] font-bold block uppercase tracking-wide">Swiv nou sou Rezo yo:</span>
                    <div className="flex gap-4">
                      <a href="https://instagram.com/marchenou" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 hover:bg-pink-600/20 text-neutral-400 hover:text-pink-500 flex items-center justify-center transition-all">
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a href="https://facebook.com/profile.php?id=61589704919068" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 hover:bg-blue-600/20 text-neutral-400 hover:text-blue-500 flex items-center justify-center transition-all">
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a href="https://tiktok.com/@marchenou7" target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-all">
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.94 1.18 2.27 2 3.74 2.37v3.83c-1.46-.07-2.92-.51-4.18-1.27-.47-.28-.91-.61-1.31-.99-.01 2.26.01 4.51-.01 6.77-.04 2.24-.71 4.53-2.14 6.27-1.42 1.73-3.56 2.82-5.78 2.99-2.31.18-4.73-.44-6.52-1.99-1.89-1.63-2.88-4.23-2.58-6.72.24-2.22 1.41-4.34 3.28-5.55 1.55-1.01 3.47-1.46 5.3-.13.01 1.34.01 2.68.01 4.02-1.07-.63-2.52-.53-3.41.44-.75.81-.84 2.11-.2 2.99.64.91 1.86 1.25 2.87.82 1.05-.44 1.57-1.57 1.56-2.67-.01-5.13-.01-10.26-.01-15.39z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Disclaimer / Clause panel */}
            <div className="glass-panel p-8 rounded-3xl border-l-4 border-orange-500 max-w-4xl mx-auto space-y-3 bg-[#0a120e]">
              <div className="flex items-center gap-2 text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-bold text-lg font-display uppercase tracking-wider">⚠️ REKLAMASYON AK APEL ENPÒTAN</h4>
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                MARCHENOU gen dwa pou modifye oswa chanje tout règ, frè ak pri nenpòt lè san prejije oswa gwo deba avètisman. Nou pa fè ranbousman sou okenn abònman vandè oswa sèvis apre pèfòmans. Lè w enskri oswa fè piblikasyon nan gwoup nou yo, ou aksepte tout kondisyon teknik ak tèm sa yo nèt ale.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* ================= FOOTER ================= */}
      <footer id="main-footer" className="bg-[#040b08] py-12 px-6 border-t border-white/5 text-center transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="font-display text-2xl tracking-wide">
            MARCHE<span className="text-[#ff8c42]">NOU</span>
          </div>
          <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto">
            © 2026 MARCHENOU — Pou nou, pou mwen, pou ou, pou nou tout 🇭🇹
          </p>
          <div className="h-px bg-white/5 w-16 mx-auto"></div>
          <p className="text-[11px] text-[#1e8b5b] font-semibold italic max-w-md mx-auto font-sans">
            Fè biznis danyèl lakay ou — avèk MARCHENOU, n ap wè yon lòt Ayiti kote ekonomi ap mache kòrèkteman!
          </p>
        </div>
      </footer>

      {/* ================= CONFIGURATION MODAL ================= */}
      {showConfigModal && (
        <div id="modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowConfigModal(false)}></div>
          
          <div className="glass-panel bg-[#091511] w-full max-w-lg rounded-3xl p-6 lg:p-8 z-10 space-y-6 relative border border-emerald-500/30 shadow-2xl">
            <button 
              onClick={() => setShowConfigModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">⚙️ KONFIGIRASYON ADMIN</span>
              <h3 className="text-2xl font-bold flex items-center gap-1.5">
                Feuy Done Google Sheets
              </h3>
              <p className="text-xs text-neutral-400">Antre URL CSV pou feuy Google Sheets ou a pou pwen yo ka chèche otomatikman depi nan telefòn ou.</p>
            </div>

            <div className="space-y-4 font-sans text-sm">
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 block">Google Sheets CSV URL:</label>
                <input 
                  type="text" 
                  value={sheetsInput}
                  onChange={(e) => setSheetsInput(e.target.value)}
                  placeholder="Mete URL CSV ki pibliye sou entènèt la..."
                  className="w-full bg-[#030a07] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Guide/Help for Admin */}
              <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 space-y-2.5">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 shrink-0" />
                  Kouman pou pibliye Google Sheets ou kòm CSV pou 0$ :
                </p>
                <ol className="text-[11px] text-neutral-300 space-y-1 list-decimal list-inside pl-1 leading-relaxed">
                  <li>Kreye yon Google Sheet ak kolòn sa yo nan premye liy lan eksprime egzak: <code className="bg-black/50 px-1 py-0.5 rounded font-mono font-bold text-white">pseudo,phone,points,total_earned,total_spent</code></li>
                  <li>Koumanse ajoute liy manm yo ak pseudo, telefòn ak kanti pwen yo.</li>
                  <li>Ale nan meni a: <span className="font-semibold text-white">Tri/Fichier &gt; Partager &gt; Pibliye sou entènèt</span>.</li>
                  <li>Chwazi chwa <span className="font-semibold text-white">"Valeurs séparées par des virgules (.csv)"</span> nan dezyèm bwat la, epi klike <span className="font-bold text-[#ff8c42]">Publier</span>.</li>
                  <li>Kopye gwo URL sa a epi kole l la a nan bwat konfigirasyon an!</li>
                </ol>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button 
                onClick={resetSheetsUrl}
                className="bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-neutral-300 hover:text-red-400 font-bold px-4 py-2.5 rounded-xl text-xs uppercase"
              >
                Repati a zero (Reset)
              </button>
              <button 
                onClick={saveSheetsUrl}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase shadow-lg shadow-emerald-500/15"
              >
                Anrejistre Done URL
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
