import React, { useEffect, useState } from 'react';
import Input from '../../components/Input';
import { Save, Building, Clock, Sparkles } from 'lucide-react';
import { adminBusinessService } from '../../services/api';

const BusinessSettingsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        workDayStart: '09:00:00',
        workDayEnd: '18:00:00',
        slotDurationMinutes: 30
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const response = await adminBusinessService.get();
                setFormData(response);
            } catch (err) {
                console.error('İşletme bilgileri alınamadı:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBusiness();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const payload = {
            ...formData,
            workDayStart: formData.workDayStart.length === 5 ? `${formData.workDayStart}:00` : formData.workDayStart,
            workDayEnd: formData.workDayEnd.length === 5 ? `${formData.workDayEnd}:00` : formData.workDayEnd,
            slotDurationMinutes: parseInt(formData.slotDurationMinutes)
        };

        try {
            await adminBusinessService.update(payload);
            setMessage({ type: 'success', text: 'Ayarlar başarıyla güncellendi! ✓' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Güncelleme başarısız.' });
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-96">
            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl p-6 sm:p-8 mb-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Building size={32} />
                    <h1 className="text-2xl sm:text-3xl font-bold">İşletme Ayarları</h1>
                </div>
                <p className="text-indigo-100">İşletme bilgilerinizi ve çalışma saatlerinizi yönetin</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Success/Error Message */}
                {message.text && (
                    <div className={`p-5 rounded-2xl font-medium flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-2 border-green-200' : 'bg-red-50 text-red-700 border-2 border-red-200'}`}>
                        {message.type === 'success' ? '✓' : '⚠'}
                        {message.text}
                    </div>
                )}

                {/* Business Info Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                        <Sparkles size={24} className="text-indigo-600" />
                        İşletme Bilgileri
                    </h2>

                    <div className="space-y-5">
                        <Input
                            label="İşletme Adı"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-2">Açıklama</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-4 text-base rounded-2xl border-2 border-gray-200 focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all outline-none"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                            <Input
                                label="Telefon"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <Input
                                label="E-posta"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Adres"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Working Hours Section */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                        <Clock size={24} className="text-indigo-600" />
                        Çalışma Saatleri & Randevu Süresi
                    </h2>

                    <div className="grid sm:grid-cols-3 gap-5">
                        <Input
                            label="Başlangıç Saati"
                            name="workDayStart"
                            type="time"
                            step="1"
                            value={formData.workDayStart}
                            onChange={handleChange}
                        />
                        <Input
                            label="Bitiş Saati"
                            name="workDayEnd"
                            type="time"
                            step="1"
                            value={formData.workDayEnd}
                            onChange={handleChange}
                        />
                        <Input
                            label="Randevu Süresi (dk)"
                            name="slotDurationMinutes"
                            type="number"
                            min="5"
                            max="480"
                            value={formData.slotDurationMinutes}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all active:scale-98 flex items-center justify-center gap-3 shadow-lg"
                >
                    <Save size={24} />
                    Kaydet
                </button>
            </form>
        </div>
    );
};

export default BusinessSettingsPage;
