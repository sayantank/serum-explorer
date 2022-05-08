import { ReactNode } from "react";
import { getLayout } from "../components/layouts/SiteLayout";

const Home = () => {
  return <div className="flex flex-col space-y-4 items-stretch">homepage</div>;
};

Home.getLayout = (page: ReactNode) => getLayout(page, "Home");

export default Home;
