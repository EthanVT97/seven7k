import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseClass?: string;
    contentClass?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, baseClass, contentClass }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                whatsapp: {
                    token: formData.get('whatsapp.token'),
                    phoneId: formData.get('whatsapp.phoneId')
                },
                telegram: {
                    token: formData.get('telegram.token'),
                    webhook: formData.get('telegram.webhook')
                },
                line: {
                    token: formData.get('line.token'),
                    secret: formData.get('line.secret')
                }
            };

            const response = await fetch('/api/settings/platforms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save platform settings');

            alert('Platform settings saved successfully!');
            onClose();
        } catch (error) {
            console.error('Platform settings error:', error);
            alert('Failed to save platform settings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal show ${baseClass}`} onClick={onClose}>
            <div className={`modal-content ${contentClass}`} onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">Platform Settings</h2>
                <form onSubmit={handleSubmit}>
                    {/* WhatsApp Settings */}
                    <div className="form-section">
                        <h3 className="text-lg font-medium mb-3">WhatsApp</h3>
                        <div className="form-group">
                            <label className="form-label" htmlFor="whatsappToken">
                                Access Token
                            </label>
                            <input
                                type="password"
                                id="whatsappToken"
                                name="whatsapp.token"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="whatsappPhone">
                                Phone Number ID
                            </label>
                            <input
                                type="text"
                                id="whatsappPhone"
                                name="whatsapp.phoneId"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Telegram Settings */}
                    <div className="form-section">
                        <h3 className="text-lg font-medium mb-3">Telegram</h3>
                        <div className="form-group">
                            <label className="form-label" htmlFor="telegramToken">
                                Bot Token
                            </label>
                            <input
                                type="password"
                                id="telegramToken"
                                name="telegram.token"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="telegramWebhook">
                                Webhook URL
                            </label>
                            <input
                                type="url"
                                id="telegramWebhook"
                                name="telegram.webhook"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* LINE Settings */}
                    <div className="form-section">
                        <h3 className="text-lg font-medium mb-3">LINE</h3>
                        <div className="form-group">
                            <label className="form-label" htmlFor="lineChannelToken">
                                Channel Token
                            </label>
                            <input
                                type="password"
                                id="lineChannelToken"
                                name="line.token"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="lineChannelSecret">
                                Channel Secret
                            </label>
                            <input
                                type="password"
                                id="lineChannelSecret"
                                name="line.secret"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Platform Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal; 