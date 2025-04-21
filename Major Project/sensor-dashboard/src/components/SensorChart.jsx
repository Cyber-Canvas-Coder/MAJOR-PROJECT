import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Box, Typography, useTheme, Paper, Grid } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MAX_DATA_POINTS = 30;

const SingleChart = ({ title, data, labels, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: data,
        borderColor: color,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(
            0,
            0,
            0,
            context.chart.height
          );
          gradient.addColorStop(0, `${color}40`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: color,
        pointHoverBorderColor: isDark ? "#1a2027" : "#ffffff",
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          maxTicksLimit: 6,
          color: theme.palette.text.secondary,
          font: {
            size: 11,
            family: theme.typography.fontFamily,
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            size: 11,
            family: theme.typography.fontFamily,
          },
          padding: 10,
          callback: (value) => {
            if (title.includes("RPM")) return `${value}`;
            if (title.includes("Temperature")) return `${value}°C`;
            if (title.includes("Current")) return `${value}A`;
            return value;
          },
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDark
          ? "rgba(0, 0, 0, 0.9)"
          : "rgba(255, 255, 255, 0.95)",
        titleColor: isDark ? "#fff" : "#000",
        bodyColor: isDark ? "#fff" : "#000",
        titleFont: {
          size: 13,
          weight: "600",
          family: theme.typography.fontFamily,
        },
        bodyFont: {
          size: 12,
          family: theme.typography.fontFamily,
        },
        padding: {
          top: 12,
          right: 16,
          bottom: 12,
          left: 16,
        },
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            let value = context.parsed.y;
            if (title.includes("RPM")) return `RPM: ${value.toFixed(0)}`;
            if (title.includes("Temperature"))
              return `Temperature: ${value.toFixed(1)}°C`;
            if (title.includes("Current"))
              return `Current: ${value.toFixed(2)}A`;
            return value;
          },
        },
      },
    },
  };

  const currentValue = data[data.length - 1];
  const formattedValue = currentValue?.toFixed(
    title.includes("Current") ? 2 : title.includes("Temperature") ? 1 : 0
  );
  const unit = title.includes("RPM")
    ? "RPM"
    : title.includes("Temperature")
    ? "°C"
    : "A";

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        borderRadius: 3,
        background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        backdropFilter: "blur(20px)",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: color,
              opacity: 0.9,
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: theme.palette.text.primary,
              display: "flex",
              alignItems: "baseline",
            }}
          >
            {formattedValue}
            <Typography
              component="span"
              sx={{
                fontSize: "1rem",
                fontWeight: 500,
                color: theme.palette.text.secondary,
                ml: 1,
              }}
            >
              {unit}
            </Typography>
          </Typography>
        </Box>

        {/* Chart Section */}
        <Box sx={{ height: "300px", width: "100%" }}>
          <Line data={chartData} options={options} />
        </Box>
      </Box>
    </Paper>
  );
};

const SensorChart = ({ data }) => {
  const [historicalData, setHistoricalData] = useState({
    timestamps: [],
    rpm: [],
    temperature: [],
    current: [],
  });

  useEffect(() => {
    if (data) {
      setHistoricalData((prev) => {
        const newTimestamps = [...prev.timestamps, data.timestamp].slice(
          -MAX_DATA_POINTS
        );
        const newRpm = [...prev.rpm, data.rpm].slice(-MAX_DATA_POINTS);
        const newTemperature = [...prev.temperature, data.temperature].slice(
          -MAX_DATA_POINTS
        );
        const newCurrent = [...prev.current, data.current].slice(
          -MAX_DATA_POINTS
        );

        return {
          timestamps: newTimestamps,
          rpm: newRpm,
          temperature: newTemperature,
          current: newCurrent,
        };
      });
    }
  }, [data]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <SingleChart
            title="RPM"
            data={historicalData.rpm}
            labels={historicalData.timestamps}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12}>
          <SingleChart
            title="Temperature (°C)"
            data={historicalData.temperature}
            labels={historicalData.timestamps}
            color="#f50057"
          />
        </Grid>
        <Grid item xs={12}>
          <SingleChart
            title="Current (A)"
            data={historicalData.current}
            labels={historicalData.timestamps}
            color="#ffb74d"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SensorChart;
