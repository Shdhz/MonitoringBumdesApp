import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    CheckCircle,
    DollarSign,
    FileDown,
    FileSpreadsheet,
    RefreshCw,
    Settings,
    Trash2,
    TrendingUp,
    X,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { route } from 'ziggy-js';

// Initialize dayjs
dayjs.extend(relativeTime);
dayjs.locale('id');

// Types
interface LaporanKeuangan {
    tanggal: string;
    keterangan: string;
    jenis: string;
    bulan: string;
}

interface FlashInfo {
    message?: string;
    method?: string;
}

interface PageProps {
    flash: { info?: FlashInfo };
    laporanKeuangan: LaporanKeuangan[];
    initial_balance: number;
    tanggal_diubah: string;
}

// Constants
const FLASH_TIMEOUT = 3000;
const MIN_NOMINAL = 1;
const DEFAULT_UNIT_ID = 1;

const FLASH_COLORS = {
    delete: 'bg-red-600',
    update: 'bg-blue-600',
    create: 'bg-green-600',
    default: 'bg-green-600',
} as const;

const TRANSACTION_TYPES = {
    pendapatan: { bg: 'bg-blue-100', text: 'text-blue-800', icon: ArrowUp },
    pengeluaran: { bg: 'bg-red-100', text: 'text-red-800', icon: ArrowDown },
    default: { bg: 'bg-gray-100', text: 'text-gray-800', icon: null },
} as const;

// Custom hooks
const useFlashMessage = (flash: FlashInfo | undefined) => {
    const [flashState, setFlashState] = useState({
        message: null as string | null,
        method: '',
        color: '',
    });

    useEffect(() => {
        if (!flash?.message) return;

        const { message, method = 'create' } = flash;
        const color = FLASH_COLORS[method as keyof typeof FLASH_COLORS] || FLASH_COLORS.default;

        setFlashState({ message, method, color });

        const timeout = setTimeout(() => {
            setFlashState((prev) => ({ ...prev, message: null, method: '' }));
        }, FLASH_TIMEOUT);

        return () => clearTimeout(timeout);
    }, [flash]);

    return flashState;
};

