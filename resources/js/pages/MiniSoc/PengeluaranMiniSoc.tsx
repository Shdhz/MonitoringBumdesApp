import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

interface PengeluaranItem {
    id: number;
    tanggal: string;
    kategori: string;
    deskripsi: string;
    biaya: number;
}

interface Props {
    unit_id: number;
    user: {
        id_users: number;
        name: string;
        email: string;
        roles: string;
        image?: string;
    };
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    pengeluaran: PengeluaranItem[];
}

interface FlashInfo {
    message?: string;
    method?: 'create' | 'update' | 'delete';
}

export default function PengeluaranMiniSoc({ user, unit_id, pengeluaran, pagination }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { info?: { message?: string; method?: string } };
    };

    const [flashMethod, setFlashMethod] = useState<string>('');
    const [flashColor, setFlashColor] = useState<string>('');
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!flash?.info?.message) return;

        const { message, method } = flash.info;

        setFlashMessage(message || '');
        setFlashMethod(method || '');

        switch (method) {
            case 'delete':
                setFlashColor('bg-red-600');
                break;
            case 'update':
                setFlashColor('bg-blue-600');
                break;
            case 'create':
            default:
                setFlashColor('bg-green-600');
                break;
        }

        const timeout = setTimeout(() => {
            setFlashMessage(null);
            setFlashMethod('');
        }, 3000);

        return () => clearTimeout(timeout);
    }, [flash]);

    const renderFlashIcon = () => {
        switch (flashMethod) {
            case 'create':
                return <CheckCircle className="h-5 w-5 text-white" />;
            case 'update':
                return <RefreshCw className="h-5 w-5 text-white" />;
            case 'delete':
                return <Trash2 className="h-5 w-5 text-white" />;
            default:
                return <CheckCircle className="h-5 w-5 text-white" />;
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<null | number>(null);

    const {
        data: formData,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        tanggal: '',
        kategori: '',
        deskripsi: '',
        biaya: 0,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Fix: URL untuk pengeluaran, bukan pemasukan
        const method = editing === null ? post : put;
        const url = editing === null ? `/unit/${unit_id}/pengeluaran-minisoc` : `/unit/${unit_id}/pengeluaran-minisoc/${editing}`;

        method(url, {
            onSuccess: () => {
                reset();
                setShowModal(false);
                setEditing(null);
            },
        });
    };

    const handleEdit = (item: PengeluaranItem) => {
        setData({
            tanggal: item.tanggal,
            kategori: item.kategori,
            deskripsi: item.deskripsi,
            biaya: item.biaya,
        });
        setEditing(item.id);
        setShowModal(true);
    };

    const handleDelete = (id: number) => {
        console.log(`Deleting: /unit/${unit_id}/pengeluaran-minisoc/${id}`);
        if (confirm('Yakin ingin menghapus data ini?')) {
            router.delete(`/unit/${unit_id}/pengeluaran-minisoc/${id}`);
        }
        console.log('Unit ID:', unit_id);
    };

    return (
        <AppLayout>
            <Head title="Pengeluaran Mini Soccer" />

            {/* Flash Message */}
            {flashMessage && (
                <div
                    className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 ${flashColor}`}
                >
                    {renderFlashIcon()}
                    <span>{flashMessage}</span>
                </div>
            )}

            <div className="flex items-center justify-between px-6 pt-6 pb-8 text-black">
                <h1 className="text-lg font-semibold text-black">Selamat datang, Pengelola Mini Soccer</h1>
                <div className="flex items-center gap-3">
                    <img src={user.image || '/assets/images/avatar.png'} alt="User Avatar" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-right">
                        <p className="text-sm font-semibold text-black">{user.name}</p>
                        <p className="mr-3 text-xs text-black">{user.roles}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl bg-white px-2 py-4">
                <div className="mt-3 mb-4 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Pengeluaran - Mini Soccer</h2>
                    <Button onClick={() => setShowModal(true)} className="bg-blue-700 text-white hover:bg-blue-500">
                        Tambah pengeluaran harian +
                    </Button>
                </div>

                {/* Modal Input */}
                {showModal && (
                    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[4px]">
                        <div className="relative w-full max-w-md rounded-xl bg-white p-6 text-black shadow-lg">
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                                ✕
                            </button>
                            <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal</label>
                                    <input
                                        type="date"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Kategori Pengeluaran</label>
                                    <input
                                        type="text"
                                        placeholder="Kategori pengeluaran"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <input
                                        type="text"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.deskripsi}
                                        onChange={(e) => setData('deskripsi', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Biaya</label>
                                    <input
                                        type="number"
                                        className="w-full rounded border bg-gray-100 px-4 py-2 outline-none"
                                        value={formData.biaya}
                                        onChange={(e) => setData('biaya', Number(e.target.value))}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="submit" disabled={processing} className="bg-blue-700 text-white hover:bg-blue-500">
                                        {editing ? 'Update' : 'Tambah'}
                                    </Button>
                                    <Button
                                        type="button"
                                        className="bg-gray-300 text-black"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditing(null);
                                            reset();
                                        }}
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tabel Data Pengeluaran */}
                <div className="mx-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="min-w-full bg-white text-sm text-black">
                        <thead className="bg-gray-100 font-semibold text-black">
                            <tr>
                                <th className="px-4 py-3 text-center">No</th>
                                <th className="px-4 py-3 text-center">Tanggal</th>
                                <th className="px-4 py-3 text-center">Kategori</th>
                                <th className="px-4 py-3 text-center">Deskripsi</th>
                                <th className="px-4 py-3 text-center">Biaya</th>
                                <th className="px-4 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengeluaran.map((item, i) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-3 text-center">{i + 1}</td>
                                    <td className="px-4 py-3 text-center">{item.tanggal}</td>
                                    <td className="px-4 py-3 text-center">{item.kategori}</td>
                                    <td className="px-4 py-3 text-center">{item.deskripsi}</td>
                                    <td className="px-4 py-3 text-center">Rp. {item.biaya.toLocaleString('id-ID')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                className="rounded bg-yellow-500 px-2 py-1 text-white hover:bg-yellow-600"
                                                title="Edit"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={pagination.current_page === 1}
                            onClick={() => {
                                if (pagination.current_page > 1) {
                                    router.get(route().current()!, { page: pagination.current_page - 1 }, { preserveState: true });
                                }
                            }}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === pagination.current_page ? 'default' : 'outline'}
                                onClick={() => {
                                    router.get(route().current()!, { page }, { preserveState: true });
                                }}
                            >
                                {page}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            size="icon"
                            disabled={pagination.current_page === pagination.last_page}
                            onClick={() => {
                                if (pagination.current_page < pagination.last_page) {
                                    router.get(route().current()!, { page: pagination.current_page + 1 }, { preserveState: true });
                                }
                            }}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
