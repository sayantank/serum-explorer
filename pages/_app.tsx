import { NextPage } from "next";
import { AppProps } from "next/app";
import { FC } from "react";
import { SerumProvider } from "../context/SerumContext";
import { SolanaProvider } from "../context/SolanaContext";

// Use require instead of import since order matters
require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const App: FC<AppPropsWithLayout> = ({
  Component,
  pageProps,
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SolanaProvider>
      <SerumProvider>{getLayout(<Component {...pageProps} />)}</SerumProvider>
    </SolanaProvider>
  );
};

export default App;
