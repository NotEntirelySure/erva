import React, { useState, useEffect} from 'react';
import {
  Header,
  HeaderContainer,
  HeaderMenuButton,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent
} from '@carbon/react';
import { Building, ChartRelationship, Floorplan, UserAdmin } from '@carbon/react/icons';

export default function AdminHeader(props) {

  const [usersActive, setUsersActive] = useState(false);
  const [organizationsActive, setOrganizationsActive] = useState(false);
  const [facilitiesActive, setFacilitiesActive] = useState(false);
  const [blueprintsActive, setBlueprintsActive] = useState(false);

  useEffect(() => {
    switch (props.activeSideBarItem) {
      case 'users':
        setUsersActive(true);
        setOrganizationsActive(false);
        setFacilitiesActive(false);
        setBlueprintsActive(false);
        break;
      case 'organizations':
        setUsersActive(false);
        setOrganizationsActive(true);
        setFacilitiesActive(false);
        setBlueprintsActive(false);
        break;
      case 'facilities':
        setUsersActive(false);
        setOrganizationsActive(false);
        setFacilitiesActive(true);
        setBlueprintsActive(false);
        break;
      case 'blueprints':
        setUsersActive(false);
        setOrganizationsActive(false);
        setFacilitiesActive(false);
        setBlueprintsActive(true);
        break;
    }
  },[props])

  return (
    <>
    <HeaderContainer
    render={({ isSideNavExpanded, onClickSideNavExpand }) => (
      <>
          <Header aria-label="IBM Platform Name">
            <SkipToContent />
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
              />
            <HeaderName href="/adminlogin" prefix="ERVA">
              [Admin Portal]
            </HeaderName>
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              onSideNavBlur={onClickSideNavExpand}>
              <SideNavItems>               
                <SideNavLink
                  renderIcon={UserAdmin}
                  isActive={usersActive}
                  href="/adminusers">
                  Users
                </SideNavLink>
                <SideNavLink
                  renderIcon={ChartRelationship}
                  isActive={organizationsActive}
                  href="/adminorganizations">
                  Organizations
                </SideNavLink>
                <SideNavLink
                  renderIcon={Building}
                  isActive={facilitiesActive}
                  href="/adminfacilities">
                  Facilities
                </SideNavLink>
                <SideNavLink
                  renderIcon={Floorplan}
                  isActive={blueprintsActive}
                  href="/adminblueprints">
                  Blueprints
                </SideNavLink>
              </SideNavItems>
            </SideNav>
          </Header>
        </>
      )}
      />
    </>
  );
}