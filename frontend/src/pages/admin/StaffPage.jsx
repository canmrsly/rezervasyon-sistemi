import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import { Trash2, UserPlus, Check, X, Users, Sparkles } from 'lucide-react';
import { adminStaffService } from '../../services/api';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');

    const fetchStaff = async () => {
        try {
            const response = await adminStaffService.getAll();
            setStaff(response);
        } catch (err) {
            console.error('Personel listesi alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleAddStaff = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await adminStaffService.create({ name: newName });
            setNewName('');
            fetchStaff();
        } catch (err) {
            setError(err.response?.data?.message || 'Personel eklenirken hata oluştu.');
        }
    };

    const handleStatusUpdate = async (id, isActive) => {
        try {
            await adminStaffService.updateStatus({ staffId: id, isActive });
            fetchStaff();
        } catch (err) {
            alert('Durum güncellenemedi.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return;
        try {
            await adminStaffService.delete(id);
            fetchStaff();
        } catch (err) {
            alert(err.response?.data?.message || 'Silme işlemi başarısız.');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-6 sm:p-8 mb-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Users size={32} />
                    <h1 className="text-2xl sm:text-3xl font-bold">Personel Yönetimi</h1>
                </div>
                <p className="text-indigo-100">Personellerinizi ekleyin, düzenleyin ve yönetin</p>
            </div>

            {/* Add Staff Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md mb-6 border border-gray-100">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <UserPlus size={24} className="text-indigo-600" />
                    Yeni Personel Ekle
                </h2>
                <form onSubmit={handleAddStaff} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            label="Ad Soyad"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Örn: Ayşe Yılmaz"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="sm:mt-9 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <UserPlus size={20} />
                        Ekle
                    </button>
                </form>
                {error && <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
                ) : staff.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Henüz personel eklenmemiş.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Cards */}
                        <div className="block sm:hidden divide-y divide-gray-100">
                            {staff.map((s) => (
                                <div key={s.id} className="p-5 hover:bg-indigo-50/50 transition">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="font-bold text-lg text-gray-900">{s.name}</div>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {s.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleStatusUpdate(s.id, !s.isActive)}
                                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition active:scale-95 flex items-center justify-center gap-2 ${s.isActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                        >
                                            {s.isActive ? <X size={18} /> : <Check size={18} />}
                                            {s.isActive ? 'Pasife Al' : 'Aktifleştir'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id)}
                                            className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <table className="hidden sm:table w-full text-left">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Ad Soyad</th>
                                    <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Durum</th>
                                    <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {staff.map((s) => (
                                    <tr key={s.id} className="hover:bg-indigo-50/50 transition">
                                        <td className="p-5 font-semibold text-gray-900">{s.name}</td>
                                        <td className="p-5">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${s.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                {s.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right space-x-2">
                                            <button
                                                onClick={() => handleStatusUpdate(s.id, !s.isActive)}
                                                className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition active:scale-95 ${s.isActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                                title={s.isActive ? 'Pasife Al' : 'Aktifleştir'}
                                            >
                                                {s.isActive ? <X size={18} /> : <Check size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="inline-flex items-center gap-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition active:scale-95"
                                                title="Sil"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffPage;
