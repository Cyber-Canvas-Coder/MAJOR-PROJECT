import { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, IconButton, Paper, Typography, alpha } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import SensorChart from "./components/SensorChart";
import SensorCards from "./components/SensorCards";

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [sensorData, setSensorData] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#2196f3",
      },
      secondary: {
        main: "#f50057",
      },
      background: {
        default: darkMode ? "#0a1929" : "#f5f5f7",
        paper: darkMode ? "#1a2027" : "#ffffff",
      },
    },
    typography: {
      h4: {
        fontWeight: 600,
        letterSpacing: "-0.5px",
      },
      h6: {
        fontWeight: 500,
      },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow: `0 8px 24px ${alpha("#000000", 0.12)}`,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: "transform 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
            },
          },
        },
      },
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/sensor_data.json");
        const data = await response.json();
        setSensorData(data);
      } catch (error) {
        console.error("Error fetching sensor data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          background: (theme) =>
            darkMode
              ? `linear-gradient(45deg, ${
                  theme.palette.background.default
                } 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`
              : `linear-gradient(45deg, ${
                  theme.palette.background.default
                } 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            height: "72px",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backdropFilter: "blur(8px)",
            backgroundColor: (theme) =>
              alpha(theme.palette.background.default, 0.8),
          }}
        >
          <Typography variant="h4" component="h1" noWrap>
            Sensor Dashboard
          </Typography>
          <IconButton
            onClick={() => setDarkMode(!darkMode)}
            color="inherit"
            sx={{
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            mt: "72px",
            overflow: "auto",
            position: "relative",
          }}
        >
          {sensorData ? (
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <SensorCards data={sensorData} />
              </Box>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.9),
                  backdropFilter: "blur(10px)",
                }}
              >
                <SensorChart data={sensorData} />
              </Paper>
            </Box>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5">Loading sensor data...</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
