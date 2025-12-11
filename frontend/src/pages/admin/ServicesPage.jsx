import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { businessService, adminServicesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ServicesPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        durationMinutes: ''
    });

    useEffect(() => {
        if (authLoading) return;
        if (!user?.businessId) {
            setLoading(false);
            return;
        }
        fetchServices(user.businessId);
    }, [authLoading, user?.businessId]);

    const fetchServices = async (businessId) => {
        setLoading(true);
        try {
            const data = await businessService.getServices(businessId);
            setServices(data);
        } catch (error) {
            console.error('Hizmetler yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.businessId) {
            alert('İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
            return;
        }
        try {
            if (editingService) {
                await adminServicesService.update(editingService.id, formData);
            } else {
                await adminServicesService.create(formData);
            }
            setShowModal(false);
            setEditingService(null);
            setFormData({ name: '', description: '', price: '', durationMinutes: '' });
            fetchServices(user.businessId);
        } catch (error) {
            alert('Hata: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            price: service.price,
            durationMinutes: service.durationMinutes
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu hizmeti silmek istediğinizden emin misiniz?')) return;
        if (!user?.businessId) {
            alert('İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
            return;
        }
        try {
            await adminServicesService.delete(id);
            fetchServices(user.businessId);
        } catch (error) {
            alert('Hata: ' + (error.response?.data?.message || error.message));
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Yükleniyor...</div>;

    if (!user?.businessId) {
        return <div className="p-8 text-center text-red-500">İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın.</div>;
    }

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Hizmetler</h1>
                    <p className="text-gray-600 mt-2">İşletmenizin sunduğu hizmetleri yönetin</p>
                </div>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setEditingService(null);
                        setFormData({ name: '', description: '', price: '', durationMinutes: '' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                    <Plus size={20} />
                    Yeni Hizmet Ekle
                </button>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">{service.name}</h3>
                                {service.description && (
                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{service.price} ₺</div>
                                <div className="text-sm text-gray-500">{service.durationMinutes} dakika</div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(service)}
                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                >
                                    <Pencil size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-left font-bold text-gray-700 text-sm uppercase tracking-wide">Hizmet Adı</th>
                            <th className="p-5 text-left font-bold text-gray-700 text-sm uppercase tracking-wide">Açıklama</th>
                            <th className="p-5 text-left font-bold text-gray-700 text-sm uppercase tracking-wide">Süre</th>
                            <th className="p-5 text-left font-bold text-gray-700 text-sm uppercase tracking-wide">Fiyat</th>
                            <th className="p-5 text-right font-bold text-gray-700 text-sm uppercase tracking-wide">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {services.map((service) => (
                            <tr key={service.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-5 font-semibold text-gray-900">{service.name}</td>
                                <td className="p-5 text-gray-600">{service.description || '-'}</td>
                                <td className="p-5 text-gray-700">{service.durationMinutes} dk</td>
                                <td className="p-5 font-bold text-blue-600">{service.price} ₺</td>
                                <td className="p-5 text-right space-x-2">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                                    >
                                        Sil
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                {editingService ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Hizmet Adı *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Açıklama
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        rows="3"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Süre (dakika) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.durationMinutes}
                                            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Fiyat (₺) *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingService(null);
                                            setFormData({ name: '', description: '', price: '', durationMinutes: '' });
                                        }}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md"
                                    >
                                        {editingService ? 'Güncelle' : 'Ekle'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServicesPage;
