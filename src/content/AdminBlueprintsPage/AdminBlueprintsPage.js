import React, {useState, useEffect} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {Content} from '@carbon/react';

export default function AdminBlueprintsPage() {

  return (
    <>
      <AdminHeader activeSideBarItem="blueprints"/>
      <Content className='pageContent'>
        <div>
          Blueprints Page
        </div>
      </Content>
    </>
  )

}