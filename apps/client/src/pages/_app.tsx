import { useTheme } from "next-themes";
import { Outlet } from "react-router";
import { Toaster } from "sonner";
import { SWRConfig } from "swr";

import http from "@/http";
import { Providers } from "@/provider";
import { UsersProvider } from "@/providers/UsersProvider";

type Theme = "dark" | "light" | "system";

const Layout = () => {
  const { theme } = useTheme();

  return (
    <>
      <Providers>
        <SWRConfig
          value={{
            errorRetryInterval: 1000,
            fetcher: http.fetcher,
            refreshInterval: 1000,
          }}
        >
          <UsersProvider>
            <Outlet />
          </UsersProvider>
        </SWRConfig>
        <Toaster richColors theme={theme as Theme} />
      </Providers>
    </>
  );
};

export default Layout;
