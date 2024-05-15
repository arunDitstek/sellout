import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Colors, Icons } from "@sellout/ui";
import RichTextEditor from "../elements/RichTextEditor";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import Error from "../elements/Error";
import PhoneNumberInput, {
  PhoneNumberInputSizes,
} from "@sellout/ui/build/components/PhoneNumberInput";
import { useMutation } from "@apollo/react-hooks";
import AddressSearchDropdown from "@sellout/ui/build/components/AddressSearchDropdown";
import IAddress from "@sellout/models/.dist/interfaces/IAddress";
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import UPDATE_ORGANIZATION from "@sellout/models/.dist/graphql/mutations/updateOrganization.mutation";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import OrganizationLogo from "../components/OrganizationLogo";
import SelectLogo from "../components/SelectLogo";
import BooleanInput from "../elements/BooleanInput";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import IS_SUPER_USER from "@sellout/models/.dist/graphql/queries/isSuperUser.query";
import { TicketFormatAsEnum } from "@sellout/models/.dist/interfaces/IOrganization";
import { Page } from "../components/PageLayout";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  width: 274px;
`;

const SubContainer = styled.div`
  width: 572px;
  ${media.mobile`
    width: 100%;
    padding: 0 25px 0 0;
    `}
`;

const PageTitle = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
  margin-bottom: 25px;
`;

const Spacer = styled.div`
  height: 24px;
`;

const RichTextContainer = styled.div`
  width: 572px;
  ${media.mobile`
    width: 100%;
    padding: 0 25px 0 0;
    `}
`;

