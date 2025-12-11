import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { businessService, reservationService } from '../../services/api';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/Input';

const Slots = ({ businessId, serviceId, date, selectedSlot, onSelect }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!businessId || !serviceId || !date) return;

        const fetchSlots = async () => {
            setLoading(true);
            try {
                const data = await businessService.getAvailableSlots(businessId, serviceId, date);
                setSlots(data);
            } catch (error) {
                console.error('Slot hatası:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [businessId, serviceId, date]);

    if (loading) return <div className="col-span-3 text-center py-4 text-gray-500">Saatler yükleniyor...</div>;
    if (slots.length === 0) return <div className="col-span-3 text-center py-4 text-gray-500">Uygun saat bulunamadı.</div>;

    return slots.map((slot) => (
        <button
            key={slot.start}
            onClick={() => onSelect(slot)}
            className={`p-2 text-sm rounded-lg border transition-all
        ${selectedSlot?.start === slot.start
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
        >
            {slot.formatted.split(' ')[1]}
        </button>
    ));
};

const BookingPage = () => {
    const { businessId } = useParams();
    const [step, setStep] = useState(1); // 1: Service, 2: Date/Time, 3: Details, 4: Success
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);

    // Selections
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        phone: '',
        email: '',
        note: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [busData, servData] = await Promise.all([
                    businessService.getBusiness(businessId),
                    businessService.getServices(businessId)
                ]);
                setBusiness(busData);
                setServices(servData);
            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [businessId]);

    const handleSubmit = async () => {
        try {
            const payload = {
                businessId: parseInt(businessId),
                serviceId: selectedService.id,
                reservationDate: selectedSlot.start,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone,
                customerEmail: customerDetails.email,
                note: customerDetails.note
            };

            await reservationService.create(payload);
            setStep(4);
        } catch (error) {
            alert('Randevu oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="flex justify-center p-10">Yükleniyor...</div>;
    if (!business) return <div className="text-center p-10 text-red-500">İşletme bulunamadı.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-2">{business.name}</h2>
                    <p className="text-indigo-100">{business.description}</p>
                    <div className="mt-4 flex justify-center gap-4 text-sm opacity-90">
                        <span>📍 {business.address}</span>
                        <span>📞 {business.phone}</span>
                    </div>
                </div>

                {/* Steps Indicator */}
                <div className="flex border-b border-gray-100">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors
                ${step >= s ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'}`}
                        >
                            Adım {s}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold mb-6">Hizmet Seçin</h3>
                            <div className="grid gap-4">
                                {services.map((service) => (
                                    <button
                                        key={service.id}
                                        onClick={() => {
                                            setSelectedService(service);
                                            setStep(2);
                                        }}
                                        className="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                                    >
                                        <div>
                                            <div className="font-semibold text-gray-900 group-hover:text-indigo-700">{service.name}</div>
                                            <div className="text-sm text-gray-500">{service.durationMinutes} dakika</div>
                                        </div>
                                        <div className="font-bold text-indigo-600">{service.price} ₺</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4 hover:text-gray-700 flex items-center gap-1">
                                <span>←</span> Geri
                            </button>

                            <h3 className="text-xl font-semibold mb-6">Tarih ve Saat Seçin</h3>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Saat</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Slots
                                            businessId={businessId}
                                            serviceId={selectedService?.id}
                                            date={selectedDate}
                                            selectedSlot={selectedSlot}
                                            onSelect={setSelectedSlot}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!selectedSlot}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Devam Et
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <button onClick={() => setStep(2)} className="text-sm text-gray-500 mb-4 hover:text-gray-700 flex items-center gap-1">
                                <span>←</span> Geri
                            </button>

                            <h3 className="text-xl font-semibold mb-6">Bilgilerinizi Girin</h3>

                            <div className="space-y-4">
                                <Input
                                    label="Ad Soyad"
                                    placeholder="Örn: Ahmet Yılmaz"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                />
                                <Input
                                    label="Telefon"
                                    placeholder="555 123 45 67"
                                    value={customerDetails.phone}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                />
                                <Input
                                    label="E-posta"
                                    type="email"
                                    placeholder="ahmet@ornek.com"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Not (Opsiyonel)</label>
                                    <textarea
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        rows="3"
                                        value={customerDetails.note}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, note: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleSubmit}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Randevuyu Onayla
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Randevunuz Alındı!</h3>
                            <p className="text-gray-600 mb-8">
                                Randevu detaylarınız e-posta adresinize gönderildi.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Yeni Randevu Al
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
