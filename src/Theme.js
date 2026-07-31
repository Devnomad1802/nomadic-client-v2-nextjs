import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme1 = createTheme({
  palette: {
    background: {
      default: "#1E1E1E",
      color: "#fff",
    },
    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.60)",
    },
    primary: {
      main: "#58C5DA",
    },
  },
  typography: {
    fontFamily: [" 'Inter', sans-serif", "'Playfair', sans-serif"].join(","),
    h1: {
      fontFamily: "Inter, sans-serif",
      fontSize: "54px",
      fontWeight: "900",
    },
    h2: {
      fontFamily: "Inter, sans-serif",
      fontSize: "40px",
      fontWeight: "700",
    },
    h3: {
      fontFamily: "Inter, sans-serif",
      fontSize: "32px",
      fontWeight: "700",
    },
    h4: {
      fontFamily: "Inter, sans-serif",
      fontSize: "22px",
    },

    body: {
      fontFamily: "Inter, sans-serif",
      fontSize: "16px",
    },
    body1: {
      color: "#FFF",
      textAlign: "center",
      fontFamily: "Inter",
      fontSize: "16px",
      fontStyle: "normal",
      fontWeight: 400,
      lineHeight: "140%",
    },
    body2: {
      fontFamily: "Inter, sans-serif",
      fontStyle: "normal",
      fontWeight: 400,
      color: "#D6D6D6",
    },
    heading1: {
      fontFamily: "Inter",
      fontSize: "48px",
      fontStyle: "normal",
      fontWeight: 700,
      lineHeight: "140%",
      textAlign: "center",
      textShadow:
        "0px 1px 3px rgba(0, 0, 0, 0.10), 0px 1px 2px rgba(0, 0, 0, 0.10)",
    },
  },
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: "simplebtn" },
          style: {
            textTransform: "capitalize",
            minWidth: "140.6px",
            fontSize: "14px",
            borderRadius: "32px",
            fontFamily: "Inter",
            px: 2,
            color: "#CD482A",
            height: "45px",
            border: "1.5px solid #CD482A",
            background: "#FBFBFB",
            "&:hover": {
              background: "#393938",
              color: "#fff",
              border: "1.5px solid #393938",
            },
          },
        },
        {
          props: { variant: "borderbtn" },
          style: {
            border: "2px solid #2CBCA5",
            padding: "8px 35px",
            fontFamily: "Inter, sans-serif",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: "16px",
            background: "transparent",
            borderRadius: "18px",
            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            textTransform: "capitalize",
            color: "#F4F3EF",
            "&:hover": {
              background: "transparent",
            },
          },
        },
        {
          props: { variant: "tablebtn" },
          style: {
            border: "2px solid #2CBCA5",
            padding: "2px 35px",
            fontFamily: "Inter, sans-serif",
            fontStyle: "normal",
            fontWeight: "600",
            fontSize: "12px",
            background: "transparent",
            borderRadius: "18px",
            textShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            textTransform: "capitalize",
            color: "#F4F3EF",
            "&:hover": {
              background: "transparent",
            },
          },
        },
      ],
    },
  },

  // Date
  overrides: {
    MuiPickersCalendarWeek: {
      root: {
        "&:hover": {
          backgroundColor: "#E0E0E0",
        },
      },
    },
    MuiPickersDay: {
      day: {
        color: "#000",
      },
      daySelected: {
        backgroundColor: "#F8F8F8",
        color: "#000",
      },
    },
  },
});

theme1.overrides = {
  MuiCssBaseline: {
    "@global": {
      body: {
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#080A0B",
        color: "#fff",
      },
      ".img-fluid": {
        maxWidth: "100%",
        height: "auto",
      },
    },
  },
};

const theme = responsiveFontSizes(theme1);

export default theme;
