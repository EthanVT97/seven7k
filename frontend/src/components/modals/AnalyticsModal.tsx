import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseClass?: string;
    contentClass?: string;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, baseClass, contentClass }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                enabled: formData.get('analyticsEnabled') === 'on',
                retentionPeriod: parseInt(formData.get('dataRetention') as string),
                tracking: formData.getAll('tracking')
            };

            const response = await fetch('/api/settings/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save analytics settings');

            alert('Analytics settings saved successfully!');
            onClose();
        } catch (error) {
            console.error('Analytics settings error:', error);
            alert('Failed to save analytics settings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal ${baseClass}`} onClick={onClose}>
            <div className={`modal-content ${contentClass}`} onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">Analytics Settings</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                name="analyticsEnabled"
                                className="mr-2"
                            />
                            Enable Analytics
                        </label>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="dataRetention">
                            Data Retention Period
                        </label>
                        <select
                            id="dataRetention"
                            name="dataRetention"
                            className="form-input"
                            defaultValue="30"
                        >
                            <option value="30">30 days</option>
                            <option value="60">60 days</option>
                            <option value="90">90 days</option>
                            <option value="180">180 days</option>
                            <option value="365">1 year</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tracking Preferences</label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="tracking"
                                    value="usage"
                                    defaultChecked
                                    className="mr-2"
                                />
                                Usage Data
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="tracking"
                                    value="performance"
                                    defaultChecked
                                    className="mr-2"
                                />
                                Performance Metrics
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="tracking"
                                    value="errors"
                                    defaultChecked
                                    className="mr-2"
                                />
                                Error Reports
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AnalyticsModal; 