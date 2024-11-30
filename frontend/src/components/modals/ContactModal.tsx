import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseClass?: string;
    contentClass?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({
    isOpen,
    onClose,
    baseClass,
    contentClass
}) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to send message');

            alert('Message sent successfully!');
            onClose();
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Contact form error:', error);
            alert('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = `
        w-full px-3 py-2 rounded-md border
        ${theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'}
        focus:outline-none focus:ring-2 focus:ring-indigo-500
    `;

    const buttonClass = `
        w-full px-4 py-2 rounded-md font-medium
        ${loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700'}
        text-white transition-colors duration-200
    `;

    return (
        <div className={baseClass} onClick={onClose}>
            <div className={contentClass} onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            className={inputClass}
                            required
                            minLength={2}
                            maxLength={100}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            name="email"
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Subject</label>
                        <input
                            type="text"
                            name="subject"
                            className={inputClass}
                            required
                            minLength={5}
                            maxLength={200}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Message</label>
                        <textarea
                            name="message"
                            className={`${inputClass} resize-none min-h-[100px]`}
                            required
                            minLength={10}
                            maxLength={1000}
                        />
                    </div>
                    <button
                        type="submit"
                        className={buttonClass}
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactModal; 