// Components
const FlashMessage: React.FC<{ message: string; method: string; color: string }> = ({ message, method, color }) => {
    const renderIcon = () => {
        const iconProps = { className: 'h-5 w-5 text-white' };

        switch (method) {
            case 'create':
                return <CheckCircle {...iconProps} />;
            case 'update':
                return <RefreshCw {...iconProps} />;
            case 'delete':
                return <Trash2 {...iconProps} />;
            default:
                return <CheckCircle {...iconProps} />;
        }
    };

    return (
        <div
            className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${color}`}
        >
            {renderIcon()}
            <span>{message}</span>
        </div>
    );
};

const StatsCard: React.FC<{
    title: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
    children: React.ReactNode;
}> = ({ title, icon: Icon, gradient, iconColor, children }) => (
    <div className={`group relative overflow-hidden rounded-2xl ${gradient} p-6 shadow-sm transition-all duration-300 hover:shadow-lg`}>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className={`flex items-center gap-2 text-sm font-medium ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                    {title}
                </div>
                {children}
            </div>
            <div className={`rounded-full ${iconColor.replace('text-', 'bg-').replace('-600', '-100')} p-2`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
        </div>
    </div>
);

const SaldoCard: React.FC<{
    initialBalance: number;
    tanggalDiubah: string;
    onSettingsClick: () => void;
}> = ({ initialBalance, tanggalDiubah, onSettingsClick }) => (
    <StatsCard title="Saldo Saat Ini" icon={DollarSign} gradient="bg-gradient-to-br from-blue-50 to-blue-100" iconColor="text-blue-600">
        <p className="mt-2 text-2xl font-bold text-gray-900">Rp. {initialBalance.toLocaleString('id-ID')}</p>
        <p className="mt-1 text-xs text-gray-500">Terakhir diubah: {dayjs(tanggalDiubah).fromNow()}</p>
        <Button
            onClick={onSettingsClick}
            className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <Settings className="mr-2 h-4 w-4" />
            Atur Saldo Awal
        </Button>
    </StatsCard>
);

const TarifCard: React.FC<{ onSettingsClick: () => void }> = ({ onSettingsClick }) => (
    <StatsCard title="Tarif Sewa" icon={Calendar} gradient="bg-gradient-to-br from-purple-50 to-purple-100" iconColor="text-purple-600">
        <p className="mt-2 text-lg font-semibold text-gray-900">Per Kegiatan</p>
        <p className="mt-1 text-xs text-gray-500">Terakhir diubah: 05-06-2025</p>
        <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50">
                Lihat Tarif
            </Button>
            <Button onClick={onSettingsClick} size="sm" className="flex-1 bg-purple-600 text-white hover:bg-purple-700">
                <Settings className="mr-1 h-3 w-3" />
                Atur
            </Button>
        </div>
    </StatsCard>
);

const SummaryCard: React.FC = () => (
    <StatsCard title="Bulan Ini" icon={TrendingUp} gradient="bg-gradient-to-br from-green-50 to-green-100" iconColor="text-green-600">
        <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pendapatan:</span>
                <span className="font-semibold text-gray-900">Rp 3.250.000</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pengeluaran:</span>
                <span className="font-semibold text-gray-900">Rp 850.000</span>
            </div>
            <div className="border-t border-green-200 pt-2">
                <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Selisih:</span>
                    <span className="font-bold text-green-600">+Rp 2.400.000</span>
                </div>
            </div>
        </div>
    </StatsCard>
);

const TransactionRow: React.FC<{
    item: LaporanKeuangan;
    index: number;
}> = ({ item, index }) => {
    const transactionType = TRANSACTION_TYPES[item.jenis.toLowerCase() as keyof typeof TRANSACTION_TYPES] || TRANSACTION_TYPES.default;
    const Icon = transactionType.icon;

    const handleDetailClick = useCallback(() => {
        router.visit(`/MiniSoccer/${item.bulan}`);
    }, [item.bulan]);

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{index + 1}</td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{item.tanggal}</td>
            <td className="px-6 py-4 text-sm text-gray-900">{item.keterangan}</td>
            <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${transactionType.bg} ${transactionType.text}`}
                >
                    {Icon && <Icon className="h-3 w-3" />}
                    {item.jenis}
                </span>
            </td>
            <td className="px-6 py-4 text-center text-sm whitespace-nowrap">
                <div className="flex justify-center gap-2">
                    <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDetailClick}>
                        Detail
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        <FileDown className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-200 text-green-600 hover:bg-green-50">
                        <FileSpreadsheet className="h-3 w-3" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const TransactionTable: React.FC<{ data: LaporanKeuangan[] }> = ({ data }) => (
    <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">No</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal Transaksi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Keterangan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Jenis</th>
                        <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.length > 0 ? (
                        data.map((item, index) => <TransactionRow key={`${item.tanggal}-${index}`} item={item} index={index} />)
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center">
                                    <FileSpreadsheet className="h-12 w-12 text-gray-300" />
                                    <p className="mt-2 text-sm text-gray-500">Belum ada data laporan transaksi</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 p-4 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:text-gray-600" aria-label="Close modal">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Utility functions
const formatCurrency = (value: string): string => {
    const raw = value.replace(/\D/g, '');
    const number = parseInt(raw || '0', 10);
    return number > 0 ? number.toLocaleString('id-ID') : '';
};

const parseCurrency = (value: string): number => {
    return parseInt(value.replace(/\D/g, ''), 10) || 0;
};

// Main component
export default function InterDesa() {
    const { flash, laporanKeuangan = [], initial_balance = 0, tanggal_diubah } = usePage().props as unknown as PageProps;

    // Flash message handling
    const { message: flashMessage, method: flashMethod, color: flashColor } = useFlashMessage(flash?.info);

    // Modal states
    const [showModalSaldo, setShowModalSaldo] = useState(false);
    const [showModalTarif, setShowModalTarif] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        tanggal: '',
        penyewa: 'Reguler',
        nominalBaru: '',
    });

    const [tarifAwal] = useState(0);

    // Handlers
    const handleNominalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCurrency(e.target.value);
        setFormData((prev) => ({ ...prev, nominalBaru: formatted }));
    }, []);

    const handleNominalBlur = useCallback(() => {
        const parsed = parseCurrency(formData.nominalBaru);
        if (parsed < MIN_NOMINAL) {
            setFormData((prev) => ({ ...prev, nominalBaru: MIN_NOMINAL.toString() }));
        }
    }, [formData.nominalBaru]);

    const handleInputChange = useCallback(
        (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        },
        [],
    );

    const handleSimpanSaldoAwal = useCallback(() => {
        const nominal = parseCurrency(formData.nominalBaru);

        router.post(
            route('storeInitialBalance', DEFAULT_UNIT_ID),
            {
                tanggal: formData.tanggal,
                nominal,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowModalSaldo(false);
                    setFormData((prev) => ({ ...prev, tanggal: '', nominalBaru: '' }));
                },
                onError: (errors) => {
                    console.error('Error saving initial balance:', errors);
                },
            },
        );
    }, [formData.tanggal, formData.nominalBaru]);

    const closeModal = useCallback((modalType: 'saldo' | 'tarif') => {
        if (modalType === 'saldo') {
            setShowModalSaldo(false);
        } else {
            setShowModalTarif(false);
        }
    }, []);

    return (
        <AppLayout>
            <Head title="Unit Usaha - Mini Soccer" />

            {flashMessage && <FlashMessage message={flashMessage} method={flashMethod} color={flashColor} />}

            <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Unit Usaha - Internet Desa</h1>
                    <p className="mt-2 text-sm text-gray-600">Kelola kKuangan dan Operasional Internet Desa Anda</p>
                </header>

                {/* Stats Cards */}
                <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Statistics">
                    <SaldoCard initialBalance={initial_balance} tanggalDiubah={tanggal_diubah} onSettingsClick={() => setShowModalSaldo(true)} />
                    <TarifCard onSettingsClick={() => setShowModalTarif(true)} />
                    <SummaryCard />
                </section>

                {/* Transaction Report */}
                <section className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Laporan Transaksi</h2>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <TransactionTable data={laporanKeuangan} />
                </section>
            </div>

            {/* Modal: Saldo */}
            <Modal isOpen={showModalSaldo} onClose={() => closeModal('saldo')} title="Atur Saldo Awal Mini Soccer">
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                        <input
                            type="date"
                            value={formData.tanggal}
                            onChange={handleInputChange('tanggal')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Nominal Saldo Awal</label>
                        <input
                            type="text"
                            value={formData.nominalBaru}
                            onChange={handleNominalChange}
                            onBlur={handleNominalBlur}
                            placeholder="Contoh: 150.000"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            inputMode="numeric"
                            required
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button onClick={handleSimpanSaldoAwal} className="bg-blue-600 hover:bg-blue-700">
                        Simpan
                    </Button>
                </div>
            </Modal>

            {/* Modal: Tarif Sewa */}
            <Modal isOpen={showModalTarif} onClose={() => closeModal('tarif')} title="Atur Tarif Sewa Mini Soccer">
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Berlaku Mulai Tanggal</label>
                        <input
                            type="date"
                            value={formData.tanggal}
                            onChange={handleInputChange('tanggal')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Penyewa</label>
                        <select
                            value={formData.penyewa}
                            onChange={handleInputChange('penyewa')}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="Reguler">Reguler</option>
                            <option value="Member">Member</option>
                            <option value="Komunitas">Komunitas</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Tarif per Jam</label>
                        <input
                            type="text"
                            value={`Rp. ${tarifAwal.toLocaleString('id-ID')}`}
                            readOnly
                            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => closeModal('tarif')}>
                        Batal
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Simpan</Button>
                </div>
            </Modal>
        </AppLayout>
    );
}
