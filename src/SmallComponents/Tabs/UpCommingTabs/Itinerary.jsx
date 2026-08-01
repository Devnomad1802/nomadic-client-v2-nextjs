"use client";

import {
  Accordion,
  AccordionSummary,
  Box,
  Button,
  IconButton,
  Typography,
} from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Itinerary = ({ ItineraryFile, addDays }) => {
  const AddDays = JSON.parse(addDays);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: "18px",
              md: "23px",
            },
            fontWeight: "500",
            color: "#000",
            textAlign: { xs: "center", md: "left" },
          }}
        >
          Itinerary
        </Typography>
        <Button
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0px 10px",
            background: "none",
            "&:hover": { background: "none" },
          }}
        >
          <IconButton
            size="small"
            sx={{
              background: "#3E92CC",
              "&:hover": {
                background: "#286894",
              },
            }}
          >
            <FileDownloadOutlinedIcon
              sx={{ color: "#fff", fontSize: "20px" }}
            />
          </IconButton>
          <Typography
            sx={{
              color: "#0081AF",
              textTransform: "lowercase",
              fontSize: { xs: "14px", sm: "16px" },
            }}
          >
            Download Itinerary
          </Typography>
        </Button>
      </Box>
      <Box sx={{ mt: 5 }}>
        {AddDays?.map(({ title, description }, index) => {
          return (
            <Accordion
              key={index}
              sx={{
                background: "transparent",
                borderBottom: "1px solid #EFEAE1",
                boxShadow: "none",
                borderTop: "transparent",
                boxSizing: "border-box",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: { xs: "center", sm: "center" },
                    gap: "0px 10px",
                    // border: "2px solid red",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <Box
                    sx={{
                      border: "2px solid #EFEAE1",
                      borderRadius: "30px",
                      py: { xs: 0.5, sm: 1 },
                      px: { xs: 1.5, sm: 2 },
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#3E92CC",
                        fontSize: { xs: "14px", md: "19px" },
                      }}
                    >
                      Day {index + 1}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      maxWidth: "70%",
                      overflow: "hidden",
                      // textOverflow: "ellipsis",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: "500",
                        color: "#4E483D",
                        whiteSpace: "nowrap",
                        fontSize: { xs: "13px", sm: "16px" },
                        textAlign: "left",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {title}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ color: "#6B6355", textAlign: "left" }}>
                {description}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default Itinerary;
