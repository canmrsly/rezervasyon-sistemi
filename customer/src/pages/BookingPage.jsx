import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { businessService, reservationService } from '../services/api';
import { Calendar, Clock, CheckCircle, User, Phone, Store } from 'lucide-react';
import Input from '../components/Input';
import ReCAPTCHA from 'react-google-recaptcha';

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Slots = ({ businessId, serviceId, date, staffId, selectedSlot, onSelect }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!businessId || !serviceId || !date) return;

        const fetchSlots = async () => {
            setLoading(true);
            try {
                const data = await businessService.getAvailableSlots(businessId, serviceId, date, staffId);
                setSlots(data);
            } catch (error) {
                console.error('Slot hatası:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [businessId, serviceId, date, staffId]);

    if (loading) return <div className="col-span-full text-center py-8 text-gray-500">Saatler yükleniyor...</div>;
    if (slots.length === 0) return <div className="col-span-full text-center py-8 text-gray-500">Uygun saat bulunamadı.</div>;

    return slots.map((slot) => (
        <button
            key={slot.start}
            onClick={() => slot.isAvailable && onSelect(slot)}
            disabled={!slot.isAvailable}
            className={`p-4 text-base font-medium rounded-xl border-2 transition-all active:scale-95
        ${selectedSlot?.start === slot.start
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : slot.isAvailable
                        ? 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-md'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'}`}
        >
            <div className="flex flex-col gap-1">
                <Clock size={16} className="mx-auto" />
                <span className={slot.isAvailable ? '' : 'line-through'}>{slot.formatted.split(' ')[1]}</span>
            </div>
        </button>
    ));
};

const BookingPage = () => {
    const { businessId } = useParams();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [business, setBusiness] = useState(null);
    const [services, setServices] = useState([]);
    const [staff, setStaff] = useState([]);

    // Selections
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        phone: '',
        note: ''
    });
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [busData, servData, staffData] = await Promise.all([
                    businessService.getBusiness(businessId),
                    businessService.getServices(businessId),
                    businessService.getStaff(businessId)
                ]);
                setBusiness(busData);
                setServices(servData);
                setStaff(staffData);
            } catch (error) {
                console.error('Veri yüklenirken hata:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [businessId]);

    const validatePhone = (phone) => {
        // Türk telefon numarası validasyonu: 5XX XXX XX XX veya 05XX XXX XX XX
        const cleaned = phone.replace(/\s/g, '');
        const turkishPhoneRegex = /^(05|5)\d{9}$/;

        if (!cleaned) {
            setPhoneError('Telefon numarası gereklidir');
            return false;
        }

        if (!turkishPhoneRegex.test(cleaned)) {
            setPhoneError('Geçerli bir telefon numarası girin (örn: 555 123 45 67)');
            return false;
        }

        setPhoneError('');
        return true;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setCustomerDetails({ ...customerDetails, phone: value });
        if (value) validatePhone(value);
    };

    const handleSubmit = async () => {
        if (!validatePhone(customerDetails.phone)) {
            return;
        }

        try {
            const payload = {
                businessId: parseInt(businessId),
                serviceId: selectedService.id,
                startTime: selectedSlot.start,
                staffMemberId: selectedStaff?.id || null,
                customerName: customerDetails.name,
                customerPhone: customerDetails.phone.replace(/\s/g, ''),
                captchaToken: captchaToken
            };

            await reservationService.create(payload);
            setStep(4);
        } catch (error) {
            alert('Randevu oluşturulurken bir hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen bg-gray-50"><div className="text-lg">Yükleniyor...</div></div>;
    if (!business) return <div className="text-center p-10 text-red-500">İşletme bulunamadı.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-3 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header Card */}
                <div className="bg-white border-b-4 border-blue-600 p-6 sm:p-8 rounded-2xl shadow-lg mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Store className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{business.name}</h1>
                    </div>
                    {business.description && <p className="text-gray-600 mb-4">{business.description}</p>}
                    <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-500">
                        {business.address && <span>📍 {business.address}</span>}
                        {business.phone && <span>📞 {business.phone}</span>}
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="flex gap-2 mb-6 px-1">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex-1">
                            <div className={`h-2 rounded-full transition-all ${step >= s ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        </div>
                    ))}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-6 sm:p-8">
                        {/* Step 1: Services */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="text-blue-600" size={24} />
                                    Hizmet Seçin
                                </h2>
                                <div className="grid gap-4">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            onClick={() => {
                                                setSelectedService(service);
                                                setStep(2);
                                            }}
                                            className="flex items-center justify-between p-5 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all active:scale-98 text-left group bg-white shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex-1">
                                                <div className="font-bold text-lg text-gray-900 group-hover:text-blue-700 mb-1">{service.name}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {service.durationMinutes} dakika
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold text-blue-600">{service.price} ₺</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Date & Time */}
                        {step === 2 && (
                            <div>
                                <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-6 hover:text-gray-700 flex items-center gap-1 active:scale-95 transition">
                                    <span>←</span> Geri
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="text-blue-600" size={24} />
                                    Tarih ve Saat
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 mb-3">Tarih Seçin</label>
                                        <input
                                            type="date"
                                            min={new Date().toISOString().split('T')[0]}
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>

                                    {/* Staff Selection */}
                                    {staff.length > 0 && (
                                        <div>
                                            <label className="block text-base font-semibold text-gray-700 mb-3">Personel (Opsiyonel)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                <button
                                                    onClick={() => setSelectedStaff(null)}
                                                    className={`p-4 text-sm font-medium rounded-xl border-2 transition-all active:scale-95
                                                        ${!selectedStaff ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50'}`}
                                                >
                                                    <User size={16} className="mx-auto mb-1" />
                                                    Fark Etmez
                                                </button>
                                                {staff.map((s) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSelectedStaff(s)}
                                                        className={`p-4 text-sm font-medium rounded-xl border-2 transition-all active:scale-95
                                                            ${selectedStaff?.id === s.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50'}`}
                                                    >
                                                        <User size={16} className="mx-auto mb-1" />
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-base font-semibold text-gray-700 mb-3">Saat Seçin</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            <Slots
                                                businessId={businessId}
                                                serviceId={selectedService?.id}
                                                date={selectedDate}
                                                staffId={selectedStaff?.id}
                                                selectedSlot={selectedSlot}
                                                onSelect={setSelectedSlot}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={!selectedSlot}
                                        className="w-full py-4 sm:py-5 text-lg font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 shadow-md"
                                    >
                                        Devam Et →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Customer Details */}
                        {step === 3 && (
                            <div>
                                <button onClick={() => setStep(2)} className="text-sm text-gray-500 mb-6 hover:text-gray-700 flex items-center gap-1 active:scale-95 transition">
                                    <span>←</span> Geri
                                </button>

                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="text-blue-600" size={24} />
                                    Bilgileriniz
                                </h2>

                                <div className="space-y-5">
                                    <Input
                                        label="Ad Soyad"
                                        placeholder="Örn: Ahmet Yılmaz"
                                        value={customerDetails.name}
                                        onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                        required
                                    />
                                    <div>
                                        <Input
                                            label="Telefon"
                                            placeholder="555 123 45 67"
                                            value={customerDetails.phone}
                                            onChange={handlePhoneChange}
                                            required
                                        />
                                        {phoneError && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <span>⚠️</span> {phoneError}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <div className="flex justify-center">
                                        {recaptchaSiteKey ? (
                                            <ReCAPTCHA
                                                sitekey={recaptchaSiteKey}
                                                onChange={(token) => setCaptchaToken(token)}
                                            />
                                        ) : (
                                            <div className="text-sm text-red-500 text-center">
                                                reCAPTCHA site anahtarı tanımlı değil. Lütfen VITE_RECAPTCHA_SITE_KEY ayarını yapın.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!recaptchaSiteKey || !captchaToken || !customerDetails.name || !customerDetails.phone || phoneError}
                                        className="w-full py-4 sm:py-5 text-lg font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-xl transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle size={24} />
                                        Randevuyu Onayla
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {step === 4 && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Randevunuz Alındı!</h2>
                                <p className="text-gray-600 mb-8 text-lg">
                                    Randevunuz başarıyla oluşturuldu. Telefon numaranıza bilgilendirme yapılacaktır.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-95"
                                >
                                    Yeni Randevu Al
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Randevu sistemimizle hızlı ve kolay rezervasyon yapın</p>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
