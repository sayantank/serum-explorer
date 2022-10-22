import { ReactNode } from "react";
import { getLayout } from "../../components/layouts/SiteLayout";

const CreateMarket = () => {
  return <h1>create marker</h1>;
};

CreateMarket.getLayout = (page: ReactNode) => getLayout(page, "Create Market");

export default CreateMarket;
