import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from "../DataContext/DataContext";
import {
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
  SkeletonText,
  SideNavItem,
  SideNavDivider,
  HeaderPanel
} from '@carbon/react';
import {
  Logout,
  Notification,
  NotificationFilled,
  UserAvatar,
  UserAvatarFilled,
  UserAvatarFilledAlt
} from '@carbon/react/icons';
import eyeLogo from '../../assets/images/eye_logo.jpg';

export default function GlobalHeader(props) {

  const navigate = useNavigate();
  const { contextData, setContextData } = useContext(DataContext);
  const [userPanelExpanded, setUserPanelExpanded] = useState(false);
  const [notificationPanelExpanded, setNotificationPanelExpanded] = useState(false)
  
  return (
    <HeaderContainer
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <Header aria-label="ERVA">
            <SkipToContent />
            <HeaderMenuButton
              aria-label="Open menu"
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
            />
            <HeaderName 
              href="/"
              prefix=""
              children={
                <>
                  <img style={{paddingRight:'1rem',maxHeight:'2.5rem', width:'auto'}} id="eyeLogo" src={eyeLogo}></img>
                  ERVA
                </>
              }
            >
            </HeaderName>
            {props.isAuth && (
              <>
                <HeaderGlobalBar>
                  <HeaderGlobalAction
                    aria-label="Notifications"
                    isActive={notificationPanelExpanded}
                    onClick={() => {
                      if (userPanelExpanded) setUserPanelExpanded(false);
                      setNotificationPanelExpanded(!notificationPanelExpanded);
                    }}
                    children={notificationPanelExpanded ? <NotificationFilled size={20}/>:<Notification size={20}/>}
                  />
                  <HeaderGlobalAction
                    aria-label="Account"
                    isActive={userPanelExpanded}
                    onClick={() => {
                      if (notificationPanelExpanded) setNotificationPanelExpanded(false);
                      setUserPanelExpanded(!userPanelExpanded);
                    }}
                    tooltipAlignment="end"
                    children={userPanelExpanded ? <UserAvatarFilled size={20}/>:<UserAvatar size={20}/>}
                  />
                </HeaderGlobalBar>
                <HeaderPanel
                  id='userPanel'
                  expanded={userPanelExpanded}
                  children={
                    <>
                      <br/>
                      <p style={{paddingLeft:'1rem'}}><strong>{contextData.userInfo.firstName} {contextData.userInfo.lastName}</strong></p>
                      <SideNavDivider/>
                      <div style={{display:'flex', justifyContent:'center'}}>
                        <UserAvatarFilledAlt size={107}/>
                      </div>
                      <div style={{display:'flex', justifyContent:'center'}}>
                        <p>{contextData.userInfo.email}</p>
                      </div>
                      <SideNavDivider/>
                      <SideNavItems
                        children={
                          <SideNavLink
                            renderIcon={Logout}
                            isActive={true}
                            large={true}
                            children={"Logout"}
                            onClick={() => {
                              sessionStorage.removeItem('ervaJwt');
                              navigate('/');
                            }}
                          />
                        }
                      />
                    </>
                  }
                />
                <HeaderPanel
                  id='notificationPanel'
                  expanded={notificationPanelExpanded}
                  children={<><div>No notifications</div></>}
                />
                {props.showNav && (

                
                <SideNav aria-label="Side navigation" expanded={isSideNavExpanded} isRail={props.rail}>
                  <SideNavItems>
                    <SideNavDivider/>
                    { props.orgs && (
                      props.orgsLoading ? 
                      <>
                        <SideNavItem children={<SkeletonText/>}/>
                        <SideNavItem children={<SkeletonText/>}/>
                        <SideNavItem children={<SkeletonText/>}/>
                        <SideNavItem children={<SkeletonText/>}/>
                      </>
                      :
                      props.orgs.map(organization => (
                        <SideNavLink
                          key={organization.id}
                          onClick={() => {
                            setContextData(previousState => ({
                              ...previousState,
                              selectedOrganization:organization
                            }));
                          }}
                          children={organization.name}
                          isActive={organization.id === contextData.selectedOrganization.id}
                        />
                      ))
                    )}
                  </SideNavItems>
                </SideNav>
                )}
              </>
            )}
          </Header>
        </>
      )}
    />
  );
};