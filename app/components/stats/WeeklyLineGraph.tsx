// Weekly line graph component for tracking habits
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DataPoint {
  day: string;
  value: number;
}

interface WeeklyLineGraphProps {
  data: DataPoint[];
  color: string;
  label: string;
  unit: string;
  maxValue?: number;
}

export default function WeeklyLineGraph({ data, color, label, unit, maxValue }: WeeklyLineGraphProps) {
  // Graph dimensions
  const graphWidth = SCREEN_WIDTH * 0.8;
  const graphHeight = 150;
  const padding = 30;
  const plotWidth = graphWidth - padding * 2;
  const plotHeight = graphHeight - padding * 2;

  // Calculate max value for scaling
  const dataMax = Math.max(...data.map(d => d.value), 1);
  const yMax = maxValue || Math.ceil(dataMax * 1.2);

  // Calculate points for the line
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * plotWidth;
    const y = padding + plotHeight - (point.value / yMax) * plotHeight;
    return { x, y, value: point.value, day: point.day };
  });

  // Create polyline points string
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Svg width={graphWidth} height={graphHeight}>
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding + plotHeight * (1 - ratio);
          return (
            <Line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={graphWidth - padding}
              y2={y}
              stroke="#E0E0E0"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Line graph */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={color}
            stroke="#FFF"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels (days) */}
        {points.map((point, index) => (
          <SvgText
            key={`day-${index}`}
            x={point.x}
            y={graphHeight - 5}
            fontSize="10"
            fill="#666"
            textAnchor="middle"
          >
            {point.day}
          </SvgText>
        ))}

        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = padding + plotHeight * (1 - ratio);
          const value = Math.round(yMax * ratio);
          return (
            <SvgText
              key={`y-label-${i}`}
              x={padding - 10}
              y={y + 4}
              fontSize="10"
              fill="#666"
              textAnchor="end"
            >
              {value}
            </SvgText>
          );
        })}
      </Svg>

      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  unit: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#999',
    marginTop: 5,
  },
});
