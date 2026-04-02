import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { url } from '@/utils';
import {
    ComposableMap,
    Geographies,
    Geography,
    ZoomableGroup,
} from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/** ISO-alpha2 → ISO-numeric mapping (for matching topojson country IDs) */
const ALPHA2_TO_NUMERIC: Record<string, string> = {
    AF:'004',AL:'008',DZ:'012',AD:'020',AO:'024',AG:'028',AR:'032',AM:'051',AU:'036',AT:'040',
    AZ:'031',BS:'044',BH:'048',BD:'050',BB:'052',BY:'112',BE:'056',BZ:'084',BJ:'204',BT:'064',
    BO:'068',BA:'070',BW:'072',BR:'076',BN:'096',BG:'100',BF:'854',BI:'108',KH:'116',CM:'120',
    CA:'124',CV:'132',CF:'140',TD:'148',CL:'152',CN:'156',CO:'170',KM:'174',CG:'178',CD:'180',
    CR:'188',CI:'384',HR:'191',CU:'192',CY:'196',CZ:'203',DK:'208',DJ:'262',DM:'212',DO:'214',
    EC:'218',EG:'818',SV:'222',GQ:'226',ER:'232',EE:'233',SZ:'748',ET:'231',FJ:'242',FI:'246',
    FR:'250',GA:'266',GM:'270',GE:'268',DE:'276',GH:'288',GR:'300',GD:'308',GT:'320',GN:'324',
    GW:'624',GY:'328',HT:'332',HN:'340',HU:'348',IS:'352',IN:'356',ID:'360',IR:'364',IQ:'368',
    IE:'372',IL:'376',IT:'380',JM:'388',JP:'392',JO:'400',KZ:'398',KE:'404',KI:'296',KP:'408',
    KR:'410',KW:'414',KG:'417',LA:'418',LV:'428',LB:'422',LS:'426',LR:'430',LY:'434',LI:'438',
    LT:'440',LU:'442',MG:'450',MW:'454',MY:'458',MV:'462',ML:'466',MT:'470',MH:'584',MR:'478',
    MU:'480',MX:'484',FM:'583',MD:'498',MC:'492',MN:'496',ME:'499',MA:'504',MZ:'508',MM:'104',
    NA:'516',NR:'520',NP:'524',NL:'528',NZ:'554',NI:'558',NE:'562',NG:'566',MK:'807',NO:'578',
    OM:'512',PK:'586',PW:'585',PS:'275',PA:'591',PG:'598',PY:'600',PE:'604',PH:'608',PL:'616',
    PT:'620',QA:'634',RO:'642',RU:'643',RW:'646',KN:'659',LC:'662',VC:'670',WS:'882',SM:'674',
    ST:'678',SA:'682',SN:'686',RS:'688',SC:'690',SL:'694',SG:'702',SK:'703',SI:'705',SB:'090',
    SO:'706',ZA:'710',SS:'728',ES:'724',LK:'144',SD:'729',SR:'740',SE:'752',CH:'756',SY:'760',
    TW:'158',TJ:'762',TZ:'834',TH:'764',TL:'626',TG:'768',TO:'776',TT:'780',TN:'788',TR:'792',
    TM:'795',TV:'798',UG:'800',UA:'804',AE:'784',GB:'826',US:'840',UY:'858',UZ:'860',VU:'548',
    VE:'862',VN:'704',YE:'887',ZM:'894',ZW:'716',XK:'412',
};

interface CountryData { country: string; count: number }
interface NamedData { name: string; count: number }
interface PageData { page: string; count: number }

interface Props {
    total_active: number;
    by_country: CountryData[];
    by_browser: NamedData[];
    by_os: NamedData[];
    by_device: NamedData[];
    active_pages: PageData[];
}

