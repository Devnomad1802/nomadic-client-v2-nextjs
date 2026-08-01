"use client";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import SnowshoeingOutlinedIcon from "@mui/icons-material/SnowshoeingOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, Grid, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetPartialTripMutation,
  useCreateBalanceOrderMutation,
  useConfirmBalancePaymentMutation,
} from "../../../services";

const TravelHistory = () => {
  const { userDbData } = useSelector((store) => store.global);
  const [getPartialTrip] = useGetPartialTripMutation();
  const [partilyArray, setPartialyArray] = useState([]);

  const getPartialTrips = useCallback(async () => {
    try {
      const data = await getPartialTrip({ userId: userDbData?._id });
      if (data?.data?.data) {
        // Map through the array and parse `paymentDetail` and `cardData` fields
        const updatedData = data.data.data.map((item) => {
          // Create a shallow copy of the item to ensure immutability
          const updatedItem = { ...item };

          // Safely parse paymentDetail if it's a string
          if (typeof updatedItem.paymentDetail === "string") {
            try {
              // Create a new object for paymentDetail so we avoid modifying the original one directly
              updatedItem.paymentDetail = JSON.parse(updatedItem.paymentDetail);
            } catch (e) {
              console.error(
                "Error parsing paymentDetail for booking ID:",
                updatedItem.bookingId,
                e
              );
            }
          }

          // Safely parse cardData if it's a string
          if (typeof updatedItem.cardData === "string") {
            try {
              // Create a new object for cardData so we avoid modifying the original one directly
              updatedItem.cardData = JSON.parse(updatedItem.cardData);
            } catch (e) {
              console.error(
                "Error parsing cardData for booking ID:",
                updatedItem.bookingId,
                e
              );
            }
          }

          return updatedItem; // Return the updated item
        });

        // Set the updated array to state
        setPartialyArray(updatedData);
      }
    } catch (error) {
    }
  }, [getPartialTrip, userDbData]);

  useEffect(() => {
    getPartialTrips();
  }, [getPartialTrips]);

  // ---------------------------- Handle Partical Paymnet ----------------------

  const navigate = useNavigate();

  const [createBalanceOrder] = useCreateBalanceOrderMutation();
  const [confirmBalancePayment] = useConfirmBalancePaymentMutation();

  // Secure balance top-up: the SERVER computes the remaining balance from the
  // stored booking snapshot and verifies the payment. The browser only sends
  // the booking id and the Razorpay receipt codes — never the amount.
  const handleOrder = async (selectedValue, item) => {
    if (!userDbData) {
      alert("Please login to continue with the payment");
      return;
    }

    try {
      const so = await createBalanceOrder({ bookingId: item?._id }).unwrap();
      if (!so?.orderId || !so?.key) {
        alert("Payments are temporarily unavailable. Please try again later.");
        return;
      }

      const options = {
        key: so.key, // provided by the server
        amount: so.amount * 100, // server-decided remaining, in paise
        currency: so.currency || "INR",
        name: "Nomadic Townies",
        description: "Trip Balance Payment",
        image: "https://i.ibb.co/5Y3m33n/test.png",
        order_id: so.orderId,
        handler: async (response) => {
          try {
            const { data } = await confirmBalancePayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap();
            navigate("/paymentsuccess", { state: { data } });
          } catch (error) {
            console.error("Balance confirmation failed:", error);
            alert("Payment received but confirmation failed. Please contact support.");
            navigate("/paymentfail");
          }
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", (response) => {
        console.error("Payment failed:", response?.error);
        navigate("/paymentfail");
      });
      rzp1.open();
    } catch (error) {
      console.error("Error initiating balance payment:", error);
      alert(error?.data?.error || "Failed to initiate payment. Please try again.");
    }
  };

  return (
    <Box sx={{}}>
      <Typography
        sx={{
          fontSize: { xs: "20px", md: "28px" },
          color: "#000",
          textAlign: "left",
        }}
      >
        My Trips
      </Typography>

      {partilyArray.slice().map((item, index) => {
        // Extract properties from each item
        const {
          paymentDetail,
          cardData,
          coupenDiscount,
          total,
          paymentStatus,
          DateOfBooking,
        } = item;

        // Define the status for Payment Status (you can use any logic based on your needs)

        const travelHistory = [
          {
            icon: <FmdGoodOutlinedIcon sx={{ color: "#3E92CC" }} />,
            typo1: "Location",
            typo2: paymentDetail?.location,
          },
          {
            icon: <SnowshoeingOutlinedIcon sx={{ color: "#3E92CC" }} />,
            typo1: "No of Travellers",
            typo2: cardData?.numberOfTravelers,
          },
          {
            icon: <CalendarTodayOutlinedIcon sx={{ color: "#3E92CC" }} />,
            typo1: "Date",
            typo2: (
              <>
                {cardData?.cardDate?.batchDate ? (
                  <>
                    {new Date(cardData?.cardDate?.batchDate).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                    {" - "}
                    {new Date(
                      new Date(cardData?.cardDate?.endSelectDate).getTime() +
                        cardData?.cardDate?.numberOfDays * 24 * 60 * 60 * 1000
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </>
                ) : (
                  "00, 00"
                )}
              </>
            ),
          },
          {
            icon: <FmdGoodOutlinedIcon sx={{ color: "#3E92CC" }} />,
            typo1: "Pick Up/Drop Off",
            typo2: (
              <>
                {paymentDetail?.pickUp} - {paymentDetail?.dropOff}
              </>
            ),
          },
        ];

        const itemTotal = cardData?.cardSectionData
          ?.flat()
          .reduce((sum, item) => {
            return sum + Number(item?.TitlePrice) * Number(item.quantity); // Adding item prices
          }, 0);

        const gstAndDiscountTotal = Number(cardData?.gstTax); // Add GST tax and discount

        const finalTotal =
          itemTotal + gstAndDiscountTotal - coupenDiscount - total; // Add everything together
        const paymentStatusLabel =
          Number(finalTotal) <= 0 ? "Booked" : "Partial Booked";

        const array = [
          { value: total, title: "Amount Paid", color: "#3F3F46" },
          {
            value: finalTotal.toFixed(0),
            title: "Remain amount to pay",
            color: "#CF4A2C",
          },
        ];
        const array2 = [
          {
            name: "Amount Paid",
            price: "",
            total: <>{`-${Number(total).toFixed(0)}`}</>,
          },
          {
            name: "Discount",
            price: "",
            total: <>{`-${Number(coupenDiscount).toFixed(0)}`}</>,
          },
          {
            name: "GST @5%",
            price: "",
            total: Number(cardData?.gstTax).toFixed(0),
          },
          {
            name: "Total",
            price: "",
            total: <>{Number(finalTotal).toFixed(0)}</>,
          },
        ];
        return (
          <Accordion 
            key={index}
            sx={{ 
              mt: 3,
              borderRadius: "10px !important",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
              border: "1px solid #E4E4E7",
              "&:before": {
                display: "none",
              },
              "&.Mui-expanded": {
                margin: "24px 0",
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: "#3F3F46" }} />}
              sx={{
                background: "#FAFAFA",
                borderRadius: "10px 10px 0 0",
                padding: { xs: "12px 16px", sm: "14px 18px", md: "16px 20px" },
                "&.Mui-expanded": {
                  borderRadius: "10px 10px 0 0",
                  minHeight: "auto",
                },
                "& .MuiAccordionSummary-content": {
                  margin: "0",
                  "&.Mui-expanded": {
                    margin: "0",
                  }
                }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#3F3F46",
                      fontSize: { xs: "18px", md: "20px" },
                      fontWeight: 500,
                      textAlign: "left",
                    }}
                  >
                    {item?.trip?.title || "Trip"}
                  </Typography>
                  <Typography
                    sx={{
                      color: "#71717A",
                      fontSize: "13px",
                      textAlign: "left",
                      mt: 0.5,
                    }}
                  >
                    {`Booked on ${new Date(
                      DateOfBooking
                    ).toLocaleDateString()} at ${new Date(
                      DateOfBooking
                    ).toLocaleTimeString()}`}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    variant="simplebtn"
                    sx={{ background: "#CF4A2C", color: "#fff" }}
                  >
                    {paymentStatusLabel}
                  </Button>
                </Box>
              </Box>
            </AccordionSummary>
            
            <AccordionDetails
              sx={{
                background: "#fff",
                borderRadius: "0 0 10px 10px",
                padding: { xs: "12px 16px", sm: "14px 18px", md: "16px 20px" },
              }}
            >
              <Grid
                container
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: "30px 0px",
                  mt: 3,
                }}
              >
                {travelHistory.map(({ icon, typo1, typo2 }, index) => {
                  return (
                    <Grid key={index} item xs={12} sm={5.5} md={3.7}>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "0px 10px",
                          }}
                        >
                          {icon}
                          <Typography
                            sx={{ color: "#71717A", fontSize: "13px" }}
                          >
                            {typo1}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ color: "#3F3F46", mt: 1, textAlign: "left" }}
                        >
                          {typo2}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
              <Box
                sx={{
                  background: "#E4E4E7",
                  height: "1px",
                  width: "100%",
                  my: 4,
                }}
              />
              <Box>
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: { xs: "0px 30px", md: "0px 60px" },
                    }}
                  >
                    <Box>
                      <Typography sx={{ color: "#71717A", fontSize: "13px" }}>
                        Amount Paid
                      </Typography>
                      <Typography
                        sx={{ color: "#3F3F46", mt: 1, textAlign: "left" }}
                      >
                        &#8377; {Number(total).toFixed(0)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#71717A", fontSize: "13px" }}>
                        Payment Status
                      </Typography>
                      <Typography
                        sx={{ color: Number(finalTotal) <= 0 ? "#15803D" : "#A66412", mt: 1, textAlign: "left" }}
                      >
                        {paymentStatusLabel}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      color: "#000",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px 0px",
                      p: 3,
                      background: "#FAFAFA",
                      borderRadius: "10px",
                      border: "1px solid #F4F4F5",
                      my: 3,
                    }}
                  >
                    {cardData?.cardSectionData?.flat().map((item, index) => {
                      return (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            p: 1,
                            borderBottom: "1px solid #EDEDED",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#52525B",
                              fontSize: { xs: "13px", sm: "14px" },
                              textAlign: "start",
                            }}
                          >
                            {item?.Title}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#52525B",
                              fontSize: { xs: "13px", sm: "14px" },
                              // textAlign: "cent",
                            }}
                          >
                            &#8377; {item?.TitlePrice} x {item.quantity}
                          </Typography>

                          <Typography
                            sx={{
                              color: "#52525B",
                              fontSize: { xs: "13px", sm: "14px" },
                              textAlign: "right",
                            }}
                          >
                            &#8377;{item?.TitlePrice * item.quantity}
                          </Typography>
                        </Box>
                      );
                    })}
                    {array2.map((item, index) => {
                      return (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            p: 1,
                            borderBottom: "1px solid #EDEDED",
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#52525B",

                              fontSize: { xs: "13px", sm: "14px" },
                              textAlign: "start",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#52525B",

                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            {item.price}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#52525B",

                              fontSize: { xs: "13px", sm: "14px" },
                            }}
                          >
                            &#8377; {item.total}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ 
                    display: "flex", 
                    gap: "40px",
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", md: "flex-start" }
                  }}>
                    {array.map((item, index) => {
                      return (
                        <Box key={index} sx={{ 
                          display: "flex",
                          flexDirection: "column",
                          alignItems: { xs: "center", md: "flex-start" }
                        }}>
                          <Typography
                            sx={{ 
                              color: "#71717A", 
                              fontSize: "14px",
                              fontWeight: 500,
                              mb: 1
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Typography
                            sx={{
                              color: item.color,
                              fontSize: "24px",
                              fontWeight: 600,
                              textAlign: { xs: "center", md: "start" },
                            }}
                          >
                            &#8377; {item.value}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  {Number(finalTotal) > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px 0px",
                        mt: 2,
                      }}
                    >
                      <Typography sx={{ color: "#52525B", textAlign: "start" }}>
                        Note: Balance amount of &#8377; {Number(finalTotal).toFixed(0)}/- can be paid up to{" "}
                        {cardData?.cardDate?.batchDate
                          ? new Date(
                              new Date(cardData.cardDate.batchDate).getTime() -
                                15 * 24 * 60 * 60 * 1000
                            ).toLocaleDateString(undefined, {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </Typography>
                      <Typography sx={{ color: "#71717A", textAlign: "start" }}>
                        Payment Processing fee of 3% will be charged in next step.
                      </Typography>
                      <Button
                        onClick={() => handleOrder(finalTotal, item)}
                        sx={{
                          color: "#fff",
                          background: "#CF4A2C",
                          borderRadius: "25px",
                          px: 4,
                          py: 1.5,
                          fontSize: "16px",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          boxShadow: "0px 4px 12px rgba(236, 63, 24, 0.3)",
                          "&:hover": {
                            background: "#D6360E",
                            boxShadow: "0px 6px 16px rgba(236, 63, 24, 0.4)",
                          },
                        }}
                      >
                        Proceed to pay &#8377; {finalTotal.toFixed(0)}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box
                sx={{
                  background: "#E4E4E7",
                  height: "1px",
                  width: "100%",
                  my: 5,
                }}
              />
              <Typography 
                sx={{ 
                  color: "#058DF8", 
                  mt: 3, 
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": {
                    color: "#0471D6",
                    textDecoration: "underline"
                  }
                }}
              >
                Cancellation Policy
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default TravelHistory;
