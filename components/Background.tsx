import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* Soft animated gradient clouds */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)',
          animation: 'float-cloud 20s ease-in-out infinite alternate'
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 60% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 40% 70%, rgba(219, 39, 119, 0.08) 0%, transparent 50%)',
          animation: 'float-cloud 15s ease-in-out infinite alternate-reverse'
        }}
      />

      {/* Subtle floating orbs */}
      <div
        className="absolute w-96 h-96 rounded-full blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
          top: '20%',
          left: '10%',
          animation: 'gentle-float 25s ease-in-out infinite'
        }}
      />

      <div
        className="absolute w-80 h-80 rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.18) 0%, transparent 70%)',
          bottom: '20%',
          right: '15%',
          animation: 'gentle-float 20s ease-in-out infinite reverse'
        }}
      />

      <div
        className="absolute w-72 h-72 rounded-full blur-[90px]"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'gentle-float 30s ease-in-out infinite'
        }}
      />

      {/* Soft floating particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            background: 'rgba(255, 255, 255, 0.3)',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `gentle-drift ${15 + Math.random() * 15}s ease-in-out infinite`,
            animationDelay: `-${Math.random() * 10}s`,
            boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.2)'
          }}
        />
      ))}
    </div>
  );
};