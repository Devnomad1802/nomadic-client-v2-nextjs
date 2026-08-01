"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import { payment } from "../Images";
import "./steper.css";
import BatchListTab from "../SmallComponents/Tabs/BatchListTabs/BatchListTab";
import SelectNTravel from "./SelectNTravel";

const steps = [
  "Selected Date  ",
  "Selected No of Travellers   -",
  "Amount to Pay -",
];

export default function Stepper1() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());

  const isStepOptional = (step) => {
    return step === 1;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box>
      <Grid
        container
        sx={{
          display: "flex",
          // flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "start",
          mt: 5,
        }}
      >
        <Grid item xs={12} md={4} sx={{ position: "relative" }}>
          <Box
            sx={{
              width: "80%",
              position: "absolute",
              left: "50%",
              top: "30%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              gap: "20px 0px",
            }}
          >
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              sx={{ width: "100%" }}
            >
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                return (
                  <Step
                    key={label}
                    {...stepProps}
                    sx={{
                      "& .MuiStepLabel-root .Mui-completed": {
                        color: "green", // circle color (COMPLETED)
                      },
                      "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel":
                        {
                          color: "#fff", // Just text label (COMPLETED)
                        },
                      "& .MuiStepLabel-root .Mui-active": {
                        color: "red", // circle color (ACTIVE)
                      },
                      "& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel":
                        {
                          color: "#fff", // Just text label (ACTIVE)
                        },
                      "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
                        fill: "#fff", // circle's number (ACTIVE)
                      },
                    }}
                  >
                    <StepLabel {...labelProps} style={{ color: "#000" }}>
                      <Typography
                        sx={{
                          color: "#857C6C",
                          textAlign: "left",
                        }}
                      >
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          </Box>
          <Box sx={{ width: "100%", height: { xs: "300px", md: "600px" } }}>
            <img
              src={payment}
              alt="payment"
              srcSet=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={8} sx={{ mt: { xs: 5, md: 0 } }}>
          {activeStep === steps.length ? (
            <Box>
              <Typography sx={{ mt: 2, mb: 1, color: "#000" }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  pt: 2,
                  color: "#000",
                }}
              >
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset} sx={{ color: "#000" }}>
                  Reset
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{}}>
              {activeStep === 0 && (
                <Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "19px",
                        color: "#4E483D",
                        fontWeight: 500,
                        textAlign: "left",
                        mb: 3,
                        ml: 1,
                      }}
                    >
                      Select Batch Date
                    </Typography>
                    <BatchListTab />
                  </Box>
                </Box>
              )}
              {activeStep === 1 && (
                <Box>
                  <SelectNTravel />
                </Box>
              )}
              {activeStep === 2 && (
                <>
                  <Typography sx={{ mt: 2, mb: 1, color: "#000" }}>
                    <b> Step 3</b> Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Eos laboriosam facere aspernatur excepturi
                    sunt iure recusandae amet, repellat iusto debitis eligendi
                    fugit animi, ipsa et quo, provident tenetur. Explicabo,
                    deserunt?
                  </Typography>
                </>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  pt: 2,
                  color: "#000",
                  ml: 1,
                }}
              >
                <Button
                  // variant="simplebtn"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mb: 1, color: "#000", px: { xs: 1, md: 5 } }}
                >
                  Back
                </Button>

                <Button
                  variant="simplebtn"
                  onClick={handleNext}
                  sx={{
                    background: "#000",
                    color: "#fff",
                    "&:hover": {
                      background: "#000",
                    },
                  }}
                >
                  {activeStep === steps.length - 1 ? "Pay" : "Next"}
                </Button>
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
