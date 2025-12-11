import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { reservationService, adminStaffService, businessService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtersLoading, setFiltersLoading] = useState(true);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);

    // Filter states
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [selectedService, setSelectedService] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    useEffect(() => {
        if (authLoading) return;
        if (!user?.businessId) {
            setFiltersLoading(false);
            return;
        }
        fetchInitialData(user.businessId);
    }, [authLoading, user?.businessId]);

    useEffect(() => {
        if (authLoading || !user?.businessId) return;
        fetchReservations();
    }, [selectedDate, authLoading, user?.businessId]);

    const fetchInitialData = async (businessId) => {
        setFiltersLoading(true);
        try {
            const [staffData, servicesData] = await Promise.all([
                adminStaffService.getAll(),
                businessService.getServices(businessId)
            ]);
            setStaff(staffData);
            setServices(servicesData);
        } catch (error) {
            console.error('Veri yüklenemedi:', error);
        } finally {
            setFiltersLoading(false);
        }
    };

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await reservationService.getForDay(selectedDate);
            setReservations(data);
        } catch (error) {
            console.error('Randevular yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (reservationId, newStatus) => {
        try {
            await reservationService.updateStatus({
                reservationId,
                status: parseInt(newStatus)
            });
            fetchReservations();
        } catch (error) {
            alert('Hata: ' + (error.response?.data?.message || error.message));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Pending': <span className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-sm">Beklemede</span>,
            'Confirmed': <span className="px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold text-sm">Onaylandı</span>,
            'Cancelled': <span className="px-4 py-2 rounded-full bg-red-100 text-red-800 font-semibold text-sm">İptal</span>
        };
        return badges[status] || status;
    };

    // Filter reservations
    const filteredReservations = reservations.filter(res => {
        if (selectedStaff !== 'all' && res.staffMemberId !== parseInt(selectedStaff) && selectedStaff !== 'none') return false;
        if (selectedStaff === 'none' && res.staffMemberId !== null) return false;
        if (selectedService !== 'all' && res.serviceId !== parseInt(selectedService)) return false;
        if (selectedStatus !== 'all' && res.status !== selectedStatus) return false;
        return true;
    });

    if (authLoading || filtersLoading) return <div className="p-8 text-center">Yükleniyor...</div>;

    if (!user?.businessId) {
        return <div className="p-8 text-center text-red-500">İşletme bilgisi bulunamadı. Lütfen tekrar giriş yapın.</div>;
    }

    if (loading) return <div className="p-8 text-center">Randevular yükleniyor...</div>;

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Randevular</h1>
                    <p className="text-gray-600 mt-2">Günlük randevularınızı görüntüleyin ve yönetin</p>
                </div>
                <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <Calendar className="text-blue-600" size={20} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="outline-none text-gray-900 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ChevronDown size={20} className="text-blue-600" />
                    Filtrele
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Personel</label>
                        <select
                            value={selectedStaff}
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                        >
                            <option value="all">Tümü</option>
                            <option value="none">Fark Etmez</option>
                            {staff.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hizmet</label>
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                        >
                            <option value="all">Tümü</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                        >
                            <option value="all">Tümü</option>
                            <option value="Pending">Beklemede</option>
                            <option value="Confirmed">Onaylandı</option>
                            <option value="Cancelled">İptal</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    <strong>{filteredReservations.length}</strong> randevu gösteriliyor
                    {filteredReservations.length !== reservations.length && ` (${reservations.length} toplam)`}
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
                {filteredReservations.map((res) => (
                    <div key={res.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {res.serviceName} • {Math.round((new Date(res.endTime) - new Date(res.startTime)) / 60000)} dk
                                </div>
                            </div>
                            {getStatusBadge(res.status)}
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-gray-700">
                                <span className="font-semibold">Müşteri:</span> {res.customerName}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold">Telefon:</span> {res.customerPhone}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold">Personel:</span> {res.staffMemberName || 'Fark Etmez'}
                            </div>
                        </div>
                        {res.status === 'Pending' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusUpdate(res.id, 1)}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                                >
                                    Onayla
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(res.id, 2)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                >
                                    İptal Et
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Saat</th>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Müşteri</th>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Hizmet</th>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Personel</th>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide">Durum</th>
                                <th className="p-5 font-bold text-gray-700 text-sm uppercase tracking-wide text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReservations.map((res) => (
                                <tr key={res.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-5 font-bold text-gray-900 text-lg">
                                        {new Date(res.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="p-5">
                                        <div className="font-semibold text-gray-900">{res.customerName}</div>
                                        <div className="text-sm text-gray-500">{res.customerPhone}</div>
                                    </td>
                                    <td className="p-5 text-gray-700">{res.serviceName}</td>
                                    <td className="p-5 text-gray-600">
                                        {res.staffMemberName ? (
                                            <span className="font-medium text-gray-900">{res.staffMemberName}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Fark Etmez</span>
                                        )}
                                    </td>
                                    <td className="p-5">{getStatusBadge(res.status)}</td>
                                    <td className="p-5 text-right space-x-2">
                                        {res.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleStatusUpdate(res.id, 1)}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                                                >
                                                    Onayla
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(res.id, 2)}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                                >
                                                    İptal
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredReservations.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Calendar className="mx-auto mb-4 opacity-50" size={48} />
                    <p className="text-lg">Seçili kriterlere uygun randevu bulunamadı</p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
