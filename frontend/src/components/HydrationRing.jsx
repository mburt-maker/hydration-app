import './HydrationRing.css';

const HydrationRing = ({ percentage, totalOz, goal, size = 220 }) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const center = size / 2;

  return (
    <div className="hydration-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e8f5e9"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className="progress-ring"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8E6CF" />
            <stop offset="100%" stopColor="#88D8B0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ring-content">
        <div className="ring-percentage">{percentage}%</div>
        <div className="ring-details">
          {totalOz} / {goal} oz
        </div>
        {percentage >= 100 && (
          <div className="ring-complete">Goal met!</div>
        )}
      </div>
    </div>
  );
};

export default HydrationRing;