export default function LiveUsers(initial: Props) {
    const [data, setData] = useState<Props>(initial);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchData = useCallback(() => {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        fetch(url('/admin/live-users/poll'), {
            headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken },
        })
            .then((res) => res.json())
            .then((json: Props) => {
                setData(json);
                setLastUpdate(new Date());
            })
            .catch(() => {});
    }, []);

    // Poll every 15 seconds
    useEffect(() => {
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // Build country count map for coloring
    const countryMap: Record<string, number> = {};
    let maxCount = 1;
    data.by_country.forEach((c) => {
        countryMap[c.country] = c.count;
        if (c.count > maxCount) maxCount = c.count;
    });

    const getColor = (numericId: string): string => {
        // Find the alpha2 code for this numeric ID
        for (const [alpha2, numeric] of Object.entries(ALPHA2_TO_NUMERIC)) {
            if (numeric === numericId && countryMap[alpha2]) {
                const intensity = countryMap[alpha2] / maxCount;
                // From gray-800 to violet-500
                const r = Math.round(31 + intensity * (108 - 31));
                const g = Math.round(41 + intensity * (92 - 41));
                const b = Math.round(55 + intensity * (231 - 55));
                return `rgb(${r}, ${g}, ${b})`;
            }
        }
        return '#1f2937'; // gray-800
    };

    const getTooltip = (numericId: string): string => {
        for (const [alpha2, numeric] of Object.entries(ALPHA2_TO_NUMERIC)) {
            if (numeric === numericId && countryMap[alpha2]) {
                return `${alpha2}: ${countryMap[alpha2]} visitor${countryMap[alpha2] > 1 ? 's' : ''}`;
            }
        }
        return '';
    };

    const [tooltip, setTooltip] = useState('');
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    return (
        <AdminLayout header="Live Users">
            <Head title="Live Users" />

            <div className="space-y-6">
                {/* Top Row: Live count + Map */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Live Count Card */}
                    <div className="xl:col-span-1 space-y-4">
                        {/* Active Now */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 p-6 text-center">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live Now</span>
                            </div>
                            <p className="text-5xl font-bold text-white mb-1">{data.total_active}</p>
                            <p className="text-xs text-gray-500">active visitor{data.total_active !== 1 ? 's' : ''} in last 5 min</p>
                            <p className="text-[10px] text-gray-600 mt-2">
                                Updated {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>

                        {/* By Country List */}
                        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">By Country</h3>
                            {data.by_country.length > 0 ? (
                                <div className="space-y-2">
                                    {data.by_country.slice(0, 10).map((c) => (
                                        <div key={c.country} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-300">{c.country}</span>
                                            <span className="text-sm font-medium text-white bg-gray-800 px-2 py-0.5 rounded-md">{c.count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-600">No visitors yet</p>
                            )}
                        </div>
                    </div>

                    {/* World Map */}
                    <div className="xl:col-span-3 rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Visitor Map</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                                    <span className="text-[10px] text-gray-500">0</span>
                                </div>
                                <div className="w-24 h-3 rounded-sm" style={{ background: 'linear-gradient(90deg, #1f2937, #6c5ce7)' }}></div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] text-gray-500">High</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 relative" style={{ background: '#0d1117' }}>
                            {tooltip && (
                                <div
                                    className="absolute z-10 px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white pointer-events-none"
                                    style={{ left: tooltipPos.x, top: tooltipPos.y - 40 }}
                                >
                                    {tooltip}
                                </div>
                            )}
                            <ComposableMap
                                projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                                width={800}
                                height={400}
                                style={{ width: '100%', height: 'auto' }}
                            >
                                <ZoomableGroup>
                                    <Geographies geography={GEO_URL}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => {
                                                const tip = getTooltip(geo.id);
                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        fill={getColor(geo.id)}
                                                        stroke="#111827"
                                                        strokeWidth={0.5}
                                                        onMouseEnter={(e) => {
                                                            if (tip) {
                                                                const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                                                                setTooltip(tip);
                                                                setTooltipPos({ x: e.clientX - (rect?.left || 0), y: e.clientY - (rect?.top || 0) });
                                                            }
                                                        }}
                                                        onMouseLeave={() => setTooltip('')}
                                                        style={{
                                                            default: { outline: 'none' },
                                                            hover: { fill: '#8b5cf6', outline: 'none', cursor: tip ? 'pointer' : 'default' },
                                                            pressed: { outline: 'none' },
                                                        }}
                                                    />
                                                );
                                            })
                                        }
                                    </Geographies>
                                </ZoomableGroup>
                            </ComposableMap>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Browser, OS, Device, Active Pages */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Browsers */}
                    <BreakdownCard title="Browsers" items={data.by_browser} color="violet" />
                    {/* OS */}
                    <BreakdownCard title="Operating Systems" items={data.by_os} color="cyan" />
                    {/* Devices */}
                    <BreakdownCard title="Devices" items={data.by_device} color="emerald" />
                    {/* Active Pages */}
                    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Pages</h3>
                        {data.active_pages.length > 0 ? (
                            <div className="space-y-2">
                                {data.active_pages.map((p) => (
                                    <div key={p.page} className="flex items-center justify-between gap-2">
                                        <span className="text-sm text-gray-300 truncate" title={p.page}>{p.page}</span>
                                        <span className="text-sm font-medium text-white bg-gray-800 px-2 py-0.5 rounded-md flex-shrink-0">{p.count}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No active pages</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

/* ─── Breakdown Card ─── */
const colorClasses: Record<string, string> = {
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
};

function BreakdownCard({ title, items, color }: { title: string; items: { name: string; count: number }[]; color: string }) {
    const max = items[0]?.count || 1;
    return (
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
            {items.length > 0 ? (
                <div className="space-y-2.5">
                    {items.map((item) => (
                        <div key={item.name}>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-300">{item.name}</span>
                                <span className="text-gray-500 ml-2">{item.count}</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full">
                                <div
                                    className={`h-1 ${colorClasses[color] || 'bg-violet-500'} rounded-full transition-all`}
                                    style={{ width: `${(item.count / max) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-600">No data</p>
            )}
        </div>
    );
}
