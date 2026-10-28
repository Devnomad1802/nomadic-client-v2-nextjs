"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { store } from "@/utils";
import { MotionConfig } from "framer-motion";
import theme from "@/Theme";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Navbar from "@/Component/Navbar/Navbar";
import ChatNotifier from "@/SmallComponents/ChatNotifier";
import ConsentBanner from "@/Component/ConsentBanner";
import Loading from "@/SmallComponents/Loading";

const persistor = persistStore(store);

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  // Standalone, chrome-free routes (own full-page shell, no navbar/footer).
  const bare = (pathname || "").startsWith("/host-onboarding");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const shell = (
    // reducedMotion="user" → every framer-motion animation honours the OS
    // "reduce motion" setting app-wide (pairs with the CSS guard in globals.css).
    <MotionConfig reducedMotion="user">
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {bare ? (
        <Suspense fallback={<Loading isLoading={true} />}>{children}</Suspense>
      ) : (
        <Box sx={{ background: "#fff" }}>
          <Navbar />
          <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Suspense fallback={<Loading isLoading={true} />}>
                {children}
              </Suspense>
            </Box>
          </Box>
          <ChatNotifier />
          <ConsentBanner />
        </Box>
      )}
    </ThemeProvider>
    </MotionConfig>
  );

  if (!mounted) {
    return <ReduxProvider store={store}>{shell}</ReduxProvider>;
  }

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {shell}
      </PersistGate>
    </ReduxProvider>
  );
}
