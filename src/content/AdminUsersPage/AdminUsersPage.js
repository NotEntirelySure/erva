import React, {useState, useEffect, useRef} from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  Button,
  ButtonSet,
  ComboBox,
  Content,
  DataTable,
  DataTableSkeleton,
  Form,
  Modal,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TextInput,
  Tile,
  Toggle
} from '@carbon/react';
import {
  Add,
  Caution,
  CheckmarkFilled,
  CircleFill,
  CloseOutline,
  Edit,
  Misuse,
  TrashCan
} from '@carbon/react/icons';

import { Transfer } from 'antd';

export default function AdminUsersPage() {

  const usersHeader = [
    {key:'userId', header:'User ID'},
    {key:'firstName', header:'First Name'},
    {key:'lastName', header:'Last Name'},
    {key:'email', header:'E-mail'},
    {key:'createdAt', header:'Created At'},
    {key:'roleName', header:'Role'},
    {key:'accountTypeName', header:'Account Type'},
    {key:'verifiedStatus', header:'Verified'},
    {key:'enabledStatus', header:'Enabled'},
    {key:'action', header:'Action'}
  ]

  const userToDelete = useRef({userId:'',name:''});

  const [showDataTable, setShowDataTable] = useState('none');
  const [showTableSkeleton, setShowTableSekeleton] = useState('block');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [showRightPane, setShowRightPane] = useState('translateX(60rem)');
  const [userRoles, setUserRoles] = useState([{roleId:0,roleName:''}]);
  const [transferElementTarget, setTransferElementTarget] = useState([]);
  const [transferElementSource, setTransferElementSource] = useState([]);
  const [editUserData, setEditUserData] = useState({
    userId:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    role:'',
    accountType:''
  });
  const [users, setUsers] = useState([{
    id:'0',
    userId:0,
    firstName:'',
    lastName:'',
    email:'',
    createdAt:'',
    enabled:false,
    verified:false,
    roleId:0,
    roleName:'',
    accountTypeId:0,
    accountTypeName:'',
    action:''
  }]);

  useEffect(() => {GetUsers();},[]);
  useEffect(() => {
    if (editUserData.userId !== 0) {
      GetRoles();
      GetUserPermissions();
    }
  },[editUserData]);

  async function GetUsers() {
    if (showDataTable === 'block') setShowDataTable('none');
    if (showTableSkeleton === 'none') setShowTableSekeleton('block');
    const query = `
      query {
        getUsers {
          id
          firstName
          lastName
          email
          createdAt
          enabled
          verified
          role {
            id
            name
          }
          accountType {
            id
            name
          }
        }
      }
    `;
    const usersRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/graphql`, {
      mode:'cors',
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({query})
    });
    const usersResponse = await usersRequest.json();
    if (usersResponse.data) {
      const users = usersResponse.data.getUsers.map((user, index) => (
        {
          id:String(index),
          userId:user.id,
          firstName:user.firstName,
          lastName:user.lastName,
          email:user.email,
          createdAt:user.createdAt,
          roleName:user.role.name,
          accountTypeName:user.accountType.name,
          enabled:user.enabled,
          enabledStatus:user.enabled ? 
            <div style={{display:'flex',alignItems:'center'}}><CircleFill fill='green'/>Yes</div>
            :
            <div style={{display:'flex',alignItems:'center'}}><Caution fill='red'/>No</div>,
          verified:user.verified,
          verifiedStatus:user.verified ? 
            <div style={{display:'flex',alignItems:'center'}}><CheckmarkFilled fill='green'/>Yes</div>
            :
            <div style={{display:'flex',alignItems:'center'}}><Misuse fill='red'/>No</div>,
          action:<>
            <div style={{display:'flex', gap:'0.125rem'}}>
              <Button
                hasIconOnly
                kind='ghost'
                renderIcon={Edit}
                iconDescription='Edit'
                onClick={() => {
                  setEditUserData({
                    userId:user.id,
                    firstName:user.firstName,
                    lastName:user.lastName,
                    email:user.email,
                    createdAt:user.createdAt,
                    enabled:user.enabled,
                    verified:user.verified,
                    role:{
                      roleId:user.role.id,
                      roleName:user.role.name
                    },
                    accountType:''
                  })
                  setShowRightPane('translateX(0rem)');
                }}
              />
              <Button
                hasIconOnly
                kind='danger--ghost'
                renderIcon={TrashCan}
                iconDescription='Delete'
                onClick={() => {
                  userToDelete.current = {
                    userId:user.id,
                    name:`${user.firstName} ${user.lastName}`
                  };
                  setDeleteModalOpen(true);
                }}
              />
            </div>
          </>
        }
      ));
      setUsers(users);
      setShowDataTable('block');
      setShowTableSekeleton('none');
    };
    if (usersResponse.errors) {
      setErrorInfo({
        heading:`Error: ${usersResponse.errors.code}`,
        message:usersResponse.errors.message
      })
      setErrorModalOpen(true);
    }
  }

  async function GetRoles() {
    const query = `
      query {
        getRoles {
          id
          name
        }
      }
    `;
    const rolesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/graphql`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: "application/json"
      },
      body:JSON.stringify({query})
    });
    const rolesResponse = await rolesRequest.json();
    if (rolesResponse.data) {
      const roles = rolesResponse.data.getRoles.map(role => (
        {
          roleId:role.id,
          roleName:role.name
        }
      ));
      setUserRoles(roles);
    };
    if (rolesResponse.errors) {
      setErrorInfo({heading:`Error`,message:rolesResponse.errors[0].message});
      setErrorModalOpen(true);
    };
  };

  async function DeleteUser() {
    const query = `
      mutation {
        deleteUser(userId: ${userToDelete.current.userId}) {
          success
          errorCode
          errorMessage
        }
      }
    `;
    if (deleteModalOpen) setDeleteModalOpen(false);
    const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/graphql`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: "application/json"
      },
      body:JSON.stringify({query})
    });
    const deleteResponse = await deleteRequest.json();
    userToDelete.current = {userId:'',name:''};
    if (deleteResponse.data.deleteUser.success) GetUsers();
    if (!deleteResponse.data.deleteUser.success) {
      setErrorInfo({
        heading:`Error: ${deleteResponse.data.deleteUser.errorCode}`,
        message:deleteResponse.data.deleteUser.errorMessage
      });
      setErrorModalOpen(true);
    };
    if (deleteResponse.errors) {
      setErrorInfo({heading:`Error`,message:deleteResponse.errors[0].message});
      setErrorModalOpen(true);
    }
  };

  async function GetUserPermissions () {
    const query = `
      query {
        getUserPermissions(userId: ${editUserData.userId}) {
          permissionId
          facilityId
          facilityName
          facilityCity
        }
        getFacilities (getImages: false){
          facilityId
          name
          city
        }
      }
    `;

    const permissionsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/graphql`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: 'application/json'
      },
      body:JSON.stringify({ query })
    });
    const permissionsResponse = await permissionsRequest.json();
    if (permissionsResponse.data) {
      const userPermissions = permissionsResponse.data.getUserPermissions;
      const facilitySource = permissionsResponse.data.getFacilities;
      const targetPermissions = [];
      facilitySource.forEach(facility => {
        facility["key"] = String(facility.facilityId);
        facility["title"] = `${facility.name}${facility.city ? ` (${facility.city})`:''}`
        const matchingPermission = userPermissions.find(permission => permission.facilityId === facility.facilityId);
        if (matchingPermission) {
          targetPermissions.push(facility.key);
          Object.assign(facility, {permissionId: matchingPermission.permissionId});
        };
      })
      console.log(facilitySource);
      setTransferElementTarget(targetPermissions);
      setTransferElementSource(facilitySource);
    };
    if (permissionsResponse.errors) {
      setErrorInfo({heading:`Error`,message:permissionsResponse.errors[0].message});
      setErrorModalOpen(true);
    };
  }

  async function saveUserData() {

    const addPermissions = [];
    const deletePermissions = [];

    transferElementSource.forEach(permission => {
      if (transferElementTarget.includes(permission.key) && !permission.permissionId) {
        addPermissions.push({
          userId: parseInt(editUserData.userId),
          facilityId:parseInt(permission.facilityId)
        });
        return;
      };
      if (!transferElementTarget.includes(permission.key) && permission.permissionId) {
        deletePermissions.push({permissionId:parseInt(permission.permissionId)});
      };
    });

    const query = `
      mutation ($addValues: [addPermission]!, $deleteValues: [deletePermission]!) {
        addUserPermissions(addValues: $addValues) {
          success
          userId
          errorCode
          errorMessage
        }
        deleteUserPermissions(deleteValues: $deleteValues) {
          success
          permissionId
          errorCode
          errorMessage
        }
      }
    `;
    console.log(query);
    const saveDataRequest = fetch(`${process.env.REACT_APP_API_BASE_URL}/graphql`, {
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept: 'application/json'
      },
      body:JSON.stringify({ 
        query,
        variables: {
          addValues: addPermissions,
          deleteValues: deletePermissions
        }
      })
    })
    const saveDataResponse = await saveDataRequest.json();
    console.log(saveDataResponse);
    CloseRightPane();
  };

  function CloseRightPane() {
    setShowRightPane('translateX(60rem)');
    setEditUserData({
      userId:0,
      firstName:'',
      lastName:'',
      email:'',
      createdAt:'',
      enabled:false,
      verified:false,
      role:{roleId:0,roleName:''},
      accountType:''
    })
  }

  return (
    <>
      <Modal
        id='ErrorModal'
        size='sm'
        open={errorModalOpen}
        modalLabel={errorInfo.heading}
        modalHeading={errorInfo.message}
        modalAriaLabel='error modal'
        primaryButtonText='Ok'
        onRequestClose={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
        onRequestSubmit={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
      />
      <Modal
        id='confirmDelete'
        danger
        size='xs'
        open={deleteModalOpen}
        modalLabel='Confirm Delete'
        modalHeading={`Are you sure you want to delete ${userToDelete.current.name}?`}
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => {
          userToDelete.current = {userId:'',name:''};
          setDeleteModalOpen(false);
        }}
        onRequestSubmit={() => DeleteUser()}
      />
      <AdminHeader activeSideBarItem="users"/>
      <Content className='pageContent'>
        <div style={{display:showDataTable}}> 
          <DataTable rows={users} headers={usersHeader} isSortable>
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getTableProps,
              getToolbarProps,
              onInputChange,
            }) => (
              <TableContainer 
                title='Users'
                description='Displays a list of all users registered in the database.'
              >
                <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                  <TableToolbarContent>
                    <TableToolbarSearch onChange={onInputChange}/>
                  </TableToolbarContent>
                </TableToolbar>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map(header => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map(cell => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
        <div style={{display:showTableSkeleton}}>
          <DataTableSkeleton
            showHeader
            showToolbar
            headers={usersHeader}
          />
        </div>
        <div className='rightPane' style={{transform:showRightPane}}>
          <div className='closeButtonContainer'>
            <div>
              
            </div>
          </div>
          <div className='rightPaneContent'>
            <div>
              <p><strong>{`${editUserData.firstName} ${editUserData.lastName}`}</strong></p>
            </div>
            <hr/>
            <Form>
              <Stack gap={5}>
                <div style={{display:'flex', gap:'2rem'}}>
                  <TextInput
                    id="fName"
                    labelText="First Name"
                    value={editUserData.firstName}
                    onChange={event => setEditUserData(previousState => ({...previousState, firstName:event.target.value}))}
                  />
                  <TextInput
                    id="lName"
                    labelText="Last Name"
                    value={editUserData.lastName}
                    onChange={event => setEditUserData(previousState => ({...previousState, lastName:event.target.value}))}
                  />
                </div>
                <TextInput
                  id="email"
                  readyOnly
                  labelText="E-mail Address"
                  value={editUserData.email}
                />
                <TextInput
                  id="createdAt"
                  readyOnly
                  labelText="Account Created"
                  value={editUserData.createdAt}
                />
                <div style={{display:'flex', justifyContent:'space-evenly'}}>
                  <div style={{width:'50%'}}>

                  <Tile id="status">
                    Account Status
                    <hr/>
                    <div style={{display:'flex',gap:'1rem',flexDirection:'column'}}>
                      <Toggle 
                        id='accountEnabled'
                        labelText="Account Login"
                        labelA="Disabled"
                        labelB="Enabled"
                        toggled={editUserData.enabled}
                        onToggle={event => setEditUserData(previousState => ({...previousState, enabled:event}))}
                      />
                      <Toggle 
                        id='accountVerified'
                        labelText="Account Verified"
                        labelA="Unverified"
                        labelB="Verified"
                        toggled={editUserData.verified}
                        onToggle={event => setEditUserData(previousState => ({...previousState, verified:event}))}
                      />
                    </div>
                  </Tile>
                  </div>
                  <ComboBox
                    id="userRole"
                    titleText="Account Role"
                    label="Select"
                    items={userRoles}
                    selectedItem={editUserData.role}
                    itemToString={item => (item ? item.roleName : '')}
                    onChange={event => setEditUserData(previousState => ({...previousState, role:event.selectedItem}))}
                  />
                </div>
                <div className='userPermissions'>
                <Transfer
                  listStyle={{width:'15vw', minWidth:'10rem', height:'25rem'}}
                  dataSource={transferElementSource}
                  showSearch
                  targetKeys={transferElementTarget}
                  onChange={item => {
                    console.log(item);
                    setTransferElementTarget(item);
                  }}
                  onSearch={() => {}}
                  render={item => item.title}
                  titles={['Available Permissions','Assigned Permissions']}
                />

                </div>
                <div><hr/></div>
                <ButtonSet>
                  <Button onClick={() => saveUserData()} kind="primary">Save</Button>
                  <Button onClick={() => CloseRightPane()} kind="secondary">Close</Button>
                </ButtonSet>
              </Stack>
            </Form>
          </div>
        </div>
      </Content>
    </>
  )
}