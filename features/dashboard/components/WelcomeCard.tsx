import React from 'react';

const WelcomeIllustration = () => (
    <img 
        src="https://cdni.iconscout.com/illustration/premium/thumb/business-deal-2973909-2477182.png" 
        alt="Welcome"
        className="absolute bottom-0 right-0 w-48 h-48 hidden sm:block opacity-70 dark:opacity-50"
    />
);

interface WelcomeCardProps {
    userName: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => {
    return (
        <div className="relative p-6 bg-primary-lighter dark:bg-primary-dark/20 rounded-lg shadow-sm overflow-hidden h-full flex flex-col justify-center">
            <div>
                <h2 className="text-2xl font-bold text-primary-darker dark:text-white">
                    Welcome back 👋 {userName}
                </h2>
                <p className="mt-2 text-primary-dark dark:text-primary-light max-w-md">
                    Your dashboard is ready with the latest updates on orders, revenue, and tenants. Let's make today productive!
                </p>
            </div>
            <WelcomeIllustration />
        </div>
    );
};

export default WelcomeCard;