type OrganizationSettingsProps = {};
const OrganizationSettings: React.FC<OrganizationSettingsProps> = () => {
  const dispatch = useDispatch();
  const { data } = useQuery(GET_PROFILE);
  const { organization } = data;
  const [name, setName] = useState(organization.orgName);
  const [email, setEmail] = useState(organization.email);
  const [orgLogoUrl, setOrgLogoUrl] = useState(organization.orgLogoUrl);
  const [phoneNumber, setPhoneNumber] = useState(organization.phoneNumber);
  const [address, setAddress] = useState(organization.address);
  const [website, setWebsite] = useState(organization.orgUrls[0]);
  const [bio, setBio] = useState(organization.bio);
  const [ticketFormat, setTicketFormat] = useState(
    organization.ticketFormat || TicketFormatAsEnum.Standard
  );

  const [isSeasonTickets, setIsSeasonTickets] = useState(
    organization?.isSeasonTickets as boolean
  );
  const [isTegIntegration, setIsTegIntegration] = useState(
    organization?.isTegIntegration as boolean
  );
  const [validateMemberId, setValidateMemberId] = useState(
    organization?.validateMemberId as boolean
  );
  const [facebookPixelId, setFacebookPixelId] = useState(
    organization.facebookPixelId
  );
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState(
    organization.googleAnalyticsId
  );

  const [tegClientID, setTegClientID] = useState(organization.tegClientID);

  const [tegSecret, setTegSecret] = useState(organization.tegSecret);

  const [tegURL, setTegURL] = useState(organization.tegURL);

  const [errorMsg, setErrorMsg] = useState("");

  const { data: superAdminData } = useQuery(IS_SUPER_USER);
  const [updateOrganization, { loading }] = useMutation(UPDATE_ORGANIZATION, {
    refetchQueries: [{ query: GET_PROFILE }],
    onCompleted(data) {
      dispatch(
        AppActions.showNotification(
          "Your organization settings have been saved",
          AppNotificationTypeEnum.Success
        )
      );
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
  });

  const setSeasonEnable = () => {
    setIsSeasonTickets(!isSeasonTickets);
    updateOrganization({
      variables: {
        organization: {
          orgName: name || "No Organization Name",
          orgUrls: website,
          address,
          bio,
          email,
          phoneNumber,
          facebookPixelId,
          googleAnalyticsId,
          orgLogoUrl,
          isSeasonTickets: !isSeasonTickets,
          tegClientID,
          tegSecret,
          tegURL,
          ticketFormat,
        },
      },
    });
  };


  const setTegIntegration = () => {
    setIsTegIntegration(!isTegIntegration);
    setValidateMemberId(false);
  };
  
  const setValidateMemberIds = () => {
    setValidateMemberId((prevValidateMemberId) => !prevValidateMemberId);
  };
  return (
    <>
      <Page>
        <PageTitle>Organization Settings</PageTitle>
        <Container>
          <Input
            label="Organization name"
            placeholder="Enter organization name"
            size={InputSizes.Regular}
            value={name}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setName(event.currentTarget.value);
            }}
          />
          <Spacer />
          <SelectLogo
            imageUrl={orgLogoUrl}
            setImageUrl={setOrgLogoUrl}
            label="Logo"
            UploadDisplay={<OrganizationLogo logoUrl={orgLogoUrl} />}
            uploadText="Update logo"
          />
          <Spacer />
          <Input
            label="Customer support email"
            placeholder="Enter support email"
            size={InputSizes.Regular}
            value={email}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setEmail(event.currentTarget.value);
            }}
            icon={Icons.EnvelopeLight}
          />
          <Spacer />
          <PhoneNumberInput
            label="Customer support phone number"
            phoneNumberInputSize={PhoneNumberInputSizes.Regular}
            value={phoneNumber}
            onChange={(val: string) => {
              setPhoneNumber(val);
            }}
          />
          <Spacer />
          <Input
            label="Website"
            placeholder="Enter website url"
            size={InputSizes.Regular}
            width="100%"
            value={website ? website : ""}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setWebsite(event.currentTarget.value);
            }}
            icon={Icons.LinkLight}
          />
        </Container>
        {superAdminData?.isSuperUser && (
          <>
            {" "}
            <Spacer />
            <BooleanInput
              active={isSeasonTickets}
              onChange={() => setSeasonEnable()}
              label="Enable Season Tickets"
            />
            <Spacer />
            <BooleanInput
              active={isTegIntegration}
              onChange={() => setTegIntegration()}
              label="Enable TEI / TEG Integration"
            />
              
            {isTegIntegration &&
            <>
              <Spacer />
            <BooleanInput
              active={validateMemberId}
              onChange={() => setValidateMemberIds()}
              label=" Enable Member Id Validation"
            />
            </>
            }
            {isTegIntegration && (
              <>
                <Spacer />
                <Input
                  label="TEI Client Id"
                  placeholder="Enter Client Id"
                  size={InputSizes.Regular}
                  value={tegClientID}
                  subLabel={"(required)"}
                  width="350px"
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    setTegClientID(event.currentTarget.value);
                  }}
                />
                <Spacer />
                <Input
                  label="TEI Secret Id"
                  placeholder="Enter Secret Id"
                  size={InputSizes.Regular}
                  value={tegSecret}
                  width="350px"
                  subLabel={"(required)"}
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    setTegSecret(event.currentTarget.value);
                  }}
                />
                <Spacer />
                <Input
                  label="TEI Url"
                  placeholder="Enter a url"
                  size={InputSizes.Regular}
                  value={tegURL}
                  subLabel={"(required)"}
                  width="350px"
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    setTegURL(event.currentTarget.value);
                  }}
                />
              </>
            )}
            <Spacer />
            <Container>
              <Dropdown
                value={ticketFormat}
                width="100%"
                items={[
                  {
                    text: TicketFormatAsEnum.Standard,
                    value: TicketFormatAsEnum.Standard,
                  },
                  {
                    text: TicketFormatAsEnum.RCSC,
                    value: TicketFormatAsEnum.RCSC,
                  },
                ]}
                onChange={(item: any) => {
                  setTicketFormat(item);
                }}
                label="Ticket Format"
              />
            </Container>
          </>
        )}

        <Spacer />
        <SubContainer>
          <AddressSearchDropdown
            label="Physical address"
            value={address as IAddress}
            onChange={setAddress}
            width="572px"
          />
        </SubContainer>
        <Spacer />
        <RichTextContainer>
          <RichTextEditor
            value={bio}
            onChange={(html: string) => setBio(html)}
            label="Bio"
          />
        </RichTextContainer>
        <Spacer />
        <Container>
          <Input
            label="Facebook Pixel ID"
            placeholder="Ex. '205397968110775'"
            size={InputSizes.Regular}
            value={facebookPixelId}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setFacebookPixelId(event.currentTarget.value);
            }}
            icon={Icons.FacebookPlain}
          />
          <Spacer />
          <Input
            label="Google Analytics ID"
            placeholder="Ex. 'UA-112350712-1'"
            size={InputSizes.Regular}
            value={googleAnalyticsId}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setGoogleAnalyticsId(event.currentTarget.value);
            }}
            icon={Icons.Google}
          />
        </Container>
        <Spacer />
        {errorMsg && (
          <>
            <Error margin="10px 0px 0px 0px">{errorMsg}</Error>
            <Spacer />
          </>
        )}
        <Button
          type={ButtonTypes.Thin}
          state={ButtonStates.Active}
          text="Save changes"
          loading={loading}
          onClick={() => {
            if (isTegIntegration && (!tegClientID || !tegSecret || !tegURL)) {
              dispatch(
                AppActions.showNotification(
                  "ClientId,SecretId,Url is required if you selected TEG Integeration.",
                  AppNotificationTypeEnum.Warning
                )
              );
            } else {
              updateOrganization({
                variables: {
                  organization: {
                    orgName: name || "No Organization Name",
                    orgUrls: website,
                    address,
                    bio,
                    email,
                    phoneNumber,
                    facebookPixelId,
                    googleAnalyticsId,
                    orgLogoUrl,
                    isSeasonTickets,
                    validateMemberId,
                    isTegIntegration,
                    tegClientID,
                    tegSecret,
                    tegURL,
                    ticketFormat,
                  },
                },
              });
            }
          }}
        />
        <Spacer />
      </Page>
    </>
  );
};

export default OrganizationSettings;
