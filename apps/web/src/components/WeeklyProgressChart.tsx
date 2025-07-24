import { useState, useEffect, useRef } from 'react';
import {
  generateWeeklyData,
  calculateTrendData,
  getChartDimensions,
  formatChartValue,
  getCompletionColor,
  WeeklyData,
  ChartConfig,
  defaultChartConfig,
  format
} from '@/utils/chartUtils';

interface WeeklyProgressChartProps {
  logs: any[];
  goals: any[];
  weeksCount?: number;
  height?: number;
  showTrend?: boolean;
  interactive?: boolean;
}

interface TooltipData {
  x: number;
  y: number;
  week: WeeklyData;
  visible: boolean;
}

export function WeeklyProgressChart({ 
  logs, 
  goals, 
  weeksCount = 12, 
  height = 400,
  showTrend = true,
  interactive = true 
}: WeeklyProgressChartProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [tooltip, setTooltip] = useState<TooltipData>({ x: 0, y: 0, week: {} as WeeklyData, visible: false });
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>(defaultChartConfig);

  useEffect(() => {
    const data = generateWeeklyData(logs, goals, weeksCount);
    setWeeklyData(data);
  }, [logs, goals, weeksCount]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const isMobile = window.innerWidth < 768;
        const config = getChartDimensions(containerWidth, isMobile);
        config.height = height;
        setChartConfig(config);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  const trendData = calculateTrendData(weeklyData);

  const chartWidth = chartConfig.width - chartConfig.margin.left - chartConfig.margin.right;
  const chartHeight = chartConfig.height - chartConfig.margin.top - chartConfig.margin.bottom;

  const maxValue = Math.max(...weeklyData.map(w => Math.max(w.totalValue, w.totalTarget)), 100);
  const xScale = chartWidth / Math.max(weeklyData.length - 1, 1);
  const yScale = chartHeight / maxValue;

  const handleMouseMove = (event: React.MouseEvent, week: WeeklyData, index: number) => {
    if (!interactive) return;

    const rect = chartRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        week,
        visible: true
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const filteredData = selectedGoal 
    ? weeklyData.map(week => ({
        ...week,
        goals: week.goals.filter(g => g.goalId === selectedGoal)
      }))
    : weeklyData;

  return (
    <div ref={containerRef} className="w-full">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
            <p className="text-sm text-gray-600">Goal completion over the last {weeksCount} weeks</p>
          </div>
          
          {showTrend && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center">
                  <span className={`text-sm font-medium ${
                    trendData.trend === 'up' ? 'text-green-600' : 
                    trendData.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trendData.trend === 'up' ? '↗' : trendData.trend === 'down' ? '↘' : '→'}
                    {trendData.changePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Avg: {trendData.averageCompletion.toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Goal Filter */}
        {goals.length > 1 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGoal(null)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  selectedGoal === null 
                    ? 'bg-primary-100 border-primary-300 text-primary-700'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Goals
              </button>
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    selectedGoal === goal.id
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {goal.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="relative">
          <svg
            ref={chartRef}
            width={chartConfig.width}
            height={chartConfig.height}
            className="overflow-visible"
          >
            {/* Grid lines */}
            <g transform={`translate(${chartConfig.margin.left}, ${chartConfig.margin.top})`}>
              {/* Horizontal grid lines */}
              {[0, 25, 50, 75, 100].map(percentage => {
                const y = chartHeight - (percentage / 100) * chartHeight;
                return (
                  <g key={percentage}>
                    <line
                      x1={0}
                      y1={y}
                      x2={chartWidth}
                      y2={y}
                      stroke={chartConfig.colors.grid}
                      strokeWidth={1}
                      strokeDasharray={percentage === 0 ? "none" : "2,2"}
                    />
                    <text
                      x={-10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-xs fill-gray-500"
                    >
                      {percentage}%
                    </text>
                  </g>
                );
              })}

              {/* Vertical grid lines and labels */}
              {weeklyData.map((week, index) => {
                const x = index * xScale;
                return (
                  <g key={index}>
                    <line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={chartHeight}
                      stroke={chartConfig.colors.grid}
                      strokeWidth={1}
                      strokeDasharray="2,2"
                    />
                    <text
                      x={x}
                      y={chartHeight + 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-500"
                    >
                      {week.week}
                    </text>
                  </g>
                );
              })}

              {/* Progress bars */}
              {weeklyData.map((week, index) => {
                const x = index * xScale;
                const barWidth = Math.max(xScale * 0.6, 20);
                const barHeight = (week.completionPercentage / 100) * chartHeight;
                const barY = chartHeight - barHeight;
                
                return (
                  <g key={index}>
                    {/* Background bar */}
                    <rect
                      x={x - barWidth / 2}
                      y={0}
                      width={barWidth}
                      height={chartHeight}
                      fill="rgba(229, 231, 235, 0.3)"
                      rx={2}
                    />
                    
                    {/* Progress bar */}
                    <rect
                      x={x - barWidth / 2}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={getCompletionColor(week.completionPercentage, chartConfig.colors)}
                      rx={2}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                      onMouseMove={(e) => handleMouseMove(e, week, index)}
                      onMouseLeave={handleMouseLeave}
                    />
                    
                    {/* Completion percentage label */}
                    {week.completionPercentage > 0 && (
                      <text
                        x={x}
                        y={barY - 5}
                        textAnchor="middle"
                        className="text-xs font-medium fill-gray-700"
                      >
                        {Math.round(week.completionPercentage)}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Trend line */}
              {showTrend && weeklyData.length > 1 && (
                <path
                  d={weeklyData.map((week, index) => {
                    const x = index * xScale;
                    const y = chartHeight - (week.completionPercentage / 100) * chartHeight;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke={chartConfig.colors.primary}
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray="4,4"
                  opacity={0.7}
                />
              )}
            </g>
          </svg>

          {/* Tooltip */}
          {tooltip.visible && interactive && (
            <div
              className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
              style={{
                left: Math.min(tooltip.x + 10, chartConfig.width - 200),
                top: Math.max(tooltip.y - 10, 0)
              }}
            >
              <div className="text-sm font-medium text-gray-900 mb-2">
                Week of {format(tooltip.week.startDate, 'MMM dd')}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion:</span>
                  <span className="font-medium">
                    {Math.round(tooltip.week.completionPercentage)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="font-medium">
                    {tooltip.week.totalValue.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium">
                    {tooltip.week.totalTarget.toFixed(1)}
                  </span>
                </div>
                {tooltip.week.goals.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-gray-600 mb-1">Goals:</div>
                    {tooltip.week.goals.slice(0, 3).map(goal => (
                      <div key={goal.goalId} className="flex justify-between">
                        <span className="text-gray-600 truncate">
                          {goal.goalTitle}:
                        </span>
                        <span className="font-medium ml-2">
                          {Math.round(goal.percentage)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>100%+ Complete</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>80-99% Complete</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>60-79% Complete</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>&lt;60% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
