import React, { useState } from "react";
import styled from "styled-components";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Colors, Icons, Loader, LoaderSizes } from "@sellout/ui";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import ImmutableSettingsInput from "../elements/ImmutableSettingsInput";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import { useDispatch } from "react-redux";
import { ModalTypes } from "../components/modal/Modal";
import Error from "../elements/Error";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import * as AppActions from "../redux/actions/app.actions";
import SelectImage, { SelectImageSizes } from "../components/SelectImage";
import { useMutation } from "@apollo/react-hooks";
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { Page, PageTitle } from "../components/PageLayout";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import IUser from "@sellout/models/.dist/interfaces/IUser";
import IUserProfile from "@sellout/models/.dist/interfaces/IUserProfile";
import UPDATE_BASIC_USER_INFO from "@sellout/models/.dist/graphql/mutations/updateBasicUserInfo.mutation";
import SEND_USER_EMAIL_VERIFICATION from "@sellout/models/.dist/graphql/mutations/sendUserEmailVerification.mutation";
import UPDATE_USER_PREFERRED_LOGIN from "@sellout/models/.dist/graphql/mutations/updateUserPreferredLogIn.mutation";
import SelectLogo from "../components/SelectLogo";
import UserImage from "@sellout/ui/build/components/UserImage";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import Label from "@sellout/ui/build/components/Label";

const Container = styled.div`
  width: 274px;
  height: 100%;
`;

const SubNavContainer = styled.div`
  margin: 24px 0px;
  display: flex;
`;

type SubNavItemProps = {
  active: boolean;
};
const SubNavItem = styled.div<SubNavItemProps>`
  transition: all 0.2s;
  color: ${(props) => (props.active ? `${Colors.Grey1}` : `${Colors.Grey4}`)};
  font-weight: 600;
  font-size: 1.8rem;
  cursor: pointer;
  margin-right: 24px;
`;

const EmailStatusContainer = styled.div`
  display: flex;
  margin: 10px 0px 20px;
  align-items: center;
`;

const EmailStatus = styled.div`
  color: ${Colors.Grey3};
  font-size: 1.2rem;
`;

const Spacer = styled.div`
  height: 24px;
`;

enum PageState {
  Profile = "Profile",
  Security = "Security",
  Payment = "Payment",
}
interface IUserGraphQL extends IUser {
  userProfile: IUserProfile;
}

type SettingsProfileSectionProps = {
  user: IUserGraphQL;
};

const Profile: React.FC<SettingsProfileSectionProps> = ({ user }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(`${user.firstName} ${user.lastName}`);
  const [profilePic, setProfilePic] = useState(user.userProfile.imageUrl);
  const [errorMsg, setErrorMsg] = useState("");
  const [updateBasicUserInfo, { loading }] = useMutation(
    UPDATE_BASIC_USER_INFO,
    {
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Your profile settings have been saved.",
            AppNotificationTypeEnum.Success
          )
        );
      },
      onError(error) {
        setErrorMsg(getErrorMessage(error));
      },
    }
  );
  const [sendUserEmailVerification, { loading: emailLoading }] = useMutation(
    SEND_USER_EMAIL_VERIFICATION,
    {
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            `An email has been sent to ${user.email}. Please open it and follow the instructions to verify your email.`,
            AppNotificationTypeEnum.Success
          )
        );
      },
      onError(error) {
        setErrorMsg(getErrorMessage(error));
      },
    }
  );

  const pushModal = (modalType: ModalTypes) =>
    dispatch(AppActions.pushModal(modalType));

  const saveInfo = () => {
    if (errorMsg) setErrorMsg("");
    const lastSpaceIndex = name.lastIndexOf(" ");
    const firstName = name.substring(0, lastSpaceIndex);
    const lastName = name.substring(lastSpaceIndex + 1, name.length);
    if (firstName && lastName) {
      updateBasicUserInfo({
        variables: {
          firstName,
          lastName,
          imageUrl: profilePic,
        },
      });
    } else {
      setErrorMsg("Please include both first and last name");
    }
  };

  const secondaryEmails = user?.secondaryEmails;
  return (
    <>
      <Input
        label="Your name"
        placeholder="Enter your full name"
        size={InputSizes.Regular}
        value={name}
        width="100%"
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          if (errorMsg) setErrorMsg("");
          setName(event.currentTarget.value);
        }}
        icon={Icons.UserLight}
      />
      <Spacer />
      <SelectLogo
        imageUrl={profilePic}
        setImageUrl={setProfilePic}
        label="Profile picture"
        UploadDisplay={
          <UserImage
            firstName={user.firstName || ""}
            lastName={user.lastName || ""}
            imageUrl={profilePic}
            height="100px"
            size="3.6rem"
            margin="0"
          />
        }
        uploadText="Update profile picture"
      />
      <Spacer />
      <ImmutableSettingsInput
        text={user.email}
        iconLeft={Icons.StarSolid}
        label="Your email address"
        subLabel="(primary)"
        iconLeftColor={Colors.Yellow}
        withDropdown
        margin={user.emailVerifiedAt ? "0px 0px 20px 0px" : "0px"}
        primary
      />
      {!user.emailVerifiedAt && (
        <EmailStatusContainer>
          <EmailStatus>Not verified</EmailStatus>
          <TextButton
            size={TextButtonSizes.Small}
            children="Verify now"
            margin="0px 10px 0px 10px"
            onClick={() => (emailLoading ? null : sendUserEmailVerification())}
          />
          {emailLoading && (
            <Loader size={LoaderSizes.FuckingTiny} color={Colors.Orange} />
          )}
        </EmailStatusContainer>
      )}

      {user && secondaryEmails && secondaryEmails.length > 0 && (
        <Label
          text="Your email address"
          subText="(secondary)"
          tip="Use the 3-button icons to change your primary email address or delete any secondary email address."
        />
      )}
      {user &&
        secondaryEmails &&
        secondaryEmails.length > 0 &&
        secondaryEmails.map((e: string, i: number) => {
          return (
            <ImmutableSettingsInput
              key={i}
              text={e}
              iconLeft={Icons.EnvelopeLight}
              withDropdown
              margin="10px 0px 0px 0px"
            />
          );
        })}
      {/* <TextButton
        size={TextButtonSizes.Small}
        children="Add another email address"
        margin="10px 0px 24px 0px"
        onClick={() => pushModal(ModalTypes.AddSecondaryEmail)}
      /> */}
      {user && secondaryEmails && secondaryEmails.length > 0 && <Spacer />}
      <ImmutableSettingsInput
        text={user.phoneNumber || ""}
        iconLeft={Icons.PhoneLight}
        label="Your phone number"
        iconRight={Icons.CheckCircle}
        iconRightColor={Colors.Green}
      />
      <TextButton
        size={TextButtonSizes.Small}
        children="Change phone number"
        margin="10px 0px 24px 0px"
        onClick={() => pushModal(ModalTypes.ChangePhoneNumber)}
      />
      <Button
        type={ButtonTypes.Thin}
        state={ButtonStates.Active}
        text="Save changes"
        loading={loading}
        onClick={() => saveInfo()}
      />
      {errorMsg && <Error children={errorMsg} margin="10px 0px 0px 0px" />}
      <Spacer />
    </>
  );
};

