import React, { useEffect, useState } from 'react';
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
  SkipToContent
} from '@carbon/react';

import {
  Fade, 
  Notification,
  Search,
  UserAvatar 
} from '@carbon/icons-react'

export default function GlobalHeaderCarbon(props) {
  
  const [officeList, setOfficeList] = useState([{officeId:'1',officeName:"test"}])

  useEffect(() => {setOfficeList(props.officeList)},[props.officeList])
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
          <HeaderName href="/" prefix="ERVA">
            [Emergency Response Visual Aid]
          </HeaderName>
          <HeaderGlobalBar>
            <HeaderGlobalAction
              aria-label="Search"
              onClick={() => {}}>
              <Search size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Notifications"
              onClick={() => {}}>
              <Notification size={20} />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              aria-label="Account"
              onClick={() => {}}
              tooltipAlignment="end">
              <UserAvatar size={20} />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
          <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
            <SideNavItems>
            {
              props.officeList && (props.officeList.map(office => (
                <SideNavLink
                  key={office.id}
                  onClick={() => {}}
                  children={office.name}
                />
              )))
            }
            </SideNavItems>
          </SideNav>
        </Header>
      </>
    )}
  />
  );
};
