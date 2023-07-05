import React, {useState, useEffect} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {Content} from '@carbon/react';

export default function AdminUsersPage() {

  return (
    <>
      <AdminHeader activeSideBarItem="users"/>
      <Content className='pageContent'>
        <div>
          Users Page
        </div>
      </Content>
    </>
  )

}