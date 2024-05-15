import React from "react";
import useSeason from "../hooks/useSeason.hook";
import EmbedBuyButtonCard from "../components/EmbedBuyButtonCard";
import SeasonPublishedCard from "../components/SeasonPublishedCard";
import PageLoader from "../components/PageLoader";
import { PaddedPage, PageTitle } from "../components/PageLayout";

type SeasonSharingProps = {};

const SeasonSharing: React.FC<SeasonSharingProps> = () => {
  /* Hooks */
  const { season } = useSeason();

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(season)} />
      {season && (
        <PaddedPage>
          <PageTitle>Sharing</PageTitle>
          <SeasonPublishedCard season={season} />
          <EmbedBuyButtonCard season={season} />
        </PaddedPage>
      )}
    </>
  );
};

export default SeasonSharing;