const Security: React.FC<SettingsProfileSectionProps> = ({ user }) => {
  const aa =
    user.preferredLogin === "PhoneCode"
      ? "SMS Authentication"
      : user.preferredLogin;
  const [preferredLogin, setPreferredLogin] = useState(aa);

  const dispatch = useDispatch();
  const pushModal = (modalType: ModalTypes) =>
    dispatch(AppActions.pushModal(modalType));

  const [updateUserPreferredLogIn, { loading: updateUserLoading }] =
    useMutation(UPDATE_USER_PREFERRED_LOGIN, {
      variables: {
        preferredLogin:
          preferredLogin === "SMS Authentication"
            ? "PhoneCode"
            : preferredLogin,
      },
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            `Your security settings have been saved.`,
            AppNotificationTypeEnum.Success
          )
        );
      },
      onError(error) {
        //setErrorMsg(getErrorMessage(error));
      },
    });

  const items = [
    {
      text: "SMS Authentication",
      value: "SMS Authentication",
    },
    {
      text: "Password",
      value: "Password",
    },
  ];

  return (
    <>
      <ImmutableSettingsInput
        text="••••••••••••"
        label="Password"
        width="100%"
      />
      <TextButton
        size={TextButtonSizes.Regular}
        children="Change password"
        margin="10px 0px 0px 0px"
        onClick={() => pushModal(ModalTypes.ChangePassword)}
      />
      <Spacer />
      <Dropdown
        value={preferredLogin}
        items={items}
        onChange={(value) => {
          setPreferredLogin(value);
        }}
        label="Login Verification Method"
      />
      <Spacer />
      <Button
        type={ButtonTypes.Thin}
        state={ButtonStates.Active}
        text="Save changes"
        // loading={loading}
        onClick={() => updateUserPreferredLogIn()}
      />
    </>
  );
};

type SettingsProfileProps = {};
const SettingsProfile: React.FC<SettingsProfileProps> = () => {
  const { data } = useQuery(GET_PROFILE);
  const { user } = data;
  const [pageState, setPageState] = useState(PageState.Profile);

  return (
    <Container>
      <Page>
        <PageTitle>Personal Settings</PageTitle>
        <SubNavContainer>
          <SubNavItem
            onClick={() => setPageState(PageState.Profile)}
            active={pageState === PageState.Profile}
          >
            Profile
          </SubNavItem>
          <SubNavItem
            onClick={() => setPageState(PageState.Security)}
            active={pageState === PageState.Security}
          >
            Security
          </SubNavItem>
        </SubNavContainer>
        {(() => {
          switch (pageState) {
            case PageState.Profile:
              return <Profile user={user} />;
            case PageState.Security:
              return <Security user={user} />;
          }
        })()}
      </Page>
    </Container>
  );
};

export default SettingsProfile;
