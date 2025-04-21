import { Grid, Paper, Typography, Box } from "@mui/material";
import SpeedIcon from "@mui/icons-material/Speed";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import BoltIcon from "@mui/icons-material/Bolt";

const SensorCard = ({ title, value, unit, icon: Icon, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      height: "100%",
      minHeight: "200px",
      background: `linear-gradient(45deg, ${color}22 30%, ${color}11 90%)`,
      border: `1px solid ${color}33`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-5px)",
        boxShadow: `0 8px 24px ${color}22`,
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Icon sx={{ fontSize: 48, color: color }} />
      <Typography variant="h6" sx={{ color: color }}>
        {title}
      </Typography>
      <Typography
        variant="h3"
        component="div"
        sx={{
          fontWeight: "bold",
          color: color,
        }}
      >
        {typeof value === "number" ? value.toFixed(2) : value}
      </Typography>
      <Typography variant="h6" sx={{ color: `${color}99` }}>
        {unit}
      </Typography>
    </Box>
  </Paper>
);

const SensorCards = ({ data }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <SensorCard
          title="RPM"
          value={data.rpm}
          unit="rpm"
          icon={SpeedIcon}
          color="#2196f3"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <SensorCard
          title="Temperature"
          value={data.temperature}
          unit="°C"
          icon={ThermostatIcon}
          color="#f50057"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <SensorCard
          title="Current"
          value={data.current}
          unit="A"
          icon={BoltIcon}
          color="#ffb74d"
        />
      </Grid>
    </Grid>
  );
};

export default SensorCards